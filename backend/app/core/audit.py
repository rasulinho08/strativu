"""Security-oriented audit logging.

Audit events carry metadata only (session id, provider, counts, timestamps).
They must never carry document content, PII values, token mappings, or
API keys/secrets. Callers are expected to pass only primitive metadata.
"""

import logging
import time
from typing import Any

logger = logging.getLogger("safeai.audit")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(handler)

_FORBIDDEN_KEYS = {"value", "text", "content", "mapping", "api_key", "document", "message"}


def audit(event: str, session_id: str, **metadata: Any) -> None:
    safe_metadata = {k: v for k, v in metadata.items() if k.lower() not in _FORBIDDEN_KEYS}
    logger.info(
        "%s session=%s ts=%s metadata=%s",
        event,
        session_id,
        int(time.time()),
        safe_metadata,
    )
