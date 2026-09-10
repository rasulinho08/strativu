"""Short-lived, server-side session state.

Backed by an in-memory TTL store for this MVP. The key shape mirrors the
Redis schema a production deployment would use (``session:{id}:mapping``,
``session:{id}:findings`` ...) so swapping in a real Redis-backed store later
is a drop-in change, not a redesign. Token mappings and document content
never leave this store and are never written to logs.
"""

import asyncio
import secrets
import time
from dataclasses import dataclass, field

from app.models.schemas import Finding
from app.services.document_model import ParsedDocument


class SessionNotFoundError(Exception):
    pass


@dataclass
class SanitizedText:
    blocks: dict[int, str] = field(default_factory=dict)  # block_index -> sanitized text


@dataclass
class SanitizedTable:
    # sheet name -> row-major sanitized cell values
    sheets: dict[str, list[list[str]]] = field(default_factory=dict)


@dataclass
class Session:
    id: str
    created_at: float
    expires_at: float
    ttl_seconds: int
    document: ParsedDocument | None = None
    findings: dict[str, Finding] = field(default_factory=dict)
    approved_ids: set[str] = field(default_factory=set)
    sanitized_text: SanitizedText | None = None
    sanitized_table: SanitizedTable | None = None
    token_to_value: dict[str, str] = field(default_factory=dict)
    value_to_token: dict[tuple[str, str], str] = field(default_factory=dict)
    category_counters: dict[str, int] = field(default_factory=dict)
    chat_history: list[dict[str, str]] = field(default_factory=list)
    document_injected: bool = False

    def touch(self) -> None:
        self.expires_at = time.time() + self.ttl_seconds

    @property
    def expires_in_seconds(self) -> float:
        return max(0.0, self.expires_at - time.time())

    @property
    def is_sanitized(self) -> bool:
        return self.sanitized_text is not None or self.sanitized_table is not None


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, Session] = {}
        self._lock = asyncio.Lock()

    async def create(self, ttl_seconds: int) -> Session:
        async with self._lock:
            session_id = secrets.token_urlsafe(24)
            now = time.time()
            session = Session(
                id=session_id,
                created_at=now,
                expires_at=now + ttl_seconds,
                ttl_seconds=ttl_seconds,
            )
            self._sessions[session_id] = session
            return session

    async def get(self, session_id: str) -> Session:
        async with self._lock:
            session = self._sessions.get(session_id)
            if session is None or session.expires_in_seconds <= 0:
                self._sessions.pop(session_id, None)
                raise SessionNotFoundError(session_id)
            return session

    async def delete(self, session_id: str) -> None:
        async with self._lock:
            self._sessions.pop(session_id, None)

    async def sweep_expired(self) -> None:
        async with self._lock:
            expired = [sid for sid, s in self._sessions.items() if s.expires_in_seconds <= 0]
            for sid in expired:
                self._sessions.pop(sid, None)

    async def sweep_loop(self, interval_seconds: float = 60.0) -> None:
        while True:
            await asyncio.sleep(interval_seconds)
            await self.sweep_expired()


session_store = SessionStore()
