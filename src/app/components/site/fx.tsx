import type { CSSProperties, ReactNode } from "react";

/**
 * Dekorativ qatlar. Hamısı aria-hidden, pointer-events yoxdur, məzmuna toxunmur.
 * Qəsdən sadə saxlanılıb: bir yumşaq işıq, heç bir grid/grain/hərəkət.
 */

/** One soft light behind a hero or page header. */
export function Ambience({ className = "" }: { variant?: string; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden ${className}`}>
      <div
        className="absolute -top-[40%] left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "radial-gradient(closest-side, var(--glow-1), transparent 72%)" }}
      />
    </div>
  );
}

/** Plain hairline rule. */
export function GradientRule({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`h-px w-full bg-line ${className}`} />;
}

/** Standard bordered card. Kept under the old name so call sites do not change. */
export function SpotlightCard({
  children,
  className = "",
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
  style?: CSSProperties;
}) {
  return (
    <Tag style={style} className={`card card-hover ${className}`}>
      {children}
    </Tag>
  );
}

/** Static, wrapping strip of short items separated by hairlines. Replaces the marquee. */
export function Strip({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${className}`}>
      {items.map((it, i) => (
        <li key={it} className="flex items-center gap-6 text-[14px] font-medium text-ink-2">
          {i > 0 && <span aria-hidden className="h-3 w-px bg-line-strong" />}
          {it}
        </li>
      ))}
    </ul>
  );
}

/** Small status label: dot + text. */
export function StatusPill({ label, detail }: { label: string; detail?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[6px] border border-line bg-surface px-2.5 py-1 text-[12.5px] font-medium text-ink-2">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
      {label}
      {detail && <span className="hidden text-ink-3 sm:inline">· {detail}</span>}
    </span>
  );
}
