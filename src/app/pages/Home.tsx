import { Link } from "react-router";
import { Btn, Container, Section, SectionHead, TextLink, Eyebrow } from "../components/site/primitives";
import { Reveal, Stagger } from "../components/site/Reveal";
import { HeroMock, MockById } from "../components/site/ProductMock";
import { SystemDiagram } from "../components/site/SystemDiagram";
import { CoverageGrid } from "../components/site/CoverageGrid";
import { ChangelogList } from "../components/site/ChangelogList";
import { TeamGrid } from "../components/site/TeamGrid";
import { LogoWall, StatsRow, TestimonialBand } from "../components/site/Proof";
import { ClosingCTA } from "../components/site/ClosingCTA";
import { capabilities } from "../data/capabilities";
import { site } from "../data/site";

const THESIS = [
  {
    n: "01",
    title: "Evidence should be collected by the system, not the team.",
    body: "If a control is proved by a configuration, the platform should read that configuration on a schedule. People review exceptions; they do not take screenshots.",
  },
  {
    n: "02",
    title: "One control set is enough. Frameworks are views on it.",
    body: "ISO 27001, SOC 2 and NIST CSF ask overlapping questions. Maintaining a register per framework is how the same control ends up with three different answers.",
  },
  {
    n: "03",
    title: "The audit trail is the product, not a feature of it.",
    body: "In GRC software every other screen is a projection of what changed, by whom, and when. That log has to be complete and tamper-evident from the first commit.",
  },
];

const BUILT = [
  { k: "Tenancy", v: "Row-level isolation with a per-tenant encryption key, enforced at the data layer. No tenant identifier is ever a request parameter." },
  { k: "Audit trail", v: "Append-only, hash-chained log of every write. Actor, tenant, object, before/after diff. Verifiable without trusting the application." },
  { k: "Permissions", v: "Role- and attribute-based. Auditors get scoped, read-only, time-boxed sessions that are themselves logged." },
  { k: "API-first", v: "Every screen is built on the public API. Nothing in the UI is possible that is not possible through the API." },
  { k: "Data residency", v: "EU (Frankfurt) at launch. Region is fixed per tenant at creation and cannot move silently." },
  { k: "Evidence integrity", v: "Every artefact is hashed on ingest and re-verified on read. A changed file is flagged, never quietly replaced." },
];

