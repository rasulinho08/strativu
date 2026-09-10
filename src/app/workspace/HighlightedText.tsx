import type { ReactNode } from "react";

import type { Finding } from "../lib/types";

export function HighlightedText({
  text,
  findings,
  approvedIds,
}: {
  text: string;
  findings: Finding[];
  approvedIds: Set<string>;
}) {
  const lines = text.split("\n");

  return (
    <div className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed">
      {lines.map((line, idx) => {
        const lineFindings = findings
          .filter(
            (f) =>
              f.location.block_index === idx &&
              f.location.start !== null &&
              f.location.end !== null,
          )
          .sort((a, b) => (a.location.start as number) - (b.location.start as number));

        if (lineFindings.length === 0) {
          return (
            <div key={idx} className="min-h-[1.3em]">
              {line}
            </div>
          );
        }

        const parts: ReactNode[] = [];
        let cursor = 0;
        lineFindings.forEach((f, i) => {
          const start = f.location.start as number;
          const end = f.location.end as number;
          if (start > cursor) parts.push(<span key={`t-${idx}-${i}`}>{line.slice(cursor, start)}</span>);
          const approved = approvedIds.has(f.id);
          parts.push(
            <mark
              key={f.id}
              title={`${f.category} · ${(f.confidence * 100).toFixed(0)}% confidence · ${
                approved ? "approved for masking" : "detected, not approved"
              }`}
              className={
                approved
                  ? "rounded bg-accent/25 px-0.5 text-foreground ring-1 ring-accent/50"
                  : "rounded bg-amber-500/15 px-0.5 text-foreground ring-1 ring-amber-500/40"
              }
            >
              {line.slice(start, end)}
            </mark>,
          );
          cursor = end;
        });
        if (cursor < line.length) parts.push(<span key={`tail-${idx}`}>{line.slice(cursor)}</span>);

        return (
          <div key={idx} className="min-h-[1.3em]">
            {parts}
          </div>
        );
      })}
    </div>
  );
}
