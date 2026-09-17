import { Check, Circle, Clock, FileJson, GitBranch, Cloud, KeyRound, Link2 } from "lucide-react";
import type { ReactNode } from "react";

/** Minimal frame: hairline, one soft shadow, no browser chrome. */
export function Frame({ children, title, className = "" }: { children: ReactNode; title?: string; className?: string }) {
  return (
    <div className={`rounded-[var(--radius)] border border-line bg-surface elev overflow-hidden text-[12.5px] leading-[1.45] text-ink ${className}`}>
      {title && (
        <div className="flex items-center justify-between h-9 px-3.5 border-b border-line-soft bg-surface-2/60">
          <span className="mono-label normal-case tracking-[0.04em] text-ink-2">{title}</span>
          <span className="hidden sm:inline font-mono text-[10px] text-ink-3">tenant: acme-eu · prod</span>
        </div>
      )}
      {children}
    </div>
  );
}

const Mono = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <span className={`font-mono text-[11px] text-ink-3 ${className}`}>{children}</span>
);

const Pill = ({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "ok" | "warn" | "brand" }) => {
  const t = {
    neutral: "bg-surface-2 text-ink-2 border-line",
    ok: "bg-brand-soft text-brand-ink border-brand-line",
    warn: "bg-transparent text-warn border-warn/40",
    brand: "bg-brand text-on-brand border-brand",
  }[tone];
  return <span className={`inline-flex items-center h-[18px] px-1.5 rounded-[4px] border font-mono text-[10px] tracking-[0.04em] ${t}`}>{children}</span>;
};

/* ─── Hero: control register + detail ─── */
const HERO_ROWS = [
  { id: "CTL-014", name: "Multi-factor authentication for privileged access", fw: ["A.5.17", "CC6.1", "PR.AA-03"], ev: 4, state: "ok" },
  { id: "CTL-021", name: "Access reviews for production systems", fw: ["A.5.18", "CC6.2"], ev: 2, state: "ok" },
  { id: "CTL-033", name: "Encryption of data at rest", fw: ["A.8.24", "CC6.7", "PR.DS-01"], ev: 3, state: "ok" },
  { id: "CTL-047", name: "Vendor security assessment before onboarding", fw: ["A.5.19", "CC9.2"], ev: 1, state: "due" },
  { id: "CTL-052", name: "Backup restoration tested quarterly", fw: ["A.8.13", "A1.2"], ev: 0, state: "gap" },
];

