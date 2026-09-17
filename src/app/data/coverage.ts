/**
 * Framework coverage. Status dəyişmək bir sətirdir:
 *   "supported" → indi dəstəklənir, "in-progress" → xəritələnir, "planned" → planlaşdırılıb
 */
export type FrameworkStatus = "supported" | "in-progress" | "planned";

export type Framework = {
  slug: string;
  id: string;
  name: string;
  body: string;
  status: FrameworkStatus;
  controls: string;
  summary: string;
  detail: string[];
};

export const frameworks: Framework[] = [
  {
    slug: "iso-27001",
    id: "ISO/IEC 27001:2022",
    name: "Information security management",
    body: "ISO",
    status: "supported",
    controls: "93 Annex A controls · 4 themes",
    summary: "The 2022 revision restructured Annex A into four themes: organisational, people, physical and technological. Strativu maps each control to shared evidence so an ISMS can be maintained continuously rather than rebuilt before each surveillance audit.",
    detail: [
      "All 93 Annex A controls modelled with attributes (control type, security property, cybersecurity concept, operational capability, security domain).",
      "Statement of Applicability generated from the control register, with justification text carried per control.",
      "Clause 4–10 management-system requirements tracked as evidence-bearing tasks with owners and review cycles.",
      "Overlap with SOC 2 CC-series and NIST CSF shown at requirement level.",
    ],
  },
  {
    slug: "soc-2",
    id: "SOC 2 (AICPA TSC 2017)",
    name: "Trust Services Criteria",
    body: "AICPA",
    status: "supported",
    controls: "5 trust categories · CC1–CC9",
    summary: "SOC 2 is evidence-heavy: auditors ask for populations, samples and screenshots across an observation window. Strativu keeps evidence attached to the criteria continuously, so the observation window is the product's normal operation.",
    detail: [
      "Security (common criteria CC1–CC9) plus Availability, Processing Integrity, Confidentiality and Privacy.",
      "Points of focus tracked per criterion; each links to one or more controls in the shared register.",
      "Automated collectors produce timestamped evidence for the audit window, with sampling exports for the auditor.",
      "Type I and Type II readiness views.",
    ],
  },
  {
    slug: "nist-csf",
    id: "NIST CSF 2.0",
    name: "Cybersecurity Framework",
    body: "NIST",
    status: "in-progress",
    controls: "6 functions · 106 subcategories",
    summary: "CSF 2.0 added the Govern function and is increasingly the language boards use to talk about cyber risk. Mapping is under way from the shared control set.",
    detail: [
      "Govern, Identify, Protect, Detect, Respond and Recover functions.",
      "Identify and Protect drafted; remaining functions in progress.",
      "Current-profile and target-profile comparison planned.",
    ],
  },
  {
    slug: "gdpr",
    id: "GDPR (EU 2016/679)",
    name: "General Data Protection Regulation",
    body: "EU",
    status: "in-progress",
    controls: "Art. 5–49 · 99 articles",
    summary: "GDPR obligations are organisational as much as technical. The register models processing activities (Art. 30), lawful bases, DPIAs and subprocessor relationships alongside security controls.",
    detail: [
      "Records of processing activities with lawful basis and retention per activity.",
      "Data-subject request workflow with statutory timers.",
      "Subprocessor register linked to the Trust page.",
    ],
  },
  {
    slug: "az-personal-data",
    id: "Azerbaijan Law No. 998-IIIQ",
    name: "Law on Personal Data",
    body: "AZ",
    status: "in-progress",
    controls: "Registration · consent · cross-border transfer",
    summary: "Domestic obligations for organisations processing personal data in Azerbaijan, including information-system registration and cross-border transfer rules. Mapped against GDPR controls where they overlap.",
    detail: [
      "Information-system registration requirements tracked as evidence-bearing tasks.",
      "Consent and notification obligations mapped to GDPR equivalents.",
      "Cross-border transfer conditions modelled as a control.",
    ],
  },
  {
    slug: "iso-42001",
    id: "ISO/IEC 42001:2023",
    name: "AI management system",
    body: "ISO",
    status: "planned",
    controls: "38 Annex A controls",
    summary: "The first certifiable standard for AI management systems. Structured like 27001, so most of the management-system machinery carries over.",
    detail: ["Annex A controls for AI policy, impact assessment, data governance and lifecycle.", "Shared clause 4–10 machinery with ISO 27001."],
  },
  {
    slug: "pci-dss",
    id: "PCI DSS v4.0.1",
    name: "Payment card data security",
    body: "PCI SSC",
    status: "planned",
    controls: "12 requirements · ~250 sub-requirements",
    summary: "Prescriptive and technical. Best served by automated evidence from network, logging and access-control systems.",
    detail: ["12 principal requirements with testing procedures.", "Customised-approach documentation support."],
  },
  {
    slug: "hipaa",
    id: "HIPAA Security Rule",
    name: "45 CFR Part 164 Subpart C",
    body: "US HHS",
    status: "planned",
    controls: "Administrative · physical · technical safeguards",
    summary: "Required and addressable implementation specifications for electronic protected health information.",
    detail: ["Safeguard categories modelled as control groups.", "Addressable specifications carry documented risk-based decisions."],
  },
  {
    slug: "iso-22301",
    id: "ISO 22301:2019",
    name: "Business continuity management",
    body: "ISO",
    status: "planned",
    controls: "Clauses 4–10 · BIA · BCP",
    summary: "Business impact analysis, continuity plans and exercise records as evidence-bearing objects.",
    detail: ["BIA and risk assessment linked to the risk register.", "Exercise and test records as scheduled evidence."],
  },
  {
    slug: "nist-800-53",
    id: "NIST SP 800-53 Rev. 5",
    name: "Security and privacy controls",
    body: "NIST",
    status: "planned",
    controls: "20 families · 1,000+ controls",
    summary: "The catalogue most other US frameworks derive from. Mapping it makes FedRAMP and CMMC reachable later.",
    detail: ["Control families with enhancements.", "Baseline selection (low / moderate / high)."],
  },
  {
    slug: "dora",
    id: "DORA (EU 2022/2554)",
    name: "Digital Operational Resilience Act",
    body: "EU",
    status: "planned",
    controls: "ICT risk · incidents · third-party risk",
    summary: "Applies to EU financial entities from January 2025. Heavy on third-party risk, which maps onto the vendor register.",
    detail: ["ICT third-party register of information.", "Major incident reporting timers."],
  },
  {
    slug: "nis2",
    id: "NIS2 (EU 2022/2555)",
    name: "Network and Information Security Directive",
    body: "EU",
    status: "planned",
    controls: "Art. 21 measures · reporting",
    summary: "Baseline cybersecurity measures and incident reporting for essential and important entities across the EU.",
    detail: ["Article 21 measures mapped to the shared control set.", "24h / 72h / 1-month reporting workflow."],
  },
];

export const statusLabel: Record<FrameworkStatus, string> = {
  supported: "Supported",
  "in-progress": "Mapping",
  planned: "Planned",
};
