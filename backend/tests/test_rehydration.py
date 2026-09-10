import time

from app.services.rehydration.rehydrator import rehydrate
from app.services.session_store import Session
from app.services.tokenization.tokenizer import get_or_create_token


def _session() -> Session:
    return Session(id="s1", created_at=time.time(), expires_at=time.time() + 3600, ttl_seconds=3600)


def test_valid_token_restores_original_value():
    session = _session()
    token = get_or_create_token(session, "PERSON", "Aydin Huseynov")
    text, warnings = rehydrate(session, f"The employee {token} was promoted.")
    assert text == "The employee Aydin Huseynov was promoted."
    assert warnings == []


def test_unknown_token_is_never_replaced():
    session = _session()
    get_or_create_token(session, "PERSON", "Aydin Huseynov")
    text, warnings = rehydrate(session, "See [PERSON_99] for details.")
    assert "[PERSON_99]" in text
    assert "Aydin" not in text
    assert any("PERSON_99" in w for w in warnings)


def test_multiple_tokens_all_restored():
    session = _session()
    p = get_or_create_token(session, "PERSON", "Aydin Huseynov")
    f = get_or_create_token(session, "FINANCE", "5,000 AZN")
    e = get_or_create_token(session, "EMAIL", "aydin@example.com")
    text, warnings = rehydrate(session, f"{p} earns {f}, contact: {e}")
    assert text == "Aydin Huseynov earns 5,000 AZN, contact: aydin@example.com"
    assert warnings == []


def test_repeated_token_restores_every_occurrence():
    session = _session()
    token = get_or_create_token(session, "PERSON", "Aydin Huseynov")
    text, _ = rehydrate(session, f"{token} signed the form. {token} also witnessed it.")
    assert text.count("Aydin Huseynov") == 2
    assert token not in text
