from fastapi import APIRouter, HTTPException

from app.api.deps import get_session_or_404
from app.core.audit import audit
from app.core.config import get_settings
from app.models.schemas import ChatRequest, ChatResponse, RehydrateRequest, RehydrateResponse
from app.providers.base import ProviderConfigError, ProviderRequestError
from app.services.ai_gateway import gateway
from app.services.rehydration.integrity import validate
from app.services.rehydration.rehydrator import rehydrate

router = APIRouter(prefix="/api/ai", tags=["ai"])


def _sanitized_document_text(session) -> str | None:
    if session.sanitized_text is not None:
        return "\n".join(session.sanitized_text.blocks[b.index] for b in session.document.blocks)
    if session.sanitized_table is not None:
        parts = []
        for sheet in session.document.sheets:
            rows = session.sanitized_table.sheets.get(sheet.name, [])
            parts.append(f"# {sheet.name}\n" + "\n".join(", ".join(r) for r in [sheet.columns, *rows]))
        return "\n\n".join(parts)
    return None


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    session = await get_session_or_404(payload.session_id)
    settings = get_settings()

    if len(payload.message) > settings.max_chat_length:
        raise HTTPException(status_code=413, detail="Message is too long.")

    sanitized_document = _sanitized_document_text(session)
    if sanitized_document is None:
        raise HTTPException(
            status_code=400,
            detail="Sanitize the document (after DLP review) before starting a chat about it.",
        )

    provider_name = payload.provider or settings.default_provider
    model = payload.model or gateway.default_model(provider_name, settings)

    try:
        provider = gateway.build_provider(provider_name, settings)
        reply_sanitized = await gateway.send_chat(
            provider=provider,
            model=model,
            sanitized_document=sanitized_document,
            document_already_shared=session.document_injected,
            chat_history=session.chat_history,
            user_message=payload.message,
            temperature=payload.temperature,
        )
    except ProviderConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ProviderRequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="We couldn't reach the AI provider. Your document has not been re-sent. Please try again.",
        ) from exc

    audit("AI_REQUEST_SENT", session.id, provider=provider_name, model=model)

    session.chat_history.append({"role": "user", "content": payload.message})
    session.chat_history.append({"role": "assistant", "content": reply_sanitized})
    session.document_injected = True

    rehydrated_reply, warnings = rehydrate(session, reply_sanitized)
    audit("AI_RESPONSE_RECEIVED", session.id, warning_count=len(warnings))

    return ChatResponse(
        session_id=session.id,
        reply=rehydrated_reply,
        warnings=warnings,
        provider=provider_name,
        model=model,
    )


@router.post("/validate", response_model=RehydrateResponse)
async def validate_tokens(payload: RehydrateRequest):
    """Check token integrity for arbitrary AI-provided text without rehydrating it."""
    session = await get_session_or_404(payload.session_id)
    expected = set(session.token_to_value.keys())
    result = validate(expected, payload.text)
    return RehydrateResponse(text=payload.text, warnings=result.warnings)