export function HeroMock() {
  return (
    <Frame title="Controls · Control register" className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="border-b lg:border-b-0 lg:border-r border-line-soft">
          <div className="grid grid-cols-[76px_1fr_auto] gap-3 px-3.5 h-8 items-center border-b border-line-soft">
            <Mono>ID</Mono><Mono>Control</Mono><Mono>Evidence</Mono>
          </div>
          {HERO_ROWS.map((r, i) => (
            <div key={r.id} className={`grid grid-cols-[76px_1fr_auto] gap-3 px-3.5 py-2.5 items-start border-b border-line-soft last:border-b-0 ${i === 0 ? "bg-brand-soft/50" : ""}`}>
              <Mono className="text-ink-2 pt-[1px]">{r.id}</Mono>
              <div className="min-w-0">
                <div className="truncate text-ink">{r.name}</div>
                <div className="mt-1 flex flex-wrap gap-1">{r.fw.map((f) => <Pill key={f}>{f}</Pill>)}</div>
              </div>
              <div className="flex items-center gap-1.5 pt-[1px]">
                {r.state === "ok" && <Check className="w-3.5 h-3.5 text-ok" strokeWidth={2} />}
                {r.state === "due" && <Clock className="w-3.5 h-3.5 text-ink-3" strokeWidth={2} />}
                {r.state === "gap" && <Circle className="w-3.5 h-3.5 text-warn" strokeWidth={2} />}
                <Mono className="text-ink-2">{r.ev}</Mono>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Mono className="text-ink-2">CTL-014</Mono>
              <div className="mt-0.5 font-medium text-[13px] text-ink">Multi-factor authentication for privileged access</div>
            </div>
            <Pill tone="ok">Effective</Pill>
          </div>
          <div className="mt-3.5 grid grid-cols-3 gap-2">
            {[["Owner", "R. Aliyeva"], ["Review", "Quarterly"], ["Next", "2026-10-01"]].map(([k, v]) => (
              <div key={k} className="rounded-[4px] border border-line-soft px-2 py-1.5">
                <Mono>{k}</Mono>
                <div className="text-[12px] text-ink">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3.5">
            <Mono>Satisfies</Mono>
            <ul className="mt-1.5 space-y-1">
              {[["ISO/IEC 27001:2022", "A.5.17 Authentication information"], ["SOC 2", "CC6.1 Logical access security"], ["NIST CSF 2.0", "PR.AA-03 Users authenticated"]].map(([f, r]) => (
                <li key={f} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="text-ink-2">{f}</span><Mono className="text-ink">{r}</Mono>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3.5">
            <Mono>Evidence · 4</Mono>
            <ul className="mt-1.5 space-y-1">
              {[
                ["aws-iam-mfa-report.json", "2026-09-11 04:00", "auto"],
                ["okta-policy-privileged.json", "2026-09-11 04:00", "auto"],
                ["access-review-q3.pdf", "2026-09-02", "manual"],
                ["mfa-exception-register.csv", "2026-08-30", "manual"],
              ].map(([f, d, t]) => (
                <li key={f} className="flex items-center gap-2 text-[12px]">
                  <FileJson className="w-3.5 h-3.5 text-ink-3 shrink-0" strokeWidth={1.75} />
                  <span className="truncate text-ink">{f}</span>
                  <Mono className="ml-auto shrink-0">{d}</Mono>
                  <Pill tone={t === "auto" ? "ok" : "neutral"}>{t}</Pill>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ─── Capability 1: cross-framework mapping ─── */
const MAP_ROWS = [
  ["CTL-014", "MFA for privileged access", "A.5.17", "CC6.1", "PR.AA-03"],
  ["CTL-021", "Production access reviews", "A.5.18", "CC6.2", "PR.AA-05"],
  ["CTL-033", "Encryption at rest", "A.8.24", "CC6.7", "PR.DS-01"],
  ["CTL-038", "Logging of admin actions", "A.8.15", "CC7.2", "DE.CM-03"],
  ["CTL-047", "Vendor assessment", "A.5.19", "CC9.2", "GV.SC-06"],
  ["CTL-052", "Backup restore test", "A.8.13", "A1.2", "RC.RP-03"],
];

export function MappingMock() {
  return (
    <Frame title="Controls · Framework mapping">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="border-b border-line-soft">
              {["ID", "Control", "ISO 27001", "SOC 2", "NIST CSF"].map((h) => (
                <th key={h} className="text-left font-normal px-3.5 h-8"><Mono>{h}</Mono></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MAP_ROWS.map((r) => (
              <tr key={r[0]} className="border-b border-line-soft last:border-b-0 hover:bg-surface-2/60 transition-colors">
                <td className="px-3.5 py-2"><Mono className="text-ink-2">{r[0]}</Mono></td>
                <td className="px-3.5 py-2 text-ink whitespace-nowrap">{r[1]}</td>
                {r.slice(2).map((c, i) => (
                  <td key={i} className="px-3.5 py-2"><Pill tone="ok">{c}</Pill></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-3.5 h-9 border-t border-line-soft bg-surface-2/40">
        <Mono>84 controls · 3 frameworks · 61 shared requirements</Mono>
        <Mono className="text-brand-ink">overlap 72%</Mono>
      </div>
    </Frame>
  );
}

/* ─── Capability 2: evidence collectors ─── */
const RUNS = [
  { icon: KeyRound, src: "AWS IAM", what: "MFA enforcement, access-key age", at: "2026-09-11 04:00:12", hash: "9f3a…c21e", ok: true, n: 2 },
  { icon: GitBranch, src: "GitHub", what: "Branch protection, required reviews", at: "2026-09-11 04:00:15", hash: "41bd…77a0", ok: true, n: 3 },
  { icon: Cloud, src: "Cloudflare", what: "TLS configuration, WAF rules", at: "2026-09-11 04:00:19", hash: "e0c4…3b9d", ok: true, n: 1 },
  { icon: KeyRound, src: "Okta", what: "Privileged group membership", at: "2026-09-11 04:00:23", hash: "77f1…08ac", ok: false, n: 0 },
];

export function EvidenceMock() {
  return (
    <Frame title="Evidence · Collector runs">
      <ul>
        {RUNS.map((r) => (
          <li key={r.src} className="grid grid-cols-[24px_1fr_auto] gap-3 px-3.5 py-2.5 border-b border-line-soft last:border-b-0 items-start hover:bg-surface-2/60 transition-colors">
            <r.icon className="w-4 h-4 text-ink-3 mt-[1px]" strokeWidth={1.75} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-ink">{r.src}</span>
                <Mono className="truncate">{r.what}</Mono>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <Mono>{r.at}</Mono>
                <Mono className="text-ink-2">sha256 {r.hash}</Mono>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mono className="text-ink-2">{r.n} controls</Mono>
              {r.ok ? <Pill tone="ok">attached</Pill> : <Pill tone="warn">auth expired</Pill>}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between px-3.5 h-9 border-t border-line-soft bg-surface-2/40">
        <Mono>next run in 23h 41m</Mono>
        <Mono className="text-brand-ink flex items-center gap-1"><Link2 className="w-3 h-3" /> 6 artefacts attached</Mono>
      </div>
    </Frame>
  );
}

/* ─── Capability 3: audit trail ─── */
const LOG = [
  { t: "2026-09-11 09:14:02", who: "t.huseynli", act: "control.update", obj: "CTL-047", diff: 'reviewCycle: "annual" → "semi-annual"' },
  { t: "2026-09-11 04:00:15", who: "collector:github", act: "evidence.attach", obj: "CTL-038", diff: "+ branch-protection-main.json" },
  { t: "2026-09-10 17:52:40", who: "r.aliyeva", act: "risk.link", obj: "RSK-012 → CTL-014", diff: "treatment: mitigate" },
  { t: "2026-09-10 16:03:11", who: "r.aliyeva", act: "evidence.review", obj: "EV-2291", diff: 'status: "pending" → "accepted"' },
  { t: "2026-09-09 11:20:57", who: "auditor:kpmg-ro", act: "export.read", obj: "SOC2 · CC6", diff: "read-only session" },
];

export function AuditMock() {
  return (
    <Frame title="Audit trail · append-only">
      <div className="font-mono text-[11px]">
        {LOG.map((l, i) => (
          <div key={i} className="grid grid-cols-[150px_120px_1fr] gap-3 px-3.5 py-2 border-b border-line-soft last:border-b-0 hover:bg-surface-2/60 transition-colors">
            <span className="text-ink-3 whitespace-nowrap">{l.t}</span>
            <span className="text-ink-2 truncate">{l.who}</span>
            <span className="min-w-0 truncate"><span className="text-brand-ink">{l.act}</span> <span className="text-ink">{l.obj}</span> <span className="text-ink-3">{l.diff}</span></span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3.5 h-9 border-t border-line-soft bg-surface-2/40">
        <Mono>chain head 4c1e…9a07 · verified</Mono>
        <Mono>128,411 entries · 0 gaps</Mono>
      </div>
    </Frame>
  );
}

export const MockById = { mapping: MappingMock, evidence: EvidenceMock, audit: AuditMock } as const;
