from fastapi import APIRouter

from app.api.deps import get_session_or_404
from app.models.schemas import SecurityStatusResponse

router = APIRouter(prefix="/api/security", tags=["security"])


@router.get("/status/{session_id}", response_model=SecurityStatusResponse)
async def security_status(session_id: str):
    session = await get_session_or_404(session_id)
    return SecurityStatusResponse(
        session_id=session.id,
        findings_total=len(session.findings),
        approved_count=len(session.approved_ids),
        external_transmission="sanitized" if session.document_injected else "not_sent",
        expires_in_seconds=session.expires_in_seconds,
        checklist={
            "dlp_scan_complete": len(session.findings) > 0,
            "human_approval_complete": len(session.approved_ids) > 0,
            "values_tokenized": session.is_sanitized,
            "external_payload_sanitized": session.is_sanitized,
        },
    )
