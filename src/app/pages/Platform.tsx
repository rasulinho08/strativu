import { PageHeader, Section, SectionHead, TextLink, Eyebrow, Btn } from "../components/site/primitives";
import { Reveal } from "../components/site/Reveal";
import { SystemDiagram } from "../components/site/SystemDiagram";
import { MappingMock, EvidenceMock, AuditMock } from "../components/site/ProductMock";
import { ClosingCTA } from "../components/site/ClosingCTA";
import { CoverageGrid } from "../components/site/CoverageGrid";
import { site } from "../data/site";
import { usePageMeta } from "../components/site/Seo";

const PRINCIPLES = [
  { k: "System of record first", v: "Every product starts as a set of registers with owners, review cycles and an audit trail. Screens come after the model is right." },
  { k: "Machines collect, people decide", v: "If a fact can be read from a system, a collector reads it. Human effort is spent on exceptions, judgement and sign-off." },
  { k: "Frameworks are views", v: "Standards are projections over one control set. Adding a framework is a mapping exercise, not a migration." },
  { k: "Verifiable by outsiders", v: "Auditors, customers and regulators get scoped read access to the same records the team uses. No exported snapshot, no parallel truth." },
];

export function Platform() {
  usePageMeta("Platform", "One model for governance, risk and compliance: registers, controls, evidence, workflow and reporting under an append-only audit trail.");
  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="One model for governance, risk and compliance. GRC is the first product on it."
        lead="Strativu is a platform company. The object graph below — registers, controls, evidence, workflow, reporting, all under an append-only audit trail — is shared by every product we build on it."
      >
        <div className="flex flex-wrap gap-3">
          <Btn to="/platform/grc" arrow>The GRC product</Btn>
          <Btn to="/platform/architecture" variant="secondary">Architecture</Btn>
        </div>
      </PageHeader>

      <Section>
        <SectionHead eyebrow="The model" title="Five object types, one graph." />
        <Reveal><SystemDiagram /></Reveal>
      </Section>

      <Section tone="surface">
        <SectionHead eyebrow="How we build" title="Four principles that hold across products." />
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRINCIPLES.map((p, i) => (
            <Reveal as="div" key={p.k} delay={i * 0.05}>
              <div className="h-full rounded-[var(--radius)] border border-line bg-ground/80 backdrop-blur-md p-6">
                <dt className="text-[18px] font-medium text-ink">{p.k}</dt>
                <dd className="mt-2 text-[15px] text-ink-2">{p.v}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </Section>

      <Section>
        <SectionHead eyebrow="Products" title="What runs on the platform today." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Reveal>
            <div className="h-full rounded-[var(--radius)] border border-line bg-surface/85 backdrop-blur-md p-7">
              <div className="flex items-center justify-between">
                <Eyebrow className="!mb-0">GRC</Eyebrow>
                <span className="mono-label normal-case tracking-[0.04em]">{site.status.label}</span>
              </div>
              <h3 className="mt-4 text-[24px] text-ink">Governance, Risk & Compliance</h3>
              <p className="mt-3 text-[15.5px] text-ink-2">Control register, risk register, automated evidence, cross-framework mapping and audit-ready reporting for ISO 27001, SOC 2 and the frameworks on the coverage page.</p>
              <div className="mt-6"><TextLink to="/platform/grc">Product page</TextLink></div>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="h-full rounded-[var(--radius)] border border-dashed border-line p-7">
              <Eyebrow className="!mb-0 !text-ink-3">Next</Eyebrow>
              <h3 className="mt-4 text-[24px] text-ink-2">Second product line</h3>
              <p className="mt-3 text-[15.5px] text-ink-3">The model is designed so a second product slots in at /platform/&lt;name&gt; without an information-architecture rewrite. We will name it when it is real.</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <ClosingCTA />
    </>
  );
}

export function PlatformGRC() {
  usePageMeta("GRC product", "A GRC product where the control register is the system of record: one control set, collector-attached evidence, a hash-chained audit trail.");
  return (
    <>
      <PageHeader
        eyebrow={`Platform · GRC · ${site.status.label}`}
        title="A GRC product where the control register is the system of record."
        lead="Built for teams audited against more than one standard. One control set, evidence attached by collectors, an audit trail that answers the auditor's questions directly."
      >
        <Btn to="/early-access" arrow>Request early access</Btn>
      </PageHeader>

      <Section id="mapping">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <Reveal className="lg:col-span-5">
            <Eyebrow>Controls</Eyebrow>
            <h2 className="text-[28px] md:text-[34px] text-ink">Write a control once. Map it everywhere.</h2>
            <p className="mt-4 text-[16px] text-ink-2">Every control carries the attributes ISO 27001:2022 defines (type, property, concept, capability, domain) and maps to requirements in each framework you are audited against. Overlap is computed from the mapping, so adding SOC 2 to an ISO programme is a review of gaps, not a second register.</p>
            <ul className="mt-5 space-y-2 text-[15px] text-ink-2 list-disc pl-5">
              <li>Statement of Applicability generated from the register.</li>
              <li>Requirement-level overlap between frameworks.</li>
              <li>Owners, review cycles and exception handling per control.</li>
            </ul>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={0.1}><MappingMock /></Reveal>
        </div>
      </Section>

      <Section tone="surface" id="evidence">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <Reveal className="lg:col-span-7 lg:order-1"><EvidenceMock /></Reveal>
          <Reveal className="lg:col-span-5 lg:order-2" delay={0.1}>
            <Eyebrow>Evidence</Eyebrow>
            <h2 className="text-[28px] md:text-[34px] text-ink">Collectors, not screenshots.</h2>
            <p className="mt-4 text-[16px] text-ink-2">Collectors read configuration state from cloud, identity and source-control systems on a schedule and attach the result to the controls it proves. Each artefact is hashed on ingest, timestamped, and re-verified on read. Manual uploads follow the same path and are labelled as manual.</p>
            <p className="mt-4 font-mono text-[12px] text-ink-3">Collectors today: AWS IAM, GitHub. In progress: Okta, Cloudflare, Google Workspace, Azure AD.</p>
          </Reveal>
        </div>
      </Section>

      <Section id="audit">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <Reveal className="lg:col-span-5">
            <Eyebrow>Audit trail</Eyebrow>
            <h2 className="text-[28px] md:text-[34px] text-ink">Append-only. Hash-chained. Readable by your auditor.</h2>
            <p className="mt-4 text-[16px] text-ink-2">Every write to any object is appended to a chained log with actor, tenant, object and diff. Auditors get a scoped, read-only, time-boxed session that is itself logged. There is no export step because there is nothing to export: the log is the record.</p>
            <div className="mt-6"><TextLink to="/platform/architecture">How the chain is verified</TextLink></div>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={0.1}><AuditMock /></Reveal>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHead eyebrow="Coverage" title="Frameworks the GRC product maps to." />
        <CoverageGrid />
        <div className="mt-8"><TextLink to="/coverage">Coverage in detail</TextLink></div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="Development build"
          title="A screenshot from the build, not a mock."
          lead="The product mocks above show the target interface. This is the working development build as of September 2026: the command centre with task queues and the asset-risk heat map. Its visual design is being aligned to the platform system."
        />
        <Reveal>
          <div className="rounded-[var(--r-lg)] border border-line bg-surface/85 backdrop-blur-md elev overflow-hidden">
            <img
              src="/projects/grc.webp"
              width={1800}
              height={811}
              alt="Strativu GRC development build: command centre with expired, today and future task lists and an asset-risk heat map."
              className="w-full h-auto block"
              loading="lazy"
              decoding="async"
            />
          </div>
          <p className="mt-3 font-mono text-[11px] text-ink-3">Development build, September 2026. Data is illustrative.</p>
        </Reveal>
      </Section>

      <ClosingCTA />
    </>
  );
}

const ARCH = [
  {
    h: "Tenancy",
    p: [
      "Every row in every table carries a tenant identifier and is protected by a row-level security policy that reads the tenant from the authenticated session, never from a request parameter. Application code cannot query across tenants because the database will not return the rows.",
      "Each tenant has its own data-encryption key, wrapped by a per-region key in a managed KMS. Deleting a tenant destroys the key first.",
    ],
  },
  {
    h: "Audit trail",
    p: [
      "Writes go through a single command path that emits an event before the transaction commits. Events are appended to a log where each entry carries the SHA-256 of the previous entry. The chain head is published to an external timestamping service daily, so the log can be verified without trusting Strativu.",
      "Reads by external parties (auditors, customers) are logged as well. There is no privileged read path that bypasses the log.",
    ],
  },
  {
    h: "Permissions",
    p: [
      "Role-based for coarse grants (admin, editor, reviewer, auditor) and attribute-based for scope (framework, business unit, time window). An auditor session is a role plus a scope plus an expiry, issued by a tenant admin and visible in the trail.",
    ],
  },
  {
    h: "API-first",
    p: [
      "The web application is a client of the public REST API. OpenAPI 3.1 specification, versioned, with SDKs generated from it. Webhooks for every state change in the audit trail.",
    ],
  },
  {
    h: "Data residency and deployment",
    p: [
      "EU (Frankfurt) at launch. Region is chosen at tenant creation and is immutable. Single-tenant deployment is on the roadmap for regulated customers who require it; the isolation model does not depend on it.",
    ],
  },
  {
    h: "Evidence integrity",
    p: [
      "Artefacts are content-addressed: the storage key is the hash of the file. A replaced file is a new artefact with a new hash and a trail entry linking the two. Nothing is overwritten.",
    ],
  },
];

export function Architecture() {
  usePageMeta("Architecture", "Multi-tenant model, audit trail, permissions, API-first design and data residency, written for the engineer doing the vendor review.");
  return (
    <>
      <PageHeader
        eyebrow="Platform · Architecture"
        title="Multi-tenant model, audit trail, data residency."
        lead="Written for the engineer doing the vendor review. This page will do the job a SOC 2 report does, until we have one. Certifications we are pursuing are listed on the Trust page."
      />
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <p className="mono-label mb-3">On this page</p>
              <ol className="space-y-1.5">
                {ARCH.map((a) => (
                  <li key={a.h}><a href={`#${a.h.toLowerCase().replace(/\s+/g, "-")}`} className="text-[14px] text-ink-2 hover:text-ink transition-colors">{a.h}</a></li>
                ))}
              </ol>
            </div>
          </aside>
          <div className="lg:col-span-8 lg:col-start-5">
            {ARCH.map((a, i) => (
              <Reveal key={a.h} delay={Math.min(i, 3) * 0.04}>
                <section id={a.h.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-24 py-8 border-b border-line-soft first:pt-0">
                  <h2 className="text-[22px] md:text-[24px] text-ink">{a.h}</h2>
                  {a.p.map((t, j) => <p key={j} className="mt-3 text-[16px] text-ink-2 measure">{t}</p>)}
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>
      <ClosingCTA />
    </>
  );
}
