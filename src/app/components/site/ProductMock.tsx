import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Check, Circle, Clock, FileJson, GitBranch, Cloud, KeyRound, Link2 } from "lucide-react";

/**
 * Product frame: hairline rim, layered elevation, a faint brand light behind it.
 * No fake browser chrome — the window bar is the app's own header.
 */
export function Frame({
  children,
  title,
  className = "",
  glow = false,
  live = false,
}: {
  children: ReactNode;
  title?: string;
  className?: string;
  glow?: boolean;
  live?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-10 -bottom-8 -top-6 -z-10 rounded-[40px] blur-[60px]"
          style={{ background: "var(--brand-grad-soft)" }}
        />
      )}
      <div className="overflow-hidden rounded-[var(--r-lg)] border border-line bg-surface text-[12.5px] leading-[1.45] text-ink shadow-[var(--e3)]">
        {title && (
          <div className="flex h-10 items-center justify-between border-b border-line-soft bg-surface-2/70 px-4">
            <span className="flex items-center gap-2.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2 w-2 rounded-full bg-line-strong" />
                <span className="h-2 w-2 rounded-full bg-line-strong" />
                <span className="h-2 w-2 rounded-full bg-line-strong" />
              </span>
              <span className="mono-label normal-case tracking-[0.04em] text-ink-2">{title}</span>
            </span>
            <span className="hidden items-center gap-2 font-mono text-[10px] text-ink-3 sm:flex">
              {live && <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />}
              tenant: acme-eu · prod
            </span>
          </div>
        )}
        {children}
      </div>
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
    warn: "bg-warn-soft text-warn border-warn/30",
    brand: "bg-brand text-on-brand border-brand",
  }[tone];
  return (
    <span className={`inline-flex h-[19px] items-center rounded-full border px-2 font-mono text-[10px] tracking-[0.04em] ${t}`}>
      {children}
    </span>
  );
};

/**
 * Runs `cb` on an interval, but only while the element is on screen, the tab is
 * visible and the visitor has not asked for reduced motion.
 */
function useLiveTicker(ref: React.RefObject<HTMLElement | null>, cb: () => void, ms: number) {
  const inView = useInView(ref, { amount: 0.25 });
  const reduce = useReducedMotion();
  const saved = useRef(cb);
  saved.current = cb;

  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") saved.current();
    }, ms);
    return () => window.clearInterval(id);
  }, [inView, reduce, ms]);

  return !reduce;
}

/* ─── Hero: control register + detail, walking the register by itself ─── */
type HeroRow = {
  id: string;
  name: string;
  fw: string[];
  ev: number;
  state: "ok" | "due" | "gap";
  owner: string;
  cycle: string;
  next: string;
  status: string;
  tone: "ok" | "neutral" | "warn";
  satisfies: [string, string][];
  evidence: [string, string, string][];
};

