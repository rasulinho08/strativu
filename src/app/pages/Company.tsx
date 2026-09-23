import { PageHeader, Section, SectionHead, Eyebrow, Btn } from "../components/site/primitives";
import { Reveal } from "../components/site/Reveal";
import { ClosingCTA } from "../components/site/ClosingCTA";
import { EarlyAccessForm } from "../components/site/EarlyAccessForm";
import { site } from "../data/site";
import { Mail, MapPin, Clock } from "lucide-react";
import { Link } from "react-router";
import { usePageMeta } from "../components/site/Seo";

export function About() {
  usePageMeta("About", "Strativu is a small company in Baku building a GRC platform where the control register is the system of record.");
  return (
    <>
      {/* About is the one page allowed to be expressive. */}
      <PageHeader
        eyebrow="Company"
        title={<>We are building the GRC tool we wanted to use while running compliance programmes ourselves.</>}
        lead="Strativu is a small company based in Baku. The founding team has run security and compliance programmes, sat across the table from auditors, and built the multi-tenant platforms that hold other companies' data."
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Reveal>
              <Eyebrow>Why Strativu exists</Eyebrow>
              <h2 className="text-[28px] md:text-[34px] text-ink">The category is full. The problem is still there.</h2>
            </Reveal>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal delay={0.08}>
              <div className="space-y-5 text-[16.5px] text-ink-2 measure">
                <p>There is no shortage of compliance automation. What we kept finding, on both sides of the audit, is tooling that automates the collection of screenshots rather than removing the need for them, and control registers that exist once per framework because the product was built for one framework first.</p>
                <p>We are starting from the model rather than the checklist. A register that is the system of record. Controls that are written once and projected onto standards. Evidence read from systems by machines and hashed on the way in. A log that an auditor can read without asking us to export it.</p>
                <p>That is slower to build than a checklist with integrations, and it is the only version of this product we would trust with our own programme.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHead eyebrow="Where" title="Baku, building for Europe." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: MapPin, k: "Registered", v: `${site.company.legalName}. ${site.company.jurisdiction}.` },
            { icon: Clock, k: "Working hours", v: "09:00–18:00 AZT (UTC+4). Overlaps the full European working day." },
            { icon: Mail, k: "Email", v: site.company.email },
          ].map((c, i) => (
            <Reveal as="div" key={c.k} delay={i * 0.05}>
              <div className="h-full rounded-[var(--radius)] border border-line bg-surface/85 backdrop-blur-md p-6">
                <c.icon className="w-4 h-4 text-brand-ink" strokeWidth={1.75} />
                <p className="mt-4 mono-label">{c.k}</p>
                <p className="mt-1.5 text-[15px] text-ink">{c.v}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <ClosingCTA />
    </>
  );
}

export function Contact() {
  usePageMeta("Contact", "Product questions, partnership, press, or a framework you need mapped. A named person replies within two working days.");
  return (
    <>
      <PageHeader eyebrow="Company · Contact" title="Talk to a person." lead="Product questions, partnership, press, or a framework you need mapped. A named person replies within two working days." />
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <Reveal><EarlyAccessForm kind="contact" /></Reveal>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.08}>
              <div className="rounded-[var(--radius)] border border-line bg-surface/85 backdrop-blur-md p-6 space-y-5 text-[15px]">
                <div><p className="mono-label">Email</p><a href={`mailto:${site.company.email}`} className="mt-1 block text-ink link-line">{site.company.email}</a></div>
                <div><p className="mono-label">Address</p><p className="mt-1 text-ink">{site.company.address}</p></div>
                <div><p className="mono-label">Security disclosures</p><p className="mt-1 text-ink-2">See the <Link to="/trust" className="text-brand-ink link-line">Trust page</Link> for the disclosure policy.</p></div>
                <div><p className="mono-label">Early access</p><p className="mt-1 text-ink-2">Use the <Link to="/early-access" className="text-brand-ink link-line">early access form</Link> if you run a compliance programme and want in.</p></div>
              </div>
            </Reveal>
          </aside>
        </div>
      </Section>
    </>
  );
}

export function EarlyAccess() {
  usePageMeta("Early access", "Early access to the Strativu GRC product for teams that run a compliance programme against a supported framework.");
  return (
    <>
      <PageHeader
        eyebrow={`Early access · ${site.status.detail}`}
        title="Shape the product before it ships."
        lead="Early access is open to a small number of teams that run a compliance programme against at least one of the supported frameworks. Here is exactly what it means."
      />
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Reveal>
              <dl className="space-y-7">
                {[
                  { k: "Who it is for", v: "Security, compliance or platform leads at organisations audited against ISO 27001, SOC 2 or a framework on the coverage list. Team size does not matter; having a real audit window does." },
                  { k: "What you get", v: "A tenant on the development build, a direct channel to the engineers, and mapping priority for the frameworks you name. No cost during early access." },
                  { k: "What we ask", v: "One 45-minute call a month, honest feedback on what breaks, and permission to use what we learn (never your data) to shape the product." },
                  { k: "What happens next", v: "We review requests weekly and reply from a named person within five working days. If it is not a fit yet, we say so and why." },
                ].map((d) => (
                  <div key={d.k}>
                    <dt className="mono-label">{d.k}</dt>
                    <dd className="mt-2 text-[15.5px] text-ink-2 measure">{d.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.08}>
              <div className="rounded-[var(--radius)] border border-line bg-surface/85 backdrop-blur-md p-6 md:p-8">
                <EarlyAccessForm kind="early-access" />
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}

export function Trust() {
  usePageMeta("Trust", "How Strativu handles data before it has a certification: architecture, hosting, subprocessors, disclosure policy.");
  const rows: { k: string; v: string; link?: string }[] = [
    { k: "Architecture", v: "Row-level tenant isolation, per-tenant encryption keys, append-only hash-chained audit trail. Full notes on the architecture page." , link: "/platform/architecture" },
    { k: "Hosting", v: "EU (Frankfurt), managed cloud. Region fixed per tenant at creation." },
    { k: "Subprocessors", v: "Cloud hosting provider (EU), transactional email provider, error monitoring. The named list is published to early-access tenants and will be public at launch." },
    { k: "Certifications", v: "None yet. Pursuing ISO/IEC 27001:2022 certification and a SOC 2 Type II report, targeted for the twelve months following general availability. We use our own product to run the programme." },
    { k: "Vulnerability disclosure", v: `Report to ${site.company.email} with “security” in the subject. Acknowledgement within two working days, status update within ten. No legal action against good-faith research.` },
    { k: "Data handling pre-launch", v: "Early-access tenants run on the development build. We do not use tenant data for anything other than operating the service, and we will delete it on request within 30 days." },
  ];
  return (
    <>
      <PageHeader eyebrow="Trust" title="How we handle data, before we have a badge to show for it." lead="A GRC vendor should model the behaviour it sells. This page says what is true now, what we are pursuing, and when." />
      <Section>
        <dl className="border-t border-line">
          {rows.map((r, i) => (
            <Reveal as="div" key={r.k} delay={Math.min(i, 4) * 0.04}>
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8 py-6 border-b border-line-soft">
                <dt className="mono-label pt-1">{r.k}</dt>
                <dd className="text-[15.5px] text-ink-2 measure">
                  {r.v}
                  {r.link && <> <Link to={r.link} className="text-brand-ink link-line">Read more</Link>.</>}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
        <div className="mt-10"><Btn to="/company/contact" variant="secondary">Ask a security question</Btn></div>
      </Section>
    </>
  );
}
