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
          <article className="group grid grid-cols-1 md:grid-cols-[160px_1fr] gap-2 md:gap-8 py-5 px-2 -mx-2 border-b border-line-soft rounded-[var(--radius)] transition-colors duration-150 hover:bg-surface">
            <div className="flex md:flex-col items-baseline md:items-start gap-3 md:gap-1">
              <time dateTime={e.date} className="font-mono text-[12px] text-ink-3 transition-colors duration-150 group-hover:text-brand-ink">
                {fmt(e.date)}
              </time>
              <span className="mono-label">{e.tag}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-[17px] font-medium text-ink">{e.title}</h3>
              <p className="mt-1.5 text-[15px] text-ink-2 measure">{e.body}</p>
            </div>
          </article>
        </Reveal>
      ))}
    </ol>
  );
}
