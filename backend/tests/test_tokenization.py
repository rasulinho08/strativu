import time

from app.services.session_store import Session
from app.services.tokenization.tokenizer import get_or_create_token


def _session() -> Session:
    return Session(id="s1", created_at=time.time(), expires_at=time.time() + 3600, ttl_seconds=3600)


def test_same_value_returns_same_token():
    session = _session()
    t1 = get_or_create_token(session, "PERSON", "Aydin Huseynov")
    t2 = get_or_create_token(session, "PERSON", "Aydin Huseynov")
    assert t1 == t2 == "[PERSON_1]"


def test_same_value_case_insensitive_returns_same_token():
    session = _session()
    t1 = get_or_create_token(session, "PERSON", "Aydin Huseynov")
    t2 = get_or_create_token(session, "PERSON", "  aydin huseynov  ")
    assert t1 == t2


def test_different_values_get_different_tokens():
    session = _session()
    t1 = get_or_create_token(session, "PERSON", "Aydin Huseynov")
    t2 = get_or_create_token(session, "PERSON", "Leyla Aliyeva")
    assert t1 != t2
    assert t1 == "[PERSON_1]"
    assert t2 == "[PERSON_2]"


def test_categories_have_independent_counters():
    session = _session()
    person_token = get_or_create_token(session, "PERSON", "Aydin Huseynov")
    email_token = get_or_create_token(session, "EMAIL", "aydin@example.com")
    assert person_token == "[PERSON_1]"
    assert email_token == "[EMAIL_1]"


def test_mapping_is_stored_for_rehydration():
    session = _session()
    token = get_or_create_token(session, "FINANCE", "5,000 AZN")
    assert session.token_to_value[token] == "5,000 AZN"
