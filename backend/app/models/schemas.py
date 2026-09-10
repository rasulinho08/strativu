from typing import Any, Literal

from pydantic import BaseModel, Field

Category = Literal[
    "PERSON",
    "EMAIL",
    "PHONE",
    "FINANCE",
    "CREDIT_CARD",
    "BANK_ACCOUNT",
    "ID_NUMBER",
    "DATE_OF_BIRTH",
    "CUSTOM",
]

DocumentType = Literal["text", "docx", "csv", "xlsx"]


class SessionCreateResponse(BaseModel):
    session_id: str
    expires_at: float
    ttl_seconds: int


class SessionStatusResponse(BaseModel):
    session_id: str
    expires_in_seconds: float
    findings_total: int
    approved_count: int
    has_document: bool
    is_sanitized: bool


class TextUploadRequest(BaseModel):
    session_id: str
    text: str = Field(min_length=1)


class UploadResponse(BaseModel):
    session_id: str
    document_type: DocumentType
    filename: str | None = None
    char_count: int
    sheet_names: list[str] | None = None


class Location(BaseModel):
    # Text / DOCX findings live inside a block (paragraph/heading/table cell).
    block_index: int | None = None
    start: int | None = None
    end: int | None = None
    # Tabular findings live inside a specific worksheet cell.
    sheet: str | None = None
    row: int | None = None
    col: int | None = None
    column_name: str | None = None


class Finding(BaseModel):
    id: str
    category: str
    value: str
    confidence: float
    source: Literal["regex", "heuristic", "manual"]
    location: Location


class ScanResponse(BaseModel):
    session_id: str
    findings: list[Finding]
    category_counts: dict[str, int]


class ManualFindingRequest(BaseModel):
    session_id: str
    category: str
    location: Location
    value: str


class ApproveRequest(BaseModel):
    session_id: str
    approved_finding_ids: list[str]


class ApproveResponse(BaseModel):
    session_id: str
    approved_count: int
    rejected_count: int


class SanitizeResponse(BaseModel):
    session_id: str
    sanitized_preview: str
    tokens_created: int
    is_tabular: bool


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    session_id: str
    message: str = Field(min_length=1)
    provider: Literal["openai", "anthropic", "gemini"] | None = None
    model: str | None = None
    temperature: float | None = Field(default=None, ge=0, le=2)


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    warnings: list[str]
    provider: str
    model: str


class RehydrateRequest(BaseModel):
    session_id: str
    text: str


class RehydrateResponse(BaseModel):
    text: str
    warnings: list[str]


class ExportRequest(BaseModel):
    session_id: str
    source: Literal["sanitized", "rehydrated"] = "rehydrated"


class SecurityStatusResponse(BaseModel):
    session_id: str
    findings_total: int
    approved_count: int
    external_transmission: Literal["not_sent", "sanitized"]
    expires_in_seconds: float
    checklist: dict[str, bool]


class AuditEvent(BaseModel):
    event: str
    session_id: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    timestamp: float


class ErrorResponse(BaseModel):
    detail: str