export default function Home() {
  return (
    <>
      {/* ── 02 Hero ── */}
      <section className="pt-32 md:pt-44 pb-16 md:pb-24">
        <Container>
          <Stagger className="max-w-[820px]">
            <Eyebrow>Governance · Risk · Compliance</Eyebrow>
            <h1 className="text-[40px] md:text-[56px] lg:text-[64px] leading-[1.02] tracking-[-0.03em] text-ink">
              Compliance evidence, engineered.
            </h1>
            <p className="mt-6 text-[18px] md:text-[20px] text-ink-2 measure">
              Strativu is building a GRC platform where one control set satisfies every framework and evidence is collected by the system, not the team. First product: GRC. Same model underneath everything that follows.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              <Btn to="/early-access" size="lg" arrow>Request early access</Btn>
              <Btn to="/platform" size="lg" variant="secondary">See the platform</Btn>
            </div>
            <p className="mt-5 font-mono text-[12px] text-ink-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" aria-hidden />
              {site.status.label}. {site.status.detail}.
            </p>
          </Stagger>
          <Reveal className="mt-14 md:mt-20" delay={0.25}>
            <HeroMock />
            <p className="mt-3 font-mono text-[11px] text-ink-3">Control register and control detail, as the product exists today. Names and IDs are illustrative.</p>
          </Reveal>
        </Container>
      </section>

      {/* ── 03 Logo wall slot (mock; toggle in site.ts) ── */}
      <LogoWall />

      {/* ── 03b Position strip ── */}
      <Section>
        <SectionHead eyebrow="What we believe" title="Three positions the product is built on." />
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {THESIS.map((t, i) => (
            <Reveal as="li" key={t.n} delay={i * 0.06}>
              <div className="h-full rounded-[var(--radius)] border border-line bg-surface p-6 md:p-7">
                <span className="font-mono text-[11px] text-brand-ink">{t.n}</span>
                <h3 className="mt-3 text-[19px] text-ink leading-[1.3]">{t.title}</h3>
                <p className="mt-3 text-[15px] text-ink-2">{t.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* ── 04 The problem ── */}
      <Section tone="surface">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>The problem</Eyebrow>
              <h2 className="text-[28px] md:text-[34px] lg:text-[40px] text-ink">The register lives in a spreadsheet, and the spreadsheet is the product.</h2>
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.08}>
              <div className="space-y-5 text-[16.5px] text-ink-2 measure">
                <p>
                  A team audited against ISO 27001 and SOC 2 keeps two control matrices. Each row says roughly the same thing in a different vocabulary: <span className="font-mono text-[14px] text-ink">A.5.17</span> here, <span className="font-mono text-[14px] text-ink">CC6.1</span> there. When the MFA policy changes, both rows have to change, and one of them will not.
                </p>
                <p>
                  Six weeks before the audit window, evidence collection starts. Screenshots of IAM consoles, exports of access reviews, PDFs of policies with a date typed into the footer. Each artefact is named by whoever collected it and filed in a folder only they understand.
                </p>
                <p>
                  The auditor asks for a population and a sample. Nobody can say with certainty that the population is complete, because the system of record is a folder. The finding is not that a control failed. It is that the control cannot be shown.
                </p>
                <p className="text-ink">
                  Strativu starts from the other end: a control register that is the system of record, evidence attached by machines, and a log that answers “can you show me?” without a scramble.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ── 05 Platform overview ── */}
      <Section id="platform">
        <SectionHead
          eyebrow="Platform"
          title="Five object types. One shared model."
          lead="Registers describe the organisation. Controls describe how it protects itself. Evidence proves it. Workflow and reporting sit underneath, and the audit trail records everything. GRC is the first product on this model."
        />
        <Reveal>
          <SystemDiagram />
        </Reveal>
        <div className="mt-8">
          <TextLink to="/platform">Read the platform thesis</TextLink>
        </div>
      </Section>

      {/* ── 06 Capability blocks ×3 ── */}
      <Section tone="surface" id="capabilities">
        <div className="space-y-24 md:space-y-32">
          {capabilities.map((c, i) => {
            const Mock = MockById[c.id];
            const flip = i % 2 === 1;
            return (
              <div key={c.id} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                <Reveal className={`lg:col-span-5 ${flip ? "lg:order-2 lg:col-start-8" : ""}`}>
                  <Eyebrow>{c.eyebrow}</Eyebrow>
                  <h3 className="text-[26px] md:text-[32px] text-ink leading-[1.15]">{c.title}</h3>
                  <p className="mt-4 text-[16.5px] text-ink-2">{c.body}</p>
                  {site.proof.stats && c.metric && (
                    <p className="mt-6 flex items-baseline gap-3">
                      <span className="font-mono font-medium text-[30px] tracking-[-0.03em] text-ink">{c.metric.value}</span>
                      <span className="text-[14px] text-ink-2">{c.metric.label}</span>
                    </p>
                  )}
                  <div className="mt-6">
                    <TextLink to={c.link.href}>{c.link.label}</TextLink>
                  </div>
                </Reveal>
                <Reveal className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`} delay={0.1}>
                  <Mock />
                </Reveal>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── 07 Coverage grid ── */}
      <Section id="coverage">
        <SectionHead
          eyebrow="Coverage"
          title="Navigate by the standard your auditor asks about."
          lead="Each framework maps onto the shared control set. Status is stated honestly at tile level: supported now, being mapped, or planned."
        />
        <CoverageGrid limit={8} compact />
        <div className="mt-8">
          <TextLink to="/coverage">All frameworks and what each one requires</TextLink>
        </div>
      </Section>

      {/* ── Stats + testimonials (mock; toggle in site.ts) ── */}
      {(site.proof.stats || site.proof.testimonials) && (
        <Section tone="surface">
          <div className="space-y-12">
            <StatsRow />
            <TestimonialBand />
          </div>
        </Section>
      )}

      {/* ── 08 How it is built ── */}
      <Section id="architecture">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Reveal>
              <Eyebrow>How it is built</Eyebrow>
              <h2 className="text-[28px] md:text-[34px] lg:text-[40px] text-ink">Engineered, not assembled.</h2>
              <p className="mt-4 text-[16px] text-ink-2">Written for the engineer who has to sign off on the vendor review. The full design notes are on the architecture page.</p>
              <div className="mt-6"><TextLink to="/platform/architecture">Architecture</TextLink></div>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <dl className="border-t border-line">
              {BUILT.map((b, i) => (
                <Reveal as="div" key={b.k} delay={i * 0.04}>
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-8 py-5 border-b border-line-soft">
                    <dt className="mono-label pt-1">{b.k}</dt>
                    <dd className="text-[15.5px] text-ink-2 measure">{b.v}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* ── 09 Where we are ── */}
      <Section tone="surface" id="changelog">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Reveal>
              <Eyebrow>Where we are</Eyebrow>
              <h2 className="text-[28px] md:text-[34px] text-ink">A build log that moves.</h2>
              <p className="mt-4 text-[16px] text-ink-2">Dated entries, plain language, what changed and why. The full log is public.</p>
              <div className="mt-6"><TextLink to="/changelog">Full changelog</TextLink></div>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <ChangelogList limit={4} />
          </div>
        </div>
      </Section>

      {/* ── 10 Who is building this ── */}
      <Section id="team">
        <SectionHead
          eyebrow="Who is building this"
          title="A small team from security, compliance and platform engineering."
          lead="When there is no product proof, the people are the proof. Based in Baku, building for teams audited under European and international standards."
        />
        <TeamGrid />
        <div className="mt-10">
          <TextLink to="/company/about">About Strativu</TextLink>
        </div>
      </Section>

      {/* ── 11 Closing CTA ── */}
      <ClosingCTA />
    </>
  );
}
