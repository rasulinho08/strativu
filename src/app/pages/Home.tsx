import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Btn, Container, Section, SectionHead, TextLink, Eyebrow } from "../components/site/primitives";
import { Reveal, Stagger } from "../components/site/Reveal";
import { SpotlightCard, StatusPill } from "../components/site/fx";
import { HeroMock, MockById } from "../components/site/ProductMock";
import { CoverageGrid } from "../components/site/CoverageGrid";
import { ClosingCTA } from "../components/site/ClosingCTA";
import { usePageMeta } from "../components/site/Seo";
import { capabilities } from "../data/capabilities";
import { frameworks } from "../data/coverage";
import { site } from "../data/site";

const MANIFESTO =
  "Compliance should not be a folder of screenshots. We are building a GRC platform where one control set satisfies every framework, evidence is collected by the system, and every change is on the record.";

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

/** Bento: two wide cells lead, three standard cells follow, one full-width cell closes. */
const BUILT = [
  {
    k: "Tenancy",
    v: "Row-level isolation with a per-tenant encryption key, enforced at the data layer. No tenant identifier is ever a request parameter.",
    span: "lg:col-span-3",
    mono: "isolation: row-level · key: per-tenant",
  },
  {
    k: "Audit trail",
    v: "Append-only, hash-chained log of every write. Actor, tenant, object, before/after diff. Verifiable without trusting the application.",
    span: "lg:col-span-3",
    mono: "chain: sha256",
  },
  {
    k: "Permissions",
    v: "Role- and attribute-based. Auditors get scoped, read-only, time-boxed sessions that are themselves logged.",
    span: "lg:col-span-2",
    mono: "rbac + abac",
  },
  {
    k: "API-first",
    v: "Every screen is built on the public API. Nothing in the UI is possible that is not possible through the API.",
    span: "lg:col-span-2",
    mono: "openapi 3.1",
  },
  {
    k: "Data residency",
    v: "EU (Frankfurt) at launch. Region is fixed per tenant at creation and cannot move silently.",
    span: "lg:col-span-2",
    mono: "eu-central-1",
  },
  {
    k: "Evidence integrity",
    v: "Every artefact is hashed on ingest and re-verified on read. A changed file is flagged, never quietly replaced.",
    span: "lg:col-span-6",
    mono: "verify on ingest · verify on read",
  },
];

/* ── Manifesto: words light up as the paragraph scrolls through the viewport ── */
function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  );
}

function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = MANIFESTO.split(" ");
  return (
    <section className="relative py-28 md:py-44">
      <Container>
        <p className="chapter mb-8">
          <b>00</b> · Why Strativu
        </p>
        <p ref={ref} className="max-w-[20ch] text-[clamp(30px,4.6vw,64px)] font-semibold leading-[1.08] tracking-[-0.035em] text-ink md:max-w-[22ch]">
          {reduce
            ? MANIFESTO
            : words.map((w, i) => (
                <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
              ))}
        </p>
      </Container>
    </section>
  );
}

