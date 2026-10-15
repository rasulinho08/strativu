# Obligations in GRC tools: research notes for the GRC360 Obligations page redesign

Compiled 2026-10-15. These are quick web research notes. Most vendor claims come from marketing pages or docs. ServiceNow docs and CISO Assistant's data model are the most concrete sources. Archer field-level docs are behind a login (community.archerirm.com returned 403).

---

## 1. Data model: what an obligation record contains

### ServiceNow IRM (Policy & Compliance + Regulatory Change Management)
- The chain is **Authority Document → Citation → Control Objective → Control (per Entity)**.
  - Authority Document (`sn_compliance_authority_document`): an external law, regulation or standard such as GDPR or ISO 27001.
  - Citation (`sn_compliance_citation`): a specific section or requirement inside that document.
  - Control Objective (`sn_compliance_policy_statement`): the hub. It maps many-to-many to Citations and to Policies, and it is assigned to Entity Types to generate Controls. Lifecycle: Draft → Review → Approved → Published → Retired.
  - Control: one objective applied to one Entity (a department, system or process). Controls are tested by attestation and by Indicators. A failed result creates an Issue.
  - Source: https://www.servicenow.com/community/grc-articles/policy-and-compliance-management-architecture-and-data-model/ta-p/3605503
- Layering:
  - The **Compliance Library** (content) is kept separate from the **Compliance Register** (the org's controls on entities). A new regulation only touches the library, and a new department only touches the register (same source).
- Control Objective fields: Name, Source (the content provider), Source ID (the authority catalogue number), Reference, Policy (parent), Category, Active.
  - One objective can map to citations from many authority documents, so one test can cover several regimes.
  - Source: https://www.servicenow.com/docs/r/DDKNGuzcS_gt6P_P4KM3Dg/b55275DYuz8hsCRKuzVPUg
- Pre-built content: UCF (Network Frontiers) imports Authority Documents and Citations. Content packs cover NIST, ISO and others.

### Archer (Corporate Obligations Management / Regulatory & Corporate Compliance)
- Archer positions this as the place to document external regulatory obligations, with a formal review and approval process when they change. It tracks those changes, shows the business impact and helps prioritise a response.
- It aims to be a "system of record for regulatory intelligence" with "clear linkages between changes in regulations and internal controls".
  - Sources: https://www.archerirm.com/content/regulatory-compliance , https://www.archerirm.com/reg-corp-compliance-management
- Not verified (from general knowledge, docs are gated): Archer's content model is Authoritative Sources → Control Standards → Control Procedures. Corporate Obligations sits beside it as a separate register, with obligation, type, business unit, owner and links to authoritative sources and controls.

### Protecht ERM
- The obligations register tracks each obligation by **rating, status, owner, jurisdiction, review date and evidence**.
- It links to policies, controls, risks, incidents and assurance activity to show coverage and gaps.
- Regulatory content comes from LexisNexis, LawCompliance and Corlytics.
- Attestations are scheduled, with reminders in Teams, Slack and Outlook. Exceptions become actions.
  - Source: https://www.protechtgroup.com/solutions/compliance-management
- Older Protecht guidance:
  - Extend the register so one obligation can store multiple acts and sections.
  - Add a field that links to relevant policies and procedures.
  - Source: https://www.protechtgroup.com/blog/compliance-definition-risk-management-key-concepts

### MetricStream (Regulatory Change Management / Compliance)
- Ingests updates from more than 750 authorities.
- Filters them to what applies to the business and its risk profile, then sorts by jurisdiction and by existing, updated or upcoming status.
- Alerts are routed to a central triage team, then mapped to processes, risks, controls and business units.
  - Source: https://www.metricstream.com/products/regulatory-change-management.htm
- AI features:
  - Alert applicability is classified as **applicable / not applicable / uncertain**.
  - Obligations are extracted from regulatory text, and the tool proposes mappings to existing policies, risks and controls, with a rationale for each.
  - Source: https://www.metricstream.com/blog/ai-powered-obligation-extraction-regulatory-review.html

### LogicGate Risk Cloud
- LexisNexis integration pulls obligation alerts into Risk Cloud. This is a paid add-on.
- Overlapping regulations, obligations and controls are linked to find gaps and cut duplicate work.
  - Source: https://logicgate.com/platform/integrations/lexisnexis

### OneTrust
- DataGuidance Regulatory Research plus Compliance Automation turn legal updates into mapped obligations across more than 60 laws and frameworks. Those obligations connect to privacy workflows that collect evidence.
- A patent application (US20230306134A1) describes:
  - Diffing versions of a regulatory dataset to detect changed controls.
  - Using ML to determine the jurisdiction or domain that applies.
  - Identifying the affected systems.
- Evidence is thin. The webinar page was reached through a proxy URL and no product docs were found.
  - Source: https://www.onetrust.com/resources/operationalizing-regulatory-change-webinar/

### Ascent (AscentAI)
- Builds an organisation-specific obligations register from a firm-profile questionnaire. Each obligation is "the individual requirement your firm must comply with".
- Each obligation shows a **breadcrumb trail to the source section, the rule number and the effective date**.
- When a rule changes, Ascent shows the impact on the register as **new, deleted or changed obligations**.
- Obligations map to policies and controls through GRC integrations.
- Vendor claim: generating MiFID II obligations took 2.5 minutes, against about 1,800 manual hours.
  - Sources: https://www.ascentregtech.com/?p=1161 , https://www.ascentregtech.com/?p=311618

### CUBE
- Automated regulatory intelligence (RegPlatform) for Tier 1 financial institutions. No field-level detail was found.
  - Source: https://www.cbinsights.com/company/corlytics/alternatives-competitors

### CISO Assistant (open source, intuitem)
- It has **no dedicated Law or Obligation object**. Laws and standards are modelled as Frameworks.
  - Framework fields: urn, ref_id, name, provider, implementation_groups_definition, scores.
  - Requirement Node fields: urn, ref_id, parent_urn, name, description, annotation, assessable, implementation_groups, weight, importance (mandatory / recommended / nice to have), questions.
- Requirement Assessment:
  - status: todo / in progress / in review / done.
  - result: compliant / partially compliant / non-compliant / not applicable.
  - Also holds observation, due_date, score and evidence. Applied controls implement it.
- Applied Control fields: status (planned / active / inactive), eta, expiration, effort, cost, progress, evidence.
- Framework mappings (`REQUIREMENT_MAPPING_SET`):
  - Each rule records a relationship (subset / intersects / equal / superset / not related) and a strength from 0 to 10, following NIST OLIR.
  - Mappings can auto-draft a compliance assessment for another framework.
- Contracts exist only in TPRM (name, start_date, end_date, evidence).
- Takeaway: there is no obligations register here, which is the gap a GRC360 Obligations page would fill.
  - Source: https://raw.githubusercontent.com/intuitem/ciso-assistant-community/main/documentation/architecture/data-model.md

### Consolidated recommended field set (synthesis)
| Group | Fields |
|---|---|
| Identity | ID, title, obligation text (verbatim), plain-language summary, obligation type (statutory / regulatory / licence condition / contractual / regulator direction or letter / court order / voluntary code / internal commitment) |
| Source | Source instrument (law, regulation, contract, licence), citation (article, section or clause), link to source text, source version, regulator or counterparty, jurisdiction |
| Dates | Effective date, commencement or transition date, expiry (contracts and licences), next review date, last reviewed |
| Applicability | Applicable (Y / N / under assessment), rationale, in-scope entities, business units, products, processes, locations |
| Accountability | Owner (accountable), compliance contact, assignees |
| Risk | Inherent rating (consequence and likelihood of breach), penalty or consequence notes |
| Coverage | Linked controls, policies, procedures, risks, assets, vendors and contracts. Coverage status: covered / partial / gap |
| Assurance | Monitoring method, attestation frequency, last attestation result, evidence, open issues and breaches |
| Lifecycle | Status (draft / active / under change / retired), change history, originating regulatory-change item |

- Field-set sources:
  - SmartSuite list: source with citation and jurisdiction; plain-language obligation, one testable item per entry; applicability; owner; risk rating; controls, policies and evidence; monitoring method, frequency and last result; status and change history. https://www.smartsuite.com/what-is/what-is-an-obligation-register
  - Protecht (above).
  - CAMMS register statuses: Pending Review, Due for Review, Non-compliant, Partially Compliant, Fully Compliant, Not Applicable. https://camms.atlassian.net/wiki/spaces/CD/pages/77496321

---

## 2. Lifecycle and workflow

### Typical flow
1. **Identify.** Pick up obligations from a content library or regulatory feed (UCF, LexisNexis, Corlytics, DataGuidance, Thomson Reuters), or enter them by hand for contracts, licences and regulator letters.
2. **Assess applicability.** Use a questionnaire or firm profile (Ascent), or triage each item as applicable / not applicable / uncertain (MetricStream). Record the rationale.
3. **Assign owner.** Ownership comes before control mapping, because "ownership keeps the register alive" (SmartSuite). Treat unowned or unmapped obligations as findings.
4. **Map** to controls, policies, risks and business units. The relationship is many-to-many: one control can satisfy several regimes (ServiceNow, LogicGate).
5. **Attest or test.** Run scheduled attestations, control tests or indicators. Exceptions and breaches become issues or actions (Protecht, ServiceNow).
6. **Monitor regulatory change.** An alert comes in, someone triages it, assesses impact, raises tasks and updates the register as new, changed or deleted obligations.
7. **Report.** Show coverage, gaps, attestation status, breaches and changes in flight, with role-based dashboards for executives, the board and regulators.

### ServiceNow Regulatory Change Management (concrete reference workflow)
- There are two alert types:
  - **Regulatory event** (news or general change) produces a *regulatory change task* to update policies, controls and risk statements.
  - **Source document** (a change to a specific citation) produces a *source document import task* that updates or inserts the citation in the library.
- Actions: Applicable (generates a task), Not Applicable (closes the alert, comment required), Defer, Initiate Impact Assessment, Cancel.
- States: New → Deferred / Impact Assessment → In Progress → Closed. A Coordinator is the assignee.
- **Impact radius** (since the Yokohama release): add impacted areas and the tool works out how far the change reaches across GRC objects, then auto-creates action tasks.
- Predictive Intelligence suggests citations for an alert.
- Sources:
  - https://www.servicenow.com/docs/r/Z61H6JNUJXKe8NNPQzK7MQ/0JxCTcDrgw7xX7P8jo~o3w
  - https://www.servicenow.com/docs/r/Z61H6JNUJXKe8NNPQzK7MQ/~YEmC8Aa2Yc1aUMOqAxq~A

### ISO 37301:2021 (compliance management systems)
- Clause **4.5 "Compliance obligations"** sits between 4.4 (CMS) and 4.6 (compliance risk assessment).
  - The clause asks the organisation to identify its obligations systematically and assess their impact on operations.
  - It also asks for processes that identify **new and changed** obligations, evaluate the impact of those changes and implement what is needed.
  - Documented information about obligations must be maintained.
  - The standard does not prescribe a format. A register is the practical answer.
  - Paraphrased from the standard's structure. Verify against a licensed copy.
- Obligations come in two kinds: **compliance requirements** (mandatory: laws, regulations, licences, permits, court orders) and **compliance commitments** (voluntary: codes, contracts and stakeholder agreements, internal policies). https://thamerjames.co.uk/2025/04/29/iso-37301-understanding-and-managing-compliance-obligations/
  - That page says "6.1.3". That numbering belongs to ISO 14001, not 37301.
- Obligations feed compliance risk assessment (4.6). Later clauses cover monitoring and evaluation of compliance (9.1).

### ISO/IEC 27001:2022
- **Clause 4.2(c)**: decide which interested-party requirements the ISMS will address, including legal, regulatory and contractual ones. https://advisera.com/iso27001/clause-4-2-understanding-the-needs-and-expectations-of-interested-parties/
- **Annex A 5.31** ("Legal, statutory, regulatory and contractual requirements") is where the legal / regulatory / contractual register usually lives.
  - Cross-reference it from the interested-parties register rather than keeping it twice. https://www.tcsa.in/frameworks/iso-27001/clauses/4-2-understanding-the-needs-and-expectations-of-interested-parties
  - Advisera's steps: list the requirements in the register and give each one an owner.
- Clause 6.1.3 (risk treatment / SoA):
  - Controls in the SoA are justified partly by legal and contractual requirements.
  - In practice: obligations → risks/controls → SoA justification column.

---

## 3. How obligations differ from framework requirements

- **Framework requirements** (ISO 27001 Annex A, SOC 2, NIST CSF) are *voluntary or certification* control sets. The org assesses itself against them, so they are read-only library content. CISO Assistant locks imported frameworks this way.
- **Obligations** are *binding duties* placed on this particular organisation by law, regulation, licence or permit conditions, contracts and SLAs, regulator letters, directions, undertakings, or court orders. They also include voluntary commitments it has signed up to (ISO 37301).
  - Obligations are org-specific: they carry applicability, owner, effective dates and expiry, a counterparty or regulator, and penalties.
  - They can be one-off or event-driven (notify the regulator within 72 hours, file an annual return by a date), not only continuous controls.
- SmartSuite framing: the obligations **register is the demand side** (what must be met and why), and the **control library is the supply side** (what is done). The two link many-to-many.
- ServiceNow treats both as Authority Documents and Citations, so a framework and a law use the same object. Regulatory Change Management then applies only to the regulatory sources.
- Design implication for GRC360:
  - Keep frameworks (compliance packages) and obligations as separate objects, linked through shared controls.
  - An obligation can optionally cite a framework requirement. For example, A.5.31 is "evidenced by" the obligations register itself.

---

## 4. UI patterns seen

- **Register list (table)**
  - Filters: source/regime, jurisdiction, regulator, BU, owner, status, applicability, coverage, risk rating, next review due.
  - Group by regime or topic for reporting, while keeping granular rows for mapping (SmartSuite).
- **Library vs org register**
  - The library is vendor or content-pack text: read-only and versioned (ServiceNow Compliance Library, CISO Assistant libraries, Ascent register).
  - The org register holds adopted obligations plus custom entries such as contracts, licences and regulator letters. ServiceNow separates Library and Register explicitly.
- **Applicability questionnaire or firm profile**
  - Answers about the business scope which rules apply (Ascent, and CISO Assistant implementation groups).
  - Triage buttons: Applicable / Not applicable (rationale required) / Defer / Uncertain (ServiceNow, MetricStream).
- **Detail page**
  - Verbatim text next to a plain-language summary, with a breadcrumb to the source section, rule number and effective date (Ascent).
  - Related lists: controls, policies, risks, evidence, attestations, issues, change history.
- **Coverage and heat map**
  - Obligations by regime × coverage (covered / partial / gap), or by BU × status, plus a risk-rating heat map.
  - Protecht calls out "coverage and gaps" and real-time role-based dashboards.
- **Regulatory change feed or inbox**
  - Incoming alerts with state chips (New / Impact assessment / In progress / Closed) and an assignee.
  - "Impact radius" view of the affected objects.
  - Diff badges on obligations: new, changed or deleted (Ascent, ServiceNow).
- **Attestation campaigns**
  - Scheduled owner sign-offs with reminders; overdue and exception counts sit on the register (Protecht).
- **AI assists**
  - Extract obligations from pasted text or PDFs (regulator letters, contracts), and suggest control and policy mappings with a rationale (MetricStream).

---

## Gaps / caveats
- No Archer, OneTrust or CUBE field-level docs were reachable. Archer's model above is from memory and unverified.
- The ISO 37301 and 27001 wording is paraphrased from secondary sources. Check the licensed standards before quoting clause text.
