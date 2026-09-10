"""Hybrid-ready DLP detectors.

This MVP ships regex/heuristic detectors behind a common ``Detector``
interface. The interface is deliberately narrow (``text -> list[Span]``) so
higher-recall detectors (Microsoft Presidio, spaCy NER models) can be added
later as additional ``Detector`` implementations without touching the scan
engine, tokenizer, or API layer.
"""

import re
from dataclasses import dataclass
from typing import Protocol


@dataclass
class Span:
    category: str
    start: int
    end: int
    value: str
    confidence: float
    source: str  # "regex" | "heuristic"


class Detector(Protocol):
    def detect(self, text: str) -> list[Span]: ...


class RegexDetector:
    def __init__(self, category: str, pattern: str, confidence: float, flags: int = 0):
        self.category = category
        self.regex = re.compile(pattern, flags)
        self.confidence = confidence

    def detect(self, text: str) -> list[Span]:
        return [
            Span(
                category=self.category,
                start=m.start(),
                end=m.end(),
                value=m.group(0),
                confidence=self.confidence,
                source="regex",
            )
            for m in self.regex.finditer(text)
        ]


def _luhn_valid(digits: str) -> bool:
    total = 0
    for i, ch in enumerate(reversed(digits)):
        d = int(ch)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


class CreditCardDetector:
    category = "CREDIT_CARD"
    _pattern = re.compile(r"\b(?:\d[ -]?){13,19}\b")

    def detect(self, text: str) -> list[Span]:
        spans = []
        for m in self._pattern.finditer(text):
            digits = re.sub(r"[ -]", "", m.group(0))
            if 13 <= len(digits) <= 19 and _luhn_valid(digits):
                spans.append(
                    Span(
                        category=self.category,
                        start=m.start(),
                        end=m.end(),
                        value=m.group(0),
                        confidence=0.95,
                        source="regex",
                    )
                )
        return spans


class PersonHeuristicDetector:
    """First-pass NER approximation: consecutive Title-Case tokens.

    A real deployment should replace/augment this with Presidio + spaCy NER
    per the architecture doc; this heuristic exists so the human review step
    has something concrete to work with in an MVP with no ML dependencies.
    """

    category = "PERSON"
    _pattern = re.compile(r"\b[A-ZƏÖÜİĞÇŞ][a-zçğıöşüə]+(?:\s+[A-ZƏÖÜİĞÇŞ][a-zçğıöşüə]+){1,2}\b")
    _stopwords = {
        "Dear Sir",
        "Best Regards",
        "Yours Sincerely",
        "Table Of",
    }

    def detect(self, text: str) -> list[Span]:
        spans = []
        for m in self._pattern.finditer(text):
            value = m.group(0)
            if value in self._stopwords:
                continue
            spans.append(
                Span(
                    category=self.category,
                    start=m.start(),
                    end=m.end(),
                    value=value,
                    confidence=0.55,
                    source="heuristic",
                )
            )
        return spans


def default_detectors() -> list[Detector]:
    return [
        RegexDetector(
            "EMAIL",
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
            confidence=0.98,
        ),
        RegexDetector(
            # Requires an explicit "+country" prefix or parenthesized area
            # code, so plain unformatted digit runs (e.g. ID numbers) are
            # left to the ID_NUMBER detector instead of colliding here.
            "PHONE",
            r"\+\d{1,3}(?:[\s.-]?\d{2,4}){2,5}|\(\d{2,4}\)[\s.-]?\d{2,4}(?:[\s.-]?\d{2,4}){0,3}",
            confidence=0.8,
        ),
        RegexDetector(
            "BANK_ACCOUNT",
            r"\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b",
            confidence=0.9,
        ),
        RegexDetector(
            "FINANCE",
            r"\b(?:[$€₼£]\s?\d[\d,]*(?:\.\d{2})?|\d[\d,]*(?:\.\d{2})?\s?(?:AZN|USD|EUR|GBP|manat|dollars?)\b)",
            confidence=0.85,
            flags=re.IGNORECASE,
        ),
        RegexDetector(
            "DATE_OF_BIRTH",
            r"\b(?:0[1-9]|[12]\d|3[01])[./-](?:0[1-9]|1[0-2])[./-](?:19|20)\d{2}\b",
            confidence=0.6,
        ),
        RegexDetector(
            "ID_NUMBER",
            r"\b\d{7,12}\b",
            confidence=0.5,
        ),
        CreditCardDetector(),
        PersonHeuristicDetector(),
    ]
