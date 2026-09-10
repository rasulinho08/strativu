from fastapi import HTTPException

from app.services.session_store import Session, SessionNotFoundError, session_store


async def get_session_or_404(session_id: str) -> Session:
    """Resolve a session, touching its TTL. Call directly with whatever
    session_id was supplied (path, query, or request body) — not wired as a
    FastAPI Depends() since the id can arrive via any of those.
    """
    try:
        session = await session_store.get(session_id)
    except SessionNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail="This session was not found or has expired. Please start a new session.",
        ) from exc
    session.touch()
    return session
