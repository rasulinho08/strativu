import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { frameworks, type Framework } from "../../data/coverage";
import { StatusChip } from "./primitives";
import { Reveal } from "./Reveal";

/** Coverage tiles. Each tile shows body, status and control count. */
export function CoverageGrid({ limit }: { limit?: number }) {
  const list = limit ? frameworks.slice(0, limit) : frameworks;
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map((f, i) => (
        <Reveal as="li" key={f.slug} delay={Math.min(i, 6) * 0.045}>
          <Tile f={f} />
        </Reveal>
      ))}
    </ul>
  );
}

function Tile({ f }: { f: Framework }) {
  return (
    <Link
      to={`/coverage/${f.slug}`}
      className={`card card-hover group block h-full p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        f.status === "planned" ? "border-dashed" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="mono-label">{f.body}</span>
        <StatusChip status={f.status} />
      </div>
      <div className="mt-4 text-[16px] font-medium leading-[1.3] tracking-[-0.01em] text-ink">{f.id}</div>
      <div className="mt-1.5 text-[14px] text-ink-2">{f.name}</div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line-soft pt-3.5">
        <span className="text-[12.5px] text-ink-3">
          {f.controls}
        </span>
        <ArrowUpRight
          className="h-4 w-4 text-ink-4 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  );
}
