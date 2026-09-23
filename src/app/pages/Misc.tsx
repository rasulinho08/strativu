import { useParams } from "react-router";
import { NotFound } from "./NotFound";
import { PageHeader, Section, Prose } from "../components/site/primitives";
import { ChangelogList } from "../components/site/ChangelogList";
import { site } from "../data/site";
import { usePageMeta } from "../components/site/Seo";
import type { ReactNode } from "react";

export function Changelog() {
  usePageMeta("Changelog", "Public build log for the Strativu platform: what changed and why, with real dates.");
  return (
    <>
      <PageHeader eyebrow="Changelog" title="Public build log." lead="What changed and why, in plain language, with real dates. Written as an engineering log, not a news feed." />
      <Section><ChangelogList /></Section>
    </>
  );
}

/**
 * Hüquqi səhifələr — ümumi şablon. Hüquqşünasla yoxlanılmalıdır.
 */
const LEGAL: Record<string, { title: string; updated: string; body: ReactNode }> = {
  privacy: {
    title: "Privacy policy",
    updated: "2026-09-01",
    body: (
      <>
        <h2>Who we are</h2>
        <p>{site.company.legalName}, {site.company.jurisdiction}. Contact: <a href={`mailto:${site.company.email}`}>{site.company.email}</a>.</p>
        <h2>What we collect on this site</h2>
        <p>Form submissions (name, work email, company, role, message) sent through our form provider, and standard server logs. We do not run advertising trackers.</p>
        <h2>Why</h2>
        <p>To reply to your request. We do not add you to a mailing list and we do not share your details with third parties other than the processors needed to operate the site.</p>
        <h2>Retention</h2>
        <p>Form submissions are kept for 12 months from the last contact, then deleted. You can ask for deletion earlier at any time.</p>
        <h2>Your rights</h2>
        <p>Access, rectification, erasure, restriction, portability and objection, under the GDPR and the Law of the Republic of Azerbaijan on Personal Data. Write to the address above.</p>
      </>
    ),
  },
  terms: {
    title: "Terms of use",
    updated: "2026-09-01",
    body: (
      <>
        <h2>Scope</h2>
        <p>These terms govern use of this website. Use of the Strativu product during early access is governed by a separate early-access agreement.</p>
        <h2>Content</h2>
        <p>Content on this site describes a product in development. Framework coverage and status are stated as accurately as we can at the time of writing and may change.</p>
        <h2>Liability</h2>
        <p>The site is provided as is. To the extent permitted by law, {site.company.legalName} is not liable for loss arising from reliance on the site's content.</p>
        <h2>Governing law</h2>
        <p>Laws of the Republic of Azerbaijan.</p>
      </>
    ),
  },
  dpa: {
    title: "Data processing agreement",
    updated: "2026-09-01",
    body: (
      <>
        <p>A data processing agreement is provided to every early-access tenant before any personal data is processed. It covers subject matter and duration, nature and purpose of processing, categories of data and data subjects, subprocessors, security measures, audit rights, and deletion on termination.</p>
        <p>Request a copy at <a href={`mailto:${site.company.email}`}>{site.company.email}</a>.</p>
      </>
    ),
  },
};

export function Legal() {
  const { doc } = useParams();
  const page = doc ? LEGAL[doc] : undefined;
  usePageMeta(page?.title ?? "Page not found", page ? `${page.title}, updated ${page.updated}.` : "The page you asked for does not exist.");
  if (!page) return <NotFound />;
  return (
    <>
      <PageHeader eyebrow={`Legal · Updated ${page.updated}`} title={page.title} />
      <Section><Prose>{page.body}</Prose></Section>
    </>
  );
}