const HERO_ROWS: HeroRow[] = [
  {
    id: "CTL-014",
    name: "Multi-factor authentication for privileged access",
    fw: ["A.5.17", "CC6.1", "PR.AA-03"],
    ev: 4,
    state: "ok",
    owner: "R. Aliyeva",
    cycle: "Quarterly",
    next: "2026-10-01",
    status: "Effective",
    tone: "ok",
    satisfies: [
      ["ISO/IEC 27001:2022", "A.5.17 Authentication information"],
      ["SOC 2", "CC6.1 Logical access security"],
      ["NIST CSF 2.0", "PR.AA-03 Users authenticated"],
    ],
    evidence: [
      ["aws-iam-mfa-report.json", "2026-09-11 04:00", "auto"],
      ["okta-policy-privileged.json", "2026-09-11 04:00", "auto"],
      ["access-review-q3.pdf", "2026-09-02", "manual"],
      ["mfa-exception-register.csv", "2026-08-30", "manual"],
    ],
  },
  {
    id: "CTL-021",
    name: "Access reviews for production systems",
    fw: ["A.5.18", "CC6.2"],
    ev: 2,
    state: "ok",
    owner: "T. Hüseynli",
    cycle: "Quarterly",
    next: "2026-10-15",
    status: "Effective",
    tone: "ok",
    satisfies: [
      ["ISO/IEC 27001:2022", "A.5.18 Access rights"],
      ["SOC 2", "CC6.2 Access provisioning"],
      ["NIST CSF 2.0", "PR.AA-05 Access permissions"],
    ],
    evidence: [
      ["okta-group-membership.json", "2026-09-11 04:00", "auto"],
      ["access-review-q3-signoff.pdf", "2026-09-04", "manual"],
    ],
  },
  {
    id: "CTL-033",
    name: "Encryption of data at rest",
    fw: ["A.8.24", "CC6.7", "PR.DS-01"],
    ev: 3,
    state: "ok",
    owner: "E. Məmmədov",
    cycle: "Annual",
    next: "2027-01-20",
    status: "Effective",
    tone: "ok",
    satisfies: [
      ["ISO/IEC 27001:2022", "A.8.24 Use of cryptography"],
      ["SOC 2", "CC6.7 Data in transit and at rest"],
      ["NIST CSF 2.0", "PR.DS-01 Data-at-rest protected"],
    ],
    evidence: [
      ["rds-encryption-state.json", "2026-09-11 04:00", "auto"],
      ["s3-bucket-policy.json", "2026-09-11 04:00", "auto"],
      ["kms-key-rotation.pdf", "2026-07-18", "manual"],
    ],
  },
  {
    id: "CTL-047",
    name: "Vendor security assessment before onboarding",
    fw: ["A.5.19", "CC9.2"],
    ev: 1,
    state: "due",
    owner: "L. Quliyeva",
    cycle: "Semi-annual",
    next: "2026-09-30",
    status: "Review due",
    tone: "neutral",
    satisfies: [
      ["ISO/IEC 27001:2022", "A.5.19 Supplier relationships"],
      ["SOC 2", "CC9.2 Vendor risk management"],
      ["NIST CSF 2.0", "GV.SC-06 Pre-engagement due diligence"],
    ],
    evidence: [["vendor-assessment-2026.xlsx", "2026-06-12", "manual"]],
  },
  {
    id: "CTL-052",
    name: "Backup restoration tested quarterly",
    fw: ["A.8.13", "A1.2"],
    ev: 0,
    state: "gap",
    owner: "E. Məmmədov",
    cycle: "Quarterly",
    next: "2026-09-22",
    status: "Evidence gap",
    tone: "warn",
    satisfies: [
      ["ISO/IEC 27001:2022", "A.8.13 Information backup"],
      ["SOC 2", "A1.2 Recovery objectives"],
      ["NIST CSF 2.0", "RC.RP-03 Backup integrity verified"],
    ],
    evidence: [],
  },
];

const COLLECTOR_FEED = [
  "collector:aws-iam · 2 artefacts attached · sha256 9f3a…c21e",
  "collector:github · 3 artefacts attached · sha256 41bd…77a0",
  "collector:cloudflare · 1 artefact attached · sha256 e0c4…3b9d",
  "audit.append · control.update CTL-047 · chain verified",
];

