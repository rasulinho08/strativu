"""Server-side rehydration. The original values never leave this process:
callers only ever get back the fully rehydrated text, never the mapping.
"""

from app.services.rehydration.integrity import validate
from app.services.session_store import Session


def rehydrate(session: Session, text: str) -> tuple[str, list[str]]:
    expected_tokens = set(session.token_to_value.keys())
    result = validate(expected_tokens, text)

    output = text
    for raw, canonical in result.normalized_replacements.items():
        output = output.replace(raw, canonical)

    rehydratable = result.rehydratable_tokens | set(result.normalized_replacements.values())
    for token in rehydratable:
        value = session.token_to_value.get(token)
        if value is not None:
            output = output.replace(token, value)

    return output, result.warnings
