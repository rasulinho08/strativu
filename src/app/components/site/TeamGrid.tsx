import { team, type TeamMember } from "../../data/team";
import { Reveal } from "./Reveal";
import { ArrowUpRight } from "lucide-react";

function Avatar({ m }: { m: TeamMember }) {
  if (m.photo) {
    return <img src={m.photo} alt={m.name ?? m.role} className="w-full aspect-square object-cover rounded-[var(--radius)] border border-line" />;
  }
  const initials = (m.name ?? m.role).split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  return (
    <div className="w-full aspect-square rounded-[var(--radius)] border border-line bg-surface-2 flex items-center justify-center">
      <span className="font-mono text-[13px] tracking-[0.1em] text-ink-3">{initials}</span>
    </div>
  );
}

export function TeamGrid({ members = team }: { members?: TeamMember[] }) {
  return (
    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
      {members.map((m, i) => (
        <Reveal as="li" key={m.role + i} delay={i * 0.05}>
          <Avatar m={m} />
          <div className="mt-4">
            {m.name && <div className="font-medium text-[16px] text-ink">{m.name}</div>}
            <div className={m.name ? "mono-label mt-1" : "font-medium text-[16px] text-ink"}>{m.role}</div>
            <p className="mt-2 text-[14px] text-ink-2 leading-[1.55]">{m.focus}</p>
            {m.links && m.links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {m.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="link-line arrow-shift inline-flex items-center gap-1 text-[13px] text-brand-ink">
                    {l.label} <ArrowUpRight className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      ))}
    </ul>
  );
}
