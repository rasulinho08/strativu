import { Link } from "react-router";
import { frameworks, type Framework } from "../../data/coverage";
import { StatusChip } from "./primitives";
import { Reveal } from "./Reveal";

/** Coverage tiles. Hover reveals status and control count (adds information, not decoration). */
export function CoverageGrid({ limit, compact = false }: { limit?: number; compact?: boolean }) {
  const list = limit ? frameworks.slice(0, limit) : frameworks;
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {list.map((f, i) => (
        <Reveal as="li" key={f.slug} delay={Math.min(i, 6) * 0.04}>
          <Tile f={f} compact={compact} />
        </Reveal>
      ))}
    </ul>
  );
}

function Tile({ f, compact }: { f: Framework; compact: boolean }) {
  return (
    <Link
      to={`/coverage/${f.slug}`}
      className={`group block h-full rounded-[var(--radius)] border bg-surface p-5 transition-colors duration-150 hover:border-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        f.status === "planned" ? "border-dashed border-line" : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="mono-label">{f.body}</span>
        <StatusChip status={f.status} />
      </div>
      <div className="mt-4 font-medium text-[16px] text-ink leading-[1.3]">{f.id}</div>
      <div className="mt-1 text-[14px] text-ink-2">{f.name}</div>
      {!compact && (
        <div className="mt-4 pt-3 border-t border-line-soft font-mono text-[11px] text-ink-3 transition-colors duration-150 group-hover:text-brand-ink">
          {f.controls}
        </div>
      )}
    </Link>
  );
}
