import { Link, useParams } from "react-router";
import { NotFound } from "./NotFound";
import { PageHeader, Section, SectionHead, StatusChip, Btn, TextLink } from "../components/site/primitives";
import { Reveal } from "../components/site/Reveal";
import { CoverageGrid } from "../components/site/CoverageGrid";
import { frameworks } from "../data/coverage";
import { usePageMeta } from "../components/site/Seo";

export function Coverage() {
  usePageMeta("Coverage", "Frameworks and regulations the Strativu GRC product maps to, with an honest status per framework: supported, mapping, or planned.");
  const supported = frameworks.filter((f) => f.status === "supported").length;
  const mapping = frameworks.filter((f) => f.status === "in-progress").length;
  const planned = frameworks.filter((f) => f.status === "planned").length;
  return (
    <>
      <PageHeader
        eyebrow="Coverage"
        title="Frameworks and regulations the GRC product maps to."
        lead="Each standard is a view on the shared control set. Status is stated at tile level and kept honest: a small supported list beats a large aspirational one."
      >
        <dl className="flex flex-wrap gap-6 text-[13.5px] text-ink-3">
          <div><dt className="inline">Supported </dt><dd className="inline font-medium text-ink">{supported}</dd></div>
          <div><dt className="inline">Mapping </dt><dd className="inline font-medium text-ink">{mapping}</dd></div>
          <div><dt className="inline">Planned </dt><dd className="inline font-medium text-ink">{planned}</dd></div>
        </dl>
      </PageHeader>
      <Section>
        <CoverageGrid />
      </Section>
      <Section tone="surface">
        <SectionHead eyebrow="Missing one?" title="Tell us which standard your auditor asks about." lead="Framework mapping is prioritised by early-access participants. If your programme is audited against something not listed, it can move up the list." />
        <Btn to="/early-access" arrow>Request early access</Btn>
      </Section>
    </>
  );
}

export function FrameworkPage() {
  const { slug } = useParams();
  const f = frameworks.find((x) => x.slug === slug);
  usePageMeta(f ? f.id : "Page not found", f ? `${f.name}. ${f.summary}` : "The page you asked for does not exist.");
  if (!f) return <NotFound />;
  const i = frameworks.indexOf(f);
  const prev = frameworks[(i - 1 + frameworks.length) % frameworks.length];
  const next = frameworks[(i + 1) % frameworks.length];
  return (
    <>
      <PageHeader eyebrow={`Coverage · ${f.body}`} title={f.id} lead={f.name}>
        <div className="flex flex-wrap items-center gap-4">
          <StatusChip status={f.status} />
          <span className="text-[13.5px] text-ink-3">{f.controls}</span>
        </div>
      </PageHeader>
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-[17px] text-ink-2 measure">{f.summary}</p>
              <h2 className="mt-10 text-[22px] text-ink">What Strativu models</h2>
              <ul className="mt-4 space-y-3">
                {f.detail.map((d) => (
                  <li key={d} className="flex gap-3 text-[15.5px] text-ink-2"><span className="mt-[11px] w-1.5 h-[1.5px] bg-brand shrink-0" aria-hidden />{d}</li>
                ))}
              </ul>
            </Reveal>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.08}>
              <div className="rounded-[var(--radius)] border border-line bg-surface/85 backdrop-blur-md p-6">
                <p className="mono-label">Status</p>
                <p className="mt-2 text-[15px] text-ink-2">
                  {f.status === "supported" && "Mapped to the shared control set and usable in the current build."}
                  {f.status === "in-progress" && "Being mapped now. Partial coverage is visible in the product, marked as draft."}
                  {f.status === "planned" && "On the roadmap. Priority is set by early-access participants."}
                </p>
                <div className="mt-5"><Btn to="/early-access" arrow className="w-full">Request early access</Btn></div>
              </div>
            </Reveal>
          </aside>
        </div>
        <nav className="mt-12 pt-6 border-t border-line flex justify-between font-mono text-[12px]">
          <Link to={`/coverage/${prev.slug}`} className="text-ink-3 hover:text-ink transition-colors">← {prev.id}</Link>
          <Link to={`/coverage/${next.slug}`} className="text-ink-3 hover:text-ink transition-colors">{next.id} →</Link>
        </nav>
        <div className="mt-6"><TextLink to="/coverage">All frameworks</TextLink></div>
      </Section>
    </>
  );
}
