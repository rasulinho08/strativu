from fastapi import APIRouter, HTTPException, UploadFile

from app.api.deps import get_session_or_404
from app.core.audit import audit
from app.core.config import get_settings
from app.models.schemas import (
    RehydrateRequest,
    RehydrateResponse,
    SanitizeResponse,
    TextUploadRequest,
    UploadResponse,
)
from app.services.parsers import UnsupportedFileTypeError, parse_upload
from app.services.parsers.text_parser import parse_text
from app.services.rehydration.rehydrator import rehydrate
from app.services.tokenization.sanitizer import sanitize_session

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_EXTENSIONS = (".txt", ".docx", ".xlsx", ".csv")


def _reset_document_state(session, document) -> None:
    session.document = document
    session.findings = {}
    session.approved_ids = set()
    session.sanitized_text = None
    session.sanitized_table = None
    session.document_injected = False


@router.post("/upload", response_model=UploadResponse)
async def upload_document(session_id: str, file: UploadFile):
    session = await get_session_or_404(session_id)
    settings = get_settings()

    if not file.filename or not file.filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Unsupported file type. Allowed: .txt, .docx, .xlsx, .csv")

    content = await file.read()
    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the {settings.max_file_size_mb}MB upload limit.",
        )

    try:
        document = parse_upload(file.filename, content)
    except UnsupportedFileTypeError as exc:
        raise HTTPException(status_code=400, detail="Unsupported file type.") from exc
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail="We couldn't read this file. Please check it isn't corrupted and try again.",
        ) from exc

    if document.char_count() > settings.max_document_length:
        raise HTTPException(
            status_code=413,
            detail="Document is too large to process. Please split it into smaller files.",
        )

    _reset_document_state(session, document)

    audit("DOCUMENT_UPLOADED", session.id, document_type=document.doc_type, char_count=document.char_count())

    return UploadResponse(
        session_id=session.id,
        document_type=document.doc_type,
        filename=document.filename,
        char_count=document.char_count(),
        sheet_names=[s.name for s in document.sheets] if document.is_tabular else None,
    )


@router.post("/text", response_model=UploadResponse)
async def upload_text(payload: TextUploadRequest):
    session = await get_session_or_404(payload.session_id)
    settings = get_settings()
    if len(payload.text) > settings.max_document_length:
        raise HTTPException(status_code=413, detail="Text is too large to process.")

    document = parse_text(None, payload.text)
    _reset_document_state(session, document)

    audit("DOCUMENT_UPLOADED", session.id, document_type="text", char_count=document.char_count())

    return UploadResponse(
        session_id=session.id,
        document_type="text",
        filename=None,
        char_count=document.char_count(),
        sheet_names=None,
    )


@router.post("/sanitize", response_model=SanitizeResponse)
async def sanitize_document(session_id: str):
    session = await get_session_or_404(session_id)
    if session.document is None:
        raise HTTPException(status_code=400, detail="Upload a document before sanitizing.")

    preview = sanitize_session(session)
    audit("MASKING_APPROVED", session.id, approved_count=len(session.approved_ids))

    return SanitizeResponse(
        session_id=session.id,
        sanitized_preview=preview,
        tokens_created=len(session.token_to_value),
        is_tabular=session.document.is_tabular,
    )


@router.post("/rehydrate", response_model=RehydrateResponse)
async def rehydrate_text(payload: RehydrateRequest):
    session = await get_session_or_404(payload.session_id)
    text, warnings = rehydrate(session, payload.text)
    audit("REHYDRATION_COMPLETED", session.id, warning_count=len(warnings))
    return RehydrateResponse(text=text, warnings=warnings)
