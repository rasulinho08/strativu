import type {
  ChatResponse,
  Finding,
  ScanResponse,
  SanitizeResponse,
  SecurityStatusResponse,
  SessionInfo,
  UploadResponse,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers:
      init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json", ...init.headers }
        : init?.headers,
  });

  if (!response.ok) {
    let detail = "Something went wrong. Please try again.";
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // ignore parse failure, use default message
    }
    throw new ApiError(detail);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  createSession: () => request<SessionInfo>("/api/sessions", { method: "POST" }),

  destroySession: (sessionId: string) =>
    request<void>(`/api/sessions/${sessionId}`, { method: "DELETE" }),

  uploadText: (sessionId: string, text: string) =>
    request<UploadResponse>("/api/documents/text", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, text }),
    }),

  uploadFile: (sessionId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<UploadResponse>(
      `/api/documents/upload?session_id=${encodeURIComponent(sessionId)}`,
      { method: "POST", body: form },
    );
  },

  scan: (sessionId: string) =>
    request<ScanResponse>(`/api/dlp/scan?session_id=${encodeURIComponent(sessionId)}`, {
      method: "POST",
    }),

  addManualFinding: (
    sessionId: string,
    category: string,
    value: string,
    location: Finding["location"],
  ) =>
    request<Finding>("/api/dlp/manual", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, category, value, location }),
    }),

  approve: (sessionId: string, approvedIds: string[]) =>
    request<{ approved_count: number; rejected_count: number }>("/api/dlp/approve", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, approved_finding_ids: approvedIds }),
    }),

  sanitize: (sessionId: string) =>
    request<SanitizeResponse>(`/api/documents/sanitize?session_id=${encodeURIComponent(sessionId)}`, {
      method: "POST",
    }),

  chat: (sessionId: string, message: string, provider: string) =>
    request<ChatResponse>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, message, provider }),
    }),

  securityStatus: (sessionId: string) =>
    request<SecurityStatusResponse>(`/api/security/status/${sessionId}`),

  exportDocument: async (
    sessionId: string,
    format: "docx" | "xlsx" | "csv" | "txt",
    source: "sanitized" | "rehydrated",
  ) => {
    const response = await fetch(`${BASE_URL}/api/export/${format}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, source }),
    });
    if (!response.ok) {
      let detail = "Export failed. Please try again.";
      try {
        detail = (await response.json()).detail || detail;
      } catch {
        // ignore
      }
      throw new ApiError(detail);
    }
    return response.blob();
  },
};
