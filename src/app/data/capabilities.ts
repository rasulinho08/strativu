/**
 * Ana səhifədəki 3 capability bloku. Hər biri real UI mock ilə gəlir (ProductMock.tsx).
 */
export type Capability = {
  id: "mapping" | "evidence" | "audit";
  eyebrow: string;
  title: string;
  body: string;
  link: { label: string; href: string };
};

export const capabilities: Capability[] = [
  {
    id: "mapping",
    eyebrow: "Controls",
    title: "One control set. Every framework.",
    body: "Write a control once and map it to ISO 27001, SOC 2 and NIST requirements at the same time. Overlap is computed, not maintained by hand in a spreadsheet.",
    link: { label: "How mapping works", href: "/platform/grc#mapping" },
  },
  {
    id: "evidence",
    eyebrow: "Evidence",
    title: "Evidence that collects itself.",
    body: "Collectors pull configuration state from cloud, identity and source-control systems on a schedule. Each artefact is timestamped, hashed and attached to the control it proves.",
    link: { label: "See the collectors", href: "/platform/grc#evidence" },
  },
  {
    id: "audit",
    eyebrow: "Audit trail",
    title: "The audit trail is the product.",
    body: "Every change to a control, risk or evidence record is appended to a hash-chained log with actor, tenant and diff. Auditors can follow the chain without asking you to export it.",
    link: { label: "Read the architecture", href: "/platform/architecture" },
  },
];
