import { useState } from "react";
import { AlertTriangle, Lock, Send } from "lucide-react";

import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import type { ChatTurn, Provider } from "../lib/types";

export function ChatPanel({
  ready,
  turns,
  sending,
  provider,
  onProviderChange,
  onSend,
}: {
  ready: boolean;
  turns: ChatTurn[];
  sending: boolean;
  provider: Provider;
  onProviderChange: (p: Provider) => void;
  onSend: (message: string) => void;
}) {
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim() || sending) return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-medium">AI Conversation</span>
        <Select value={provider} onValueChange={(v) => onProviderChange(v as Provider)}>
          <SelectTrigger size="sm" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI (GPT)</SelectItem>
            <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
            <SelectItem value="gemini">Google (Gemini)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!ready ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Lock className="h-6 w-6" />
            <p className="text-sm">
              Sanitize a document in the Security Workspace to start a conversation about it.
            </p>
          </div>
        ) : turns.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <p className="text-sm">
              The sanitized document is loaded. Ask a question — only tokenized placeholders will be sent
              to the AI provider.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {turns.map((turn, i) => (
              <div key={i} className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    turn.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{turn.content}</p>
                  {turn.warnings && turn.warnings.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1 border-t border-current/20 pt-2">
                      {turn.warnings.map((w, wi) => (
                        <p key={wi} className="flex items-start gap-1.5 text-xs opacity-90">
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                          {w}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 border-t p-3">
        <Textarea
          placeholder={ready ? "Type your message..." : "Sanitize a document to enable chat"}
          value={draft}
          disabled={!ready || sending}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="min-h-11"
        />
        <Button size="icon" disabled={!ready || sending || !draft.trim()} onClick={send}>
          <Send />
        </Button>
      </div>
    </div>
  );
}
