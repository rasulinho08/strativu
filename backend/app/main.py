import asyncio
import contextlib
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import routes_ai, routes_dlp, routes_documents, routes_export, routes_security, routes_sessions
from app.core.config import get_settings
from app.core.security import RateLimitMiddleware, SecurityHeadersMiddleware
from app.services.session_store import session_store

logger = logging.getLogger("safeai")


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    sweep_task = asyncio.create_task(session_store.sweep_loop())
    yield
    sweep_task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await sweep_task


settings = get_settings()

app = FastAPI(
    title="SafeAI Workspace API",
    description="Human-in-the-loop AI Gateway and DLP platform.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.rate_limit_per_minute)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Full detail goes to server logs only; the client never sees internals
    # or anything that could leak document content.
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "We couldn't process this request. Please try again."},
    )


app.include_router(routes_sessions.router)
app.include_router(routes_documents.router)
app.include_router(routes_dlp.router)
app.include_router(routes_ai.router)
app.include_router(routes_export.router)
app.include_router(routes_security.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