/* ── Infinite framework ticker ── */
function FrameworkTicker() {
  const items = frameworks.map((f) => f.id.split(" (")[0]);
  const row = (hidden?: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden}>
      {items.map((it) => (
        <li key={it} className="flex items-center gap-10 pr-10 text-[15px] font-medium text-ink-2">
          <span className="h-1.5 w-1.5 rotate-45 bg-brand/70" aria-hidden />
          {it}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee marquee-mask overflow-hidden">
      <div className="marquee-track" style={{ ["--marquee-duration" as string]: "48s" }}>
        {row()}
        {row(true)}
      </div>
    </div>
  );
}

export default function Home() {
  usePageMeta(
    null,
    "Strativu is building a GRC platform where one control set satisfies every framework and evidence is collected by the system, not the team. In development. Early access opening 2027."
  );

  return (
    <>
      {/* ── 01 Hero: full screen, the 3D mark sits to the right (top on mobile) ── */}
      <section className="relative flex min-h-[100svh] flex-col justify-end pb-10 pt-[46svh] md:justify-center md:pb-0 md:pt-24">
        <Container>
          <div className="max-w-[680px]">
            <Stagger>
              <StatusPill label={site.status.label} detail={site.status.detail} />
              <h1 className="t-display mt-7 text-ink">
                Compliance evidence, <span className="text-grad">engineered.</span>
              </h1>
              <p className="t-lead mt-7 max-w-[52ch]">
                A GRC platform where one control set satisfies every framework and evidence is collected by the
                system, not the team.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Btn to="/early-access" size="lg" arrow>
                  Request early access
                </Btn>
                <Btn to="/platform" size="lg" variant="secondary">
                  Explore the platform
                </Btn>
              </div>
            </Stagger>
          </div>
        </Container>
        <div className="absolute inset-x-0 bottom-8 hidden justify-center md:flex">
          <span className="scroll-cue" aria-hidden />
        </div>
      </section>

      {/* ── Frameworks ticker ── */}
      <div className="relative z-10 border-y border-line bg-ground/50 py-6 backdrop-blur-xl">
        <FrameworkTicker />
      </div>

      {/* ── 02 Manifesto ── */}
      <Manifesto />

      {/* ── 03 Positions ── */}
      <Section tone="surface">
        <SectionHead eyebrow="What we believe" title="Three positions the product is built on." />
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {THESIS.map((t, i) => (
            <Reveal as="li" key={t.n} delay={i * 0.08}>
              <SpotlightCard className="rim flex h-full flex-col p-8 md:p-9">
                <span className="text-grad text-[44px] font-semibold leading-none tracking-[-0.04em]">{t.n}</span>
                <h3 className="mt-8 text-[20px] leading-[1.3] tracking-[-0.015em] text-ink">{t.title}</h3>
                <p className="mt-4 text-[15px] leading-[1.65] text-ink-2">{t.body}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* ── 04 The problem ── */}
      <Section>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>The problem</Eyebrow>
              <h2 className="t-h2 text-ink">The register lives in a spreadsheet, and the spreadsheet is the product.</h2>
              <div className="card mt-10 p-5 font-mono text-[12.5px] leading-[2] text-ink-3">
                <div>iso-27001-controls-v7-FINAL.xlsx</div>
                <div>soc2-matrix-2026-copy.xlsx</div>
                <div>evidence-q3/screenshots/…</div>
                <div className="text-warn line-through decoration-warn/60">access-review-final-final.pdf</div>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.1}>
              <div className="measure space-y-6 text-[17px] leading-[1.75] text-ink-2">
                <p>
                  A team audited against ISO 27001 and SOC 2 keeps two control matrices. Each row says roughly the same
                  thing in a different vocabulary: <span className="font-mono text-[14px] text-ink">A.5.17</span> here,{" "}
                  <span className="font-mono text-[14px] text-ink">CC6.1</span> there. When the MFA policy changes, both
                  rows have to change, and one of them will not.
                </p>
                <p>
                  Six weeks before the audit window, evidence collection starts. Screenshots of IAM consoles, exports of
                  access reviews, PDFs of policies with a date typed into the footer.
                </p>
                <p>
                  The auditor asks for a population and a sample. Nobody can say with certainty that the population is
                  complete, because the system of record is a folder.
                </p>
                <p className="border-l-2 border-brand pl-5 text-[19px] leading-[1.6] text-ink">
                  Strativu starts from the other end: a control register that is the system of record, evidence attached
                  by machines, and a log that answers “can you show me?” without a scramble.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ── 05 Capabilities ── */}
      <Section tone="surface" id="capabilities">
        <SectionHead eyebrow="The product" title="Three things it does, done properly." />
        <div className="space-y-24 md:space-y-36">
          {capabilities.map((c, i) => {
            const Mock = MockById[c.id];
            const flip = i % 2 === 1;
            return (
              <div key={c.id} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
                <Reveal className={`lg:col-span-5 ${flip ? "lg:order-2 lg:col-start-8" : ""}`}>
                  <p className="chapter">
                    <b>0{i + 1}</b> · {c.eyebrow}
                  </p>
                  <h3 className="t-h2 mt-5 text-ink">{c.title}</h3>
                  <p className="mt-5 text-[17px] leading-[1.7] text-ink-2">{c.body}</p>
                  <div className="mt-8">
                    <TextLink to={c.link.href}>{c.link.label}</TextLink>
                  </div>
                </Reveal>
                <Reveal className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`} delay={0.12}>
                  <Mock />
                </Reveal>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── 06 Product preview ── */}
      <Section>
        <SectionHead
          align="center"
          eyebrow="Target interface"
          title="The control register, as it will ship."
          lead="Control register and control detail from the product design. Names and IDs are illustrative."
        />
        <Reveal>
          <HeroMock />
        </Reveal>
      </Section>

      {/* ── 07 Coverage ── */}
      <Section tone="surface" id="coverage">
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>Coverage</Eyebrow>
            <h2 className="t-h2 text-ink">Navigate by the standard your auditor asks about.</h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-[16px] leading-[1.6] text-ink-2">
              Each framework maps onto the shared control set. Status is stated per framework: supported in the current
              build, being mapped, or planned.
            </p>
            <div className="mt-5">
              <TextLink to="/coverage">All {frameworks.length} frameworks</TextLink>
            </div>
          </div>
        </div>
        <CoverageGrid limit={8} />
      </Section>

      {/* ── 08 How it is built ── */}
      <Section id="architecture">
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>How it is built</Eyebrow>
            <h2 className="t-h2 text-ink">Engineered, not assembled.</h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-[16px] leading-[1.6] text-ink-2">
              Written for the engineer who has to sign off on the vendor review. The full design notes are on the
              architecture page.
            </p>
            <div className="mt-5">
              <TextLink to="/platform/architecture">Architecture</TextLink>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {BUILT.map((b, i) => (
            <Reveal key={b.k} delay={Math.min(i, 5) * 0.05} className={b.span}>
              <SpotlightCard className="rim flex h-full flex-col justify-between p-7 md:p-8">
                <div>
                  <h3 className="text-[18px] font-medium tracking-[-0.015em] text-ink">{b.k}</h3>
                  <p className="mt-3 text-[15px] leading-[1.6] text-ink-2">{b.v}</p>
                </div>
                <p className="mt-6 border-t border-line-soft pt-4 font-mono text-[12px] text-brand-ink/80">{b.mono}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-8">
          <TextLink to="/changelog">Public build log</TextLink>
          <TextLink to="/company/about">About the company</TextLink>
          <TextLink to="/trust">Trust and data handling</TextLink>
        </div>
      </Section>

      {/* ── 09 Closing: the 3D mark returns to centre above this ── */}
      <ClosingCTA stage />
    </>
  );
}
