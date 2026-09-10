import { useEffect, useRef, useState } from "react";
import { LogOut, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "./components/ui/button";
import { Separator } from "./components/ui/separator";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import { ThemeToggle } from "./components/theme-toggle";
import { useIsMobile } from "./components/ui/use-mobile";
import { ChatPanel } from "./workspace/ChatPanel";
import { DocumentInput } from "./workspace/DocumentInput";
import { ExportMenu } from "./workspace/ExportMenu";
import { FindingsPanel } from "./workspace/FindingsPanel";
import { HighlightedText } from "./workspace/HighlightedText";
import { SecurityStatusBar } from "./workspace/SecurityStatusBar";
import { api, ApiError } from "./lib/api";
import { DEFAULT_MASK_CATEGORIES } from "./lib/format";
import type {
  ChatTurn,
  Finding,
  Provider,
  SecurityStatusResponse,
  SessionInfo,
  UploadResponse,
} from "./lib/types";

export default function Workspace() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [expiresIn, setExpiresIn] = useState(0);
  const [docInfo, setDocInfo] = useState<UploadResponse | null>(null);
  const [pastedText, setPastedText] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [sanitizedPreview, setSanitizedPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<SecurityStatusResponse | null>(null);
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([]);
  const [provider, setProvider] = useState<Provider>("openai");
  const [busy, setBusy] = useState<string | null>(null);
  const bootstrapped = useRef(false);

  async function startSession() {
    const created = await api.createSession();
    setSession(created);
    setExpiresIn(created.ttl_seconds);
    setDocInfo(null);
    setPastedText(null);
    setFindings([]);
    setApprovedIds(new Set());
    setSanitizedPreview(null);
    setStatus(null);
    setChatTurns([]);
  }

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    startSession().catch(() => toast.error("Could not start a session. Is the backend running?"));
  }, []);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setExpiresIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (expiresIn === 0 && session) {
      toast.warning("Session expired. Sensitive data has been deleted. Starting a new session.");
      startSession().catch(() => toast.error("Could not start a new session."));
    }
  }, [expiresIn, session]);

  async function refreshStatus(sessionId: string) {
    try {
      setStatus(await api.securityStatus(sessionId));
    } catch {
      // status refresh is best-effort
    }
  }

  function guard<T extends unknown[]>(label: string, fn: (...args: T) => Promise<void>) {
    return async (...args: T) => {
      setBusy(label);
      try {
        await fn(...args);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Something went wrong.");
      } finally {
        setBusy(null);
      }
    };
  }

  const handleLoadText = guard("load", async (text: string) => {
    if (!session) return;
    const info = await api.uploadText(session.session_id, text);
    setDocInfo(info);
    setPastedText(text);
    setFindings([]);
    setApprovedIds(new Set());
    setSanitizedPreview(null);
    await refreshStatus(session.session_id);
  });

  const handleLoadFile = guard("load", async (file: File) => {
    if (!session) return;
    const info = await api.uploadFile(session.session_id, file);
    setDocInfo(info);
    setPastedText(null);
    setFindings([]);
    setApprovedIds(new Set());
    setSanitizedPreview(null);
    await refreshStatus(session.session_id);
  });

  const handleScan = guard("scan", async () => {
    if (!session) return;
    const result = await api.scan(session.session_id);
    setFindings(result.findings);
    setApprovedIds(
      new Set(result.findings.filter((f) => DEFAULT_MASK_CATEGORIES.has(f.category)).map((f) => f.id)),
    );
    setSanitizedPreview(null);
    await refreshStatus(session.session_id);
    toast.success(`Scan complete — ${result.findings.length} potential findings.`);
  });

  function toggleFinding(id: string, checked: boolean) {
    setApprovedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleCategory(category: string, checked: boolean) {
    setApprovedIds((prev) => {
      const next = new Set(prev);
      for (const f of findings) {
        if (f.category !== category) continue;
        if (checked) next.add(f.id);
        else next.delete(f.id);
      }
      return next;
    });
  }

  const handleSanitize = guard("sanitize", async () => {
    if (!session) return;
    await api.approve(session.session_id, [...approvedIds]);
    const result = await api.sanitize(session.session_id);
    setSanitizedPreview(result.sanitized_preview);
    await refreshStatus(session.session_id);
    toast.success("Document sanitized. Only tokenized content will be sent to the AI.");
  });

  const handleSendChat = guard("chat", async (message: string) => {
    if (!session) return;
    setChatTurns((prev) => [...prev, { role: "user", content: message }]);
    const result = await api.chat(session.session_id, message, provider);
    setChatTurns((prev) => [...prev, { role: "assistant", content: result.reply, warnings: result.warnings }]);
    await refreshStatus(session.session_id);
  });

  const handleExport = guard(
    "export",
    async (format: "docx" | "xlsx" | "csv" | "txt", source: "sanitized" | "rehydrated") => {
      if (!session) return;
      const blob = await api.exportDocument(session.session_id, format, source);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `safeai-${source}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    },
  );

  const handleEndSession = guard("end", async () => {
    if (!session) return;
    await api.destroySession(session.session_id);
    toast.success("Session ended. All sensitive data for this session has been deleted.");
    await startSession();
  });

  const hasDocument = docInfo !== null;
  const isSanitized = sanitizedPreview !== null;
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <span className="font-semibold tracking-tight">SafeAI Workspace</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" variant="ghost" disabled={busy === "end"} onClick={handleEndSession}>
            <LogOut /> End session
          </Button>
        </div>
      </header>

      <SecurityStatusBar status={status} expiresIn={expiresIn} />

      <div className="min-h-0 flex-1">
        <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
          <ResizablePanel defaultSize={45} minSize={25}>
            <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
              <section>
                <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Document</h2>
                <DocumentInput disabled={busy === "load"} onLoadText={handleLoadText} onLoadFile={handleLoadFile} />
              </section>

              {docInfo && (
                <>
                  <Separator />
                  <section className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-medium">{docInfo.filename ?? "Pasted text"}</p>
                      <p className="text-xs text-muted-foreground">
                        {docInfo.document_type.toUpperCase()} · {docInfo.char_count.toLocaleString()} characters
                      </p>
                    </div>
                    <Button size="sm" disabled={busy === "scan"} onClick={handleScan}>
                      <ScanSearch /> Scan for sensitive data
                    </Button>
                  </section>
                </>
              )}

              {findings.length > 0 && (
                <>
                  <Separator />
                  <section>
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-muted-foreground">
                        Detected sensitive information
                      </h2>
                      <Button size="sm" variant="secondary" disabled={busy === "sanitize"} onClick={handleSanitize}>
                        <Sparkles /> Approve &amp; sanitize
                      </Button>
                    </div>
                    <FindingsPanel
                      findings={findings}
                      approvedIds={approvedIds}
                      onToggleFinding={toggleFinding}
                      onToggleCategory={toggleCategory}
                    />
                  </section>
                </>
              )}

              {(pastedText !== null || sanitizedPreview !== null) && (
                <>
                  <Separator />
                  <section className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-muted-foreground">
                        {isSanitized ? "Sanitized preview" : "Document preview"}
                      </h2>
                      <ExportMenu disabled={!isSanitized} onExport={handleExport} />
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      {isSanitized ? (
                        <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed">
                          {sanitizedPreview}
                        </pre>
                      ) : (
                        <HighlightedText text={pastedText ?? ""} findings={findings} approvedIds={approvedIds} />
                      )}
                    </div>
                  </section>
                </>
              )}

              {hasDocument && pastedText === null && !isSanitized && (
                <p className="text-xs text-muted-foreground">
                  A live preview isn't available for uploaded files until sanitization — review findings above,
                  then approve &amp; sanitize to see the result.
                </p>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={55} minSize={25}>
            <ChatPanel
              ready={isSanitized}
              turns={chatTurns}
              sending={busy === "chat"}
              provider={provider}
              onProviderChange={setProvider}
              onSend={handleSendChat}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
