import asyncio

import pytest

from app.services.session_store import SessionNotFoundError, SessionStore
from app.services.tokenization.tokenizer import get_or_create_token


@pytest.mark.asyncio
async def test_session_expires_after_ttl():
    store = SessionStore()
    session = await store.create(ttl_seconds=0)
    await asyncio.sleep(0.01)
    with pytest.raises(SessionNotFoundError):
        await store.get(session.id)


@pytest.mark.asyncio
async def test_touch_extends_expiry():
    store = SessionStore()
    session = await store.create(ttl_seconds=3600)
    original_expiry = session.expires_at
    await asyncio.sleep(0.01)
    session.touch()
    assert session.expires_at > original_expiry


@pytest.mark.asyncio
async def test_destroy_session_removes_it_immediately():
    store = SessionStore()
    session = await store.create(ttl_seconds=3600)
    await store.delete(session.id)
    with pytest.raises(SessionNotFoundError):
        await store.get(session.id)


@pytest.mark.asyncio
async def test_sweep_expired_removes_only_expired_sessions():
    store = SessionStore()
    expired = await store.create(ttl_seconds=0)
    alive = await store.create(ttl_seconds=3600)
    await asyncio.sleep(0.01)
    await store.sweep_expired()

    with pytest.raises(SessionNotFoundError):
        await store.get(expired.id)
    assert (await store.get(alive.id)).id == alive.id


@pytest.mark.asyncio
async def test_token_mappings_are_isolated_between_sessions():
    store = SessionStore()
    session_a = await store.create(ttl_seconds=3600)
    session_b = await store.create(ttl_seconds=3600)

    token_a = get_or_create_token(session_a, "PERSON", "Aydin Huseynov")
    token_b = get_or_create_token(session_b, "PERSON", "Aydin Huseynov")

    assert token_a == token_b == "[PERSON_1]"
    assert session_a.token_to_value is not session_b.token_to_value

    # Mutating one session's mapping must never affect the other's.
    get_or_create_token(session_a, "EMAIL", "aydin@example.com")
    assert "EMAIL" not in session_b.category_counters
