from fastapi import APIRouter

from app.api.deps import get_session_or_404
from app.core.audit import audit
from app.core.config import get_settings
from app.models.schemas import SessionCreateResponse, SessionStatusResponse
from app.services.session_store import session_store

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=SessionCreateResponse)
async def create_session():
    settings = get_settings()
    session = await session_store.create(settings.session_ttl_seconds)
    audit("SESSION_CREATED", session.id)
    return SessionCreateResponse(
        session_id=session.id,
        expires_at=session.expires_at,
        ttl_seconds=session.ttl_seconds,
    )


@router.get("/{session_id}", response_model=SessionStatusResponse)
async def get_session_status(session_id: str):
    session = await get_session_or_404(session_id)
    return SessionStatusResponse(
        session_id=session.id,
        expires_in_seconds=session.expires_in_seconds,
        findings_total=len(session.findings),
        approved_count=len(session.approved_ids),
        has_document=session.document is not None,
        is_sanitized=session.is_sanitized,
    )


@router.delete("/{session_id}", status_code=204)
async def destroy_session(session_id: str):
    await session_store.delete(session_id)
    audit("SESSION_DESTROYED", session_id)
    return None
