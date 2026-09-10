from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.api.deps import get_session_or_404
from app.core.audit import audit
from app.models.schemas import ExportRequest
from app.services.export.exporter import ExportError, export_csv, export_docx, export_txt, export_xlsx

router = APIRouter(prefix="/api/export", tags=["export"])

_CONTENT_TYPES = {
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "csv": "text/csv",
    "txt": "text/plain",
}

_EXPORTERS = {
    "docx": export_docx,
    "xlsx": export_xlsx,
    "csv": export_csv,
    "txt": export_txt,
}


@router.post("/{fmt}")
async def export(fmt: str, payload: ExportRequest):
    if fmt not in _EXPORTERS:
        raise HTTPException(status_code=400, detail="Unsupported export format.")

    session = await get_session_or_404(payload.session_id)
    if session.document is None:
        raise HTTPException(status_code=400, detail="Nothing to export yet.")

    try:
        data = _EXPORTERS[fmt](session, payload.source)
    except ExportError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="We couldn't generate this export. Please try again.",
        ) from exc

    audit("DOCUMENT_EXPORTED", session.id, format=fmt, source=payload.source)

    filename = f"safeai-export.{fmt}"
    return Response(
        content=data,
        media_type=_CONTENT_TYPES[fmt],
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