export function HeroMock() {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [feed, setFeed] = useState(0);

  const animated = useLiveTicker(ref, () => setI((v) => (v + 1) % HERO_ROWS.length), 4200);
  useLiveTicker(ref, () => setFeed((v) => (v + 1) % COLLECTOR_FEED.length), 3100);

  const active = HERO_ROWS[i];

  return (
    <div ref={ref}>
      <Frame title="Controls · Control register" className="w-full" glow live={animated}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* register */}
          <div className="border-b border-line-soft lg:border-b-0 lg:border-r">
            <div className="grid h-8 grid-cols-[76px_1fr_auto] items-center gap-3 border-b border-line-soft px-3.5">
              <Mono>ID</Mono>
              <Mono>Control</Mono>
              <Mono>Evidence</Mono>
            </div>
            {HERO_ROWS.map((r, idx) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Show ${r.id}`}
                className="relative grid w-full grid-cols-[76px_1fr_auto] items-start gap-3 border-b border-line-soft px-3.5 py-2.5 text-left last:border-b-0 hover:bg-surface-2/50"
              >
                {idx === i && (
                  <motion.span
                    layoutId="hero-row-active"
                    className="absolute inset-0 border-l-2 border-brand bg-brand-soft/60"
                    transition={{ type: "spring", stiffness: 340, damping: 34 }}
                    aria-hidden
                  />
                )}
                <Mono className="relative pt-[1px] text-ink-2">{r.id}</Mono>
                <div className="relative min-w-0">
                  <div className="truncate text-ink">{r.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.fw.map((f) => (
                      <Pill key={f}>{f}</Pill>
                    ))}
                  </div>
                </div>
                <div className="relative flex items-center gap-1.5 pt-[1px]">
                  {r.state === "ok" && <Check className="h-3.5 w-3.5 text-ok" strokeWidth={2} />}
                  {r.state === "due" && <Clock className="h-3.5 w-3.5 text-ink-3" strokeWidth={2} />}
                  {r.state === "gap" && <Circle className="h-3.5 w-3.5 text-warn" strokeWidth={2} />}
                  <Mono className="text-ink-2">{r.ev}</Mono>
                </div>
              </button>
            ))}
          </div>

          {/* detail */}
          <div className="relative p-3.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={animated ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={animated ? { opacity: 0, y: -6 } : undefined}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Mono className="text-ink-2">{active.id}</Mono>
                    <div className="mt-0.5 text-[13px] font-medium text-ink">{active.name}</div>
                  </div>
                  <Pill tone={active.tone}>{active.status}</Pill>
                </div>

                <div className="mt-3.5 grid grid-cols-3 gap-2">
                  {[
                    ["Owner", active.owner],
                    ["Review", active.cycle],
                    ["Next", active.next],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-[var(--r-sm)] border border-line-soft bg-surface-2/50 px-2.5 py-2">
                      <Mono>{k}</Mono>
                      <div className="truncate text-[12px] text-ink">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3.5">
                  <Mono>Satisfies</Mono>
                  <ul className="mt-1.5 space-y-1">
                    {active.satisfies.map(([f, r]) => (
                      <li key={f} className="flex items-center justify-between gap-2 text-[12px]">
                        <span className="text-ink-2">{f}</span>
                        <Mono className="text-ink">{r}</Mono>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3.5">
                  <Mono>Evidence · {active.ev}</Mono>
                  <ul className="mt-1.5 space-y-1">
                    {active.evidence.map(([f, d, t], idx) => (
                      <motion.li
                        key={f}
                        initial={animated ? { opacity: 0, x: -6 } : false}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.08 + idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-2 text-[12px]"
                      >
                        <FileJson className="h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={1.75} />
                        <span className="truncate text-ink">{f}</span>
                        <Mono className="ml-auto shrink-0">{d}</Mono>
                        <Pill tone={t === "auto" ? "ok" : "neutral"}>{t}</Pill>
                      </motion.li>
                    ))}
                    {active.evidence.length === 0 && (
                      <li className="flex items-center gap-2 rounded-[var(--r-sm)] border border-dashed border-warn/40 px-2.5 py-2 text-[12px] text-warn">
                        <Circle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                        No artefact attached since 2026-06-30 — control cannot be shown
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* live collector feed */}
        <div className="flex h-9 items-center justify-between gap-3 overflow-hidden border-t border-line-soft bg-surface-2/50 px-3.5">
          <span className="relative flex min-w-0 flex-1 items-center gap-2">
            <span className="live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-ok" aria-hidden />
            <AnimatePresence mode="wait">
              <motion.span
                key={feed}
                initial={animated ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={animated ? { opacity: 0, y: -8 } : undefined}
                transition={{ duration: 0.28 }}
                className="truncate font-mono text-[10.5px] text-ink-3"
              >
                {COLLECTOR_FEED[feed]}
              </motion.span>
            </AnimatePresence>
          </span>
          <Mono className="hidden shrink-0 text-brand sm:inline">84 controls · 3 frameworks</Mono>
        </div>
      </Frame>
    </div>
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
  const ref = useRef<HTMLDivElement>(null);
  const [row, setRow] = useState(0);
  const animated = useLiveTicker(ref, () => setRow((v) => (v + 1) % MAP_ROWS.length), 2600);

  return (
    <div ref={ref}>
      <Frame title="Controls · Framework mapping" live={animated}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr className="border-b border-line-soft">
                {["ID", "Control", "ISO 27001", "SOC 2", "NIST CSF"].map((h) => (
                  <th key={h} className="h-8 px-3.5 text-left font-normal">
                    <Mono>{h}</Mono>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MAP_ROWS.map((r, idx) => (
                <tr
                  key={r[0]}
                  className={`border-b border-line-soft transition-colors duration-500 last:border-b-0 ${
                    idx === row && animated ? "bg-brand-soft/50" : "hover:bg-surface-2/60"
                  }`}
                >
                  <td className="px-3.5 py-2">
                    <Mono className="text-ink-2">{r[0]}</Mono>
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-2 text-ink">{r[1]}</td>
                  {r.slice(2).map((c, k) => (
                    <td key={k} className="px-3.5 py-2">
                      <Pill tone="ok">{c}</Pill>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex h-9 items-center justify-between border-t border-line-soft bg-surface-2/50 px-3.5">
          <Mono>84 controls · 3 frameworks · 61 shared requirements</Mono>
          <Mono className="text-brand">overlap 72%</Mono>
        </div>
      </Frame>
    </div>
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
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(-1);
  const animated = useLiveTicker(ref, () => setRun((v) => (v + 1) % (RUNS.length + 2)), 1500);

  return (
    <div ref={ref}>
      <Frame title="Evidence · Collector runs" live={animated}>
        <ul>
          {RUNS.map((r, idx) => (
            <li
              key={r.src}
              className={`grid grid-cols-[24px_1fr_auto] items-start gap-3 border-b border-line-soft px-3.5 py-2.5 transition-colors duration-500 last:border-b-0 ${
                idx === run && animated ? "bg-brand-soft/45" : "hover:bg-surface-2/60"
              }`}
            >
              <r.icon className="mt-[1px] h-4 w-4 text-ink-3" strokeWidth={1.75} />
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
        <div className="flex h-9 items-center justify-between border-t border-line-soft bg-surface-2/50 px-3.5">
          <Mono>next run in 23h 41m</Mono>
          <Mono className="flex items-center gap-1 text-brand">
            <Link2 className="h-3 w-3" /> 6 artefacts attached
          </Mono>
        </div>
      </Frame>
    </div>
  );
}

/* ─── Capability 3: audit trail, appending as you watch ─── */
type LogLine = { t: string; who: string; act: string; obj: string; diff: string };

const LOG: LogLine[] = [
  { t: "2026-09-11 09:14:02", who: "t.huseynli", act: "control.update", obj: "CTL-047", diff: 'reviewCycle: "annual" → "semi-annual"' },
  { t: "2026-09-11 04:00:15", who: "collector:github", act: "evidence.attach", obj: "CTL-038", diff: "+ branch-protection-main.json" },
  { t: "2026-09-10 17:52:40", who: "r.aliyeva", act: "risk.link", obj: "RSK-012 → CTL-014", diff: "treatment: mitigate" },
  { t: "2026-09-10 16:03:11", who: "r.aliyeva", act: "evidence.review", obj: "EV-2291", diff: 'status: "pending" → "accepted"' },
  { t: "2026-09-09 11:20:57", who: "auditor:kpmg-ro", act: "export.read", obj: "SOC2 · CC6", diff: "read-only session" },
];

const INCOMING: LogLine[] = [
  { t: "2026-09-11 09:16:44", who: "collector:aws-iam", act: "evidence.attach", obj: "CTL-014", diff: "+ aws-iam-mfa-report.json" },
  { t: "2026-09-11 09:17:02", who: "e.memmedov", act: "control.review", obj: "CTL-033", diff: 'status: "due" → "effective"' },
  { t: "2026-09-11 09:18:21", who: "collector:okta", act: "run.fail", obj: "CTL-021", diff: "auth expired · retry scheduled" },
];

export function AuditMock() {
  const ref = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<LogLine[]>(LOG);
  const [n, setN] = useState(0);
  const [entries, setEntries] = useState(128411);

  const animated = useLiveTicker(
    ref,
    () => {
      const next = INCOMING[n % INCOMING.length];
      setLines((prev) => [next, ...prev].slice(0, 5));
      setEntries((e) => e + 1);
      setN((v) => v + 1);
    },
    3800
  );

  return (
    <div ref={ref}>
      <Frame title="Audit trail · append-only" live={animated}>
        <div className="font-mono text-[11px]">
          <AnimatePresence initial={false}>
            {lines.map((l) => (
              <motion.div
                key={l.t + l.obj}
                layout
                initial={animated ? { opacity: 0, y: -14, backgroundColor: "color-mix(in srgb, var(--brand) 10%, transparent)" } : false}
                animate={{ opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-[150px_120px_1fr] gap-3 border-b border-line-soft px-3.5 py-2 last:border-b-0"
              >
                <span className="whitespace-nowrap text-ink-3">{l.t}</span>
                <span className="truncate text-ink-2">{l.who}</span>
                <span className="min-w-0 truncate">
                  <span className="text-brand">{l.act}</span> <span className="text-ink">{l.obj}</span>{" "}
                  <span className="text-ink-3">{l.diff}</span>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex h-9 items-center justify-between border-t border-line-soft bg-surface-2/50 px-3.5">
          <Mono>chain head 4c1e…9a07 · verified</Mono>
          <Mono className="tabular">{entries.toLocaleString("en-GB")} entries · 0 gaps</Mono>
        </div>
      </Frame>
    </div>
  );
}

export const MockById = { mapping: MappingMock, evidence: EvidenceMock, audit: AuditMock } as const;
