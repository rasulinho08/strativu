import { changelog, type ChangelogEntry } from "../../data/changelog";
import { Reveal } from "./Reveal";

function fmt(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function ChangelogList({ limit, entries = changelog }: { limit?: number; entries?: ChangelogEntry[] }) {
  const list = limit ? entries.slice(0, limit) : entries;
  return (
    <ol className="border-t border-line">
      {list.map((e, i) => (
        <Reveal as="li" key={e.date + e.title} delay={Math.min(i, 5) * 0.04}>
          <article className="group -mx-3 grid grid-cols-1 gap-2 rounded-[var(--r-md)] border-b border-line-soft px-3 py-6 transition-colors duration-200 hover:bg-surface-2/60 md:grid-cols-[170px_1fr] md:gap-8">
            <div className="flex md:flex-col items-baseline md:items-start gap-3 md:gap-1">
              <time dateTime={e.date} className="tabular font-mono text-[12px] text-ink-3 transition-colors duration-200 group-hover:text-brand">
                {fmt(e.date)}
              </time>
              <span className="mono-label">{e.tag}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-[17.5px] font-medium tracking-[-0.015em] text-ink">{e.title}</h3>
              <p className="mt-1.5 text-[15px] text-ink-2 measure">{e.body}</p>
            </div>
          </article>
        </Reveal>
      ))}
    </ol>
  );
}
