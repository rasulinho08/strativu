import { CheckCircle2, Circle, ShieldCheck, Timer } from "lucide-react";

import { Badge } from "../components/ui/badge";
import { formatCountdown } from "../lib/format";
import type { SecurityStatusResponse } from "../lib/types";

const CHECKLIST_LABELS: [keyof SecurityStatusResponse["checklist"], string][] = [
  ["dlp_scan_complete", "DLP scan complete"],
  ["human_approval_complete", "Human approval complete"],
  ["values_tokenized", "Sensitive values tokenized"],
  ["external_payload_sanitized", "External payload sanitized"],
];

export function SecurityStatusBar({
  status,
  expiresIn,
}: {
  status: SecurityStatusResponse | null;
  expiresIn: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b bg-card/50 px-4 py-2.5 text-xs">
      <span className="flex items-center gap-1.5 font-medium text-accent">
        <ShieldCheck className="h-3.5 w-3.5" /> Secure
      </span>

      {CHECKLIST_LABELS.map(([key, label]) => {
        const done = status?.checklist[key] ?? false;
        return (
          <span key={key} className="flex items-center gap-1.5 text-muted-foreground">
            {done ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
            ) : (
              <Circle className="h-3.5 w-3.5" />
            )}
            {label}
          </span>
        );
      })}

      <span className="flex items-center gap-1.5 text-muted-foreground">
        External transmission:
        <Badge variant={status?.external_transmission === "sanitized" ? "default" : "secondary"}>
          {status?.external_transmission === "sanitized" ? "Sanitized" : "Not sent"}
        </Badge>
      </span>

      <span className="ml-auto flex items-center gap-1.5 font-mono text-muted-foreground">
        <Timer className="h-3.5 w-3.5" /> Session expires: {formatCountdown(expiresIn)}
      </span>
    </div>
  );
}
