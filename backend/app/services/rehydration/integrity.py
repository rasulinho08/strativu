"""Token integrity validation.

Before any placeholder token is rehydrated back into a real value, we verify
that the token the AI returned is exactly one we issued. The only automatic
correction allowed is a strict, format-only normalization (bracket/underscore
punctuation) that cannot change which category or index the token refers to.
Anything else — an unrecognized token, or a near-token we can't confidently
reconstruct — is left untouched and reported as a warning. We never use
fuzzy/similarity matching against the *content* of a token: this is a
security boundary, not a place to guess.
"""

import re
from dataclasses import dataclass, field

TOKEN_RE = re.compile(r"\[[A-Z_]+_\d+\]")
# A "near token": same [WORD separator digits] shape but with a wrong
# separator or missing bracket(s) — nothing about the letters/digits changes.
NEAR_TOKEN_RE = re.compile(r"\[?([A-Z]+)[ _]([0-9]+)\]?")


@dataclass
class IntegrityResult:
    rehydratable_tokens: set[str]
    normalized_replacements: dict[str, str] = field(default_factory=dict)  # raw text -> canonical token
    warnings: list[str] = field(default_factory=list)


def validate(expected_tokens: set[str], response_text: str) -> IntegrityResult:
    found_exact = set(TOKEN_RE.findall(response_text))
    unknown = found_exact - expected_tokens
    safe = found_exact & expected_tokens
    warnings: list[str] = []
    normalized: dict[str, str] = {}

    for token in sorted(unknown):
        warnings.append(
            f'⚠ Token integrity warning: the AI returned "{token}", which does not match any '
            "token issued for this session. It has not been restored."
        )

    for m in NEAR_TOKEN_RE.finditer(response_text):
        raw = m.group(0)
        if raw in found_exact:
            continue
        candidate = f"[{m.group(1)}_{m.group(2)}]"
        if candidate in expected_tokens:
            normalized[raw] = candidate
            warnings.append(
                f'Token formatting was auto-corrected: "{raw}" was interpreted as {candidate} '
                "(punctuation-only difference)."
            )
        else:
            warnings.append(
                f'⚠ Token integrity warning: the AI modified a token near "{raw}". Review is '
                "required before any sensitive data is restored for it."
            )

    return IntegrityResult(rehydratable_tokens=safe, normalized_replacements=normalized, warnings=warnings)
