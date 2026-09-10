"""Scan orchestration: runs detectors over a ParsedDocument and produces Findings.

Detection and masking are kept strictly separate here: this module only
produces candidate findings. Nothing is redacted until a human approves it
(see services/tokenization/sanitizer.py).
"""

import uuid

from app.models.schemas import Finding, Location
from app.services.dlp.detectors import Detector, Span, default_detectors
from app.services.document_model import ParsedDocument


def _dedupe(spans: list[Span]) -> list[Span]:
    """Drop lower-confidence spans that overlap a higher-confidence one."""
    spans = sorted(spans, key=lambda s: (-s.confidence, s.start))
    kept: list[Span] = []
    for span in spans:
        if any(not (span.end <= k.start or span.start >= k.end) for k in kept):
            continue
        kept.append(span)
    return sorted(kept, key=lambda s: s.start)


def scan_document(document: ParsedDocument, detectors: list[Detector] | None = None) -> list[Finding]:
    detectors = detectors or default_detectors()
    findings: list[Finding] = []

    if document.is_tabular:
        for sheet in document.sheets:
            for row_idx, row in enumerate(sheet.rows):
                for col_idx, cell in enumerate(row):
                    if not cell:
                        continue
                    spans: list[Span] = []
                    for detector in detectors:
                        spans.extend(detector.detect(cell))
                    for span in _dedupe(spans):
                        column_name = sheet.columns[col_idx] if col_idx < len(sheet.columns) else None
                        findings.append(
                            Finding(
                                id=f"finding_{uuid.uuid4().hex[:10]}",
                                category=span.category,
                                value=span.value,
                                confidence=span.confidence,
                                source=span.source,  # type: ignore[arg-type]
                                location=Location(
                                    sheet=sheet.name,
                                    row=row_idx,
                                    col=col_idx,
                                    column_name=column_name,
                                    start=span.start,
                                    end=span.end,
                                ),
                            )
                        )
    else:
        for block in document.blocks:
            if not block.text:
                continue
            spans = []
            for detector in detectors:
                spans.extend(detector.detect(block.text))
            for span in _dedupe(spans):
                findings.append(
                    Finding(
                        id=f"finding_{uuid.uuid4().hex[:10]}",
                        category=span.category,
                        value=span.value,
                        confidence=span.confidence,
                        source=span.source,  # type: ignore[arg-type]
                        location=Location(block_index=block.index, start=span.start, end=span.end),
                    )
                )

    return findings
