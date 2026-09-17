/**
 * Public build log. Yeni giriş əlavə edəndə siyahının əvvəlinə yazın (ən yeni yuxarıda).
 * Ana səhifədə ilk 4 giriş göstərilir. Tarix formatı: YYYY-MM-DD.
 */
export type ChangelogEntry = {
  date: string;
  title: string;
  body: string;
  tag: "product" | "platform" | "coverage" | "company";
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-09-12",
    title: "Cross-framework control mapping",
    body: "A single control can now satisfy requirements in several frameworks. ISO 27001 Annex A and SOC 2 TSC share one control set; overlap is shown at requirement level.",
    tag: "product",
  },
  {
    date: "2026-08-29",
    title: "Immutable audit trail, first cut",
    body: "Every write to a control, risk or evidence record is appended to a hash-chained log. Entries carry actor, tenant, timestamp and the before/after diff.",
    tag: "platform",
  },
  {
    date: "2026-08-14",
    title: "NIST CSF 2.0 coverage in progress",
    body: "Started mapping the 106 subcategories to the shared control set. Identify and Protect functions are drafted; Detect, Respond, Recover and Govern follow.",
    tag: "coverage",
  },
  {
    date: "2026-07-31",
    title: "Evidence collectors: AWS IAM and GitHub",
    body: "First two automated collectors. MFA enforcement, access-key age and branch-protection state are pulled on a schedule and attached to the relevant controls.",
    tag: "product",
  },
  {
    date: "2026-07-17",
    title: "Tenant isolation model finalised",
    body: "Row-level isolation with a per-tenant encryption key, enforced at the data layer rather than in application code. Design note published on the Trust page.",
    tag: "platform",
  },
  {
    date: "2026-07-03",
    title: "Risk register and control register",
    body: "The two core registers are usable end to end: create, assign owners, link controls to risks, and export to CSV.",
    tag: "product",
  },
];
