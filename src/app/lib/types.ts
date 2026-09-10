export type DocumentType = "text" | "docx" | "csv" | "xlsx";

export interface SessionInfo {
  session_id: string;
  expires_at: number;
  ttl_seconds: number;
}

export interface UploadResponse {
  session_id: string;
  document_type: DocumentType;
  filename: string | null;
  char_count: number;
  sheet_names: string[] | null;
}

export interface Location {
  block_index: number | null;
  start: number | null;
  end: number | null;
  sheet: string | null;
  row: number | null;
  col: number | null;
  column_name: string | null;
}

export interface Finding {
  id: string;
  category: string;
  value: string;
  confidence: number;
  source: "regex" | "heuristic" | "manual";
  location: Location;
}

export interface ScanResponse {
  session_id: string;
  findings: Finding[];
  category_counts: Record<string, number>;
}

export interface SanitizeResponse {
  session_id: string;
  sanitized_preview: string;
  tokens_created: number;
  is_tabular: boolean;
}

export interface ChatResponse {
  session_id: string;
  reply: string;
  warnings: string[];
  provider: string;
  model: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  warnings?: string[];
}

export interface SecurityStatusResponse {
  session_id: string;
  findings_total: number;
  approved_count: number;
  external_transmission: "not_sent" | "sanitized";
  expires_in_seconds: number;
  checklist: {
    dlp_scan_complete: boolean;
    human_approval_complete: boolean;
    values_tokenized: boolean;
    external_payload_sanitized: boolean;
  };
}

export type Provider = "openai" | "anthropic" | "gemini";
