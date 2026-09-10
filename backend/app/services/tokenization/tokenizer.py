"""Deterministic, session-scoped tokenization.

The same (category, normalized value) always maps to the same placeholder
token within a session; different values always get different tokens. The
mapping lives only on the server-side session and is never sent to the
frontend.
"""

from app.services.session_store import Session

TOKEN_PATTERN = r"\[[A-Z_]+_\d+\]"


def _normalize(value: str) -> str:
    return value.strip().lower()


def get_or_create_token(session: Session, category: str, value: str) -> str:
    key = (category, _normalize(value))
    existing = session.value_to_token.get(key)
    if existing:
        return existing

    next_index = session.category_counters.get(category, 0) + 1
    session.category_counters[category] = next_index
    token = f"[{category}_{next_index}]"

    session.value_to_token[key] = token
    session.token_to_value[token] = value
    return token
