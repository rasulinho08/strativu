import uuid
from collections import Counter

from fastapi import APIRouter, HTTPException

from app.api.deps import get_session_or_404
from app.core.audit import audit
from app.models.schemas import (
    ApproveRequest,
    ApproveResponse,
    Finding,
    ManualFindingRequest,
    ScanResponse,
)
from app.services.dlp.engine import scan_document

router = APIRouter(prefix="/api/dlp", tags=["dlp"])


def _scan_response(session) -> ScanResponse:
    findings = list(session.findings.values())
    counts = Counter(f.category for f in findings)
    return ScanResponse(session_id=session.id, findings=findings, category_counts=dict(counts))


@router.post("/scan", response_model=ScanResponse)
async def scan(session_id: str):
    session = await get_session_or_404(session_id)
    if session.document is None:
        raise HTTPException(status_code=400, detail="Upload a document before scanning.")

    findings = scan_document(session.document)
    session.findings = {f.id: f for f in findings}
    session.approved_ids = set()

    audit("DLP_SCAN_COMPLETED", session.id, findings_count=len(findings))
    return _scan_response(session)


@router.get("/findings/{session_id}", response_model=ScanResponse)
async def get_findings(session_id: str):
    session = await get_session_or_404(session_id)
    return _scan_response(session)


@router.post("/manual", response_model=Finding)
async def add_manual_finding(payload: ManualFindingRequest):
    session = await get_session_or_404(payload.session_id)
    finding = Finding(
        id=f"finding_{uuid.uuid4().hex[:10]}",
        category=payload.category,
        value=payload.value,
        confidence=1.0,
        source="manual",
        location=payload.location,
    )
    session.findings[finding.id] = finding
    return finding


@router.post("/approve", response_model=ApproveResponse)
async def approve_findings(payload: ApproveRequest):
    session = await get_session_or_404(payload.session_id)
    valid_ids = {fid for fid in payload.approved_finding_ids if fid in session.findings}
    session.approved_ids = valid_ids

    audit(
        "MASKING_APPROVED",
        session.id,
        approved_count=len(valid_ids),
        rejected_count=len(session.findings) - len(valid_ids),
    )
    return ApproveResponse(
        session_id=session.id,
        approved_count=len(valid_ids),
        rejected_count=len(session.findings) - len(valid_ids),
    )
