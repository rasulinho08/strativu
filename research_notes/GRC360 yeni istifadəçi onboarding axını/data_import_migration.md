# Data Import and Migration in GRC Onboarding (GRC tools + modern B2B SaaS import patterns)

Research date: 2026-10-14. Sources are mostly vendor help centers (primary) and vendor or consultancy blogs (secondary, often with a commercial interest, flagged where relevant).

## 1. How GRC tools handle spreadsheet imports (templates, CSV/XLSX, mapping, validation, upsert, linking, attachments, rollback)

### Takeaway
Every GRC tool reviewed supports CSV or XLSX bulk import for its main registers. The products split into two generations. **Older template-strict importers** (Eramba, Hyperproof, SimpleRisk, LogicGate, ServiceNow import sets) need exact, case-sensitive headers or IDs and reject or skip bad rows. **Newer in-app wizards** (Drata "New Experience", Vanta, Secureframe flexible upload) offer column mapping, value mapping, inline cell-level validation and upsert by a business key (Control Code or Risk ID). Records are linked by putting existing IDs in a cell, usually comma- or pipe-separated. Policies come in as separate DOCX/PDF uploads or through document-system syncs. No vendor documents a true rollback or undo of an import.

### Cited Findings

**Vanta**
- Risks are imported from the risk register (Add → Import), using a CSV template downloaded from the import page. "The only required column is Risk Scenario." Columns are mapped to Vanta fields, and rows flagged with issues are reviewed before import. Registers and custom fields must be set up first, because the import maps only to fields that already exist — [Vanta Help: Adding and managing risks](https://help.vanta.com/en/articles/12005142-adding-and-managing-risks)
- Bulk update works as a round trip: export risks, edit them in a spreadsheet, and re-upload. Existing risks are matched on Risk ID, and the file must match Vanta's import template — [Vanta Help: Adding and managing risks](https://help.vanta.com/en/articles/12005142-adding-and-managing-risks)
- Vanta's onboarding guide for customers with an existing program lists seven steps, each with an effort estimate:
  - Custom controls via an Excel template: 5–7 h. Fields are Control ID, Description, optional Summary and Domain (from a fixed list), and framework criteria as a comma-separated list "no spaces in between".
  - Custom framework via an Excel template: 3–5 h. Fields are Section ID/Name/Description, Parent Section ID, Control IDs, and Section Type (P/C).
  - Mapping Vanta tests to controls with AI suggestions: 10–20 h.
  - Policies: .docx/.pdf up to 50 MB (".docx files may lose formatting"), or sync from Confluence, SharePoint or Google Drive.
  - Risk import template: residual scores, treatment, owner email, CIA type, related control IDs. Risk IDs are auto-generated if left blank.
  - The import flow is upload → "Review & finalize" (formatting errors) → Import.
  — [Vanta Help: Bringing your current compliance program into Vanta](https://help.vanta.com/en/articles/11345361-bringing-your-current-compliance-program-into-vanta)

**Drata**
- **Control import ("Create/Update in bulk").** The file is a CSV upload. The flow is field mapping with preview, then optional *value mapping* for enumerated fields, then row validation:
  - Invalid cells turn red and warnings turn yellow. Hovering over a column header shows its rules.
  - Submit stays disabled until required errors are fixed.
  - **Upsert key:** a row creates a new control unless its Control Code matches an existing one. Matching is exact and case-sensitive, and matched rows show a yellow "will be updated" message.
  - Control Code rules: 1–20 characters, no spaces, unique, never auto-generated. Name must be unique (≤191 characters). Description is required (≤30,000 characters).
  - Framework requirement IDs are comma-separated and must already exist. Owner and approver emails must already exist in Drata.
  - No undo is described. Some fields are one-way: approvals "can be added/updated but NOT deleted", and internal notes "can only be added".
  — [Drata Help: Import or update controls in bulk (new experience)](https://help.drata.com/en/articles/13381439-import-or-update-controls-in-bulk-new-experience)
- When updating risks in bulk, blank or omitted fields don't overwrite existing values, so a blank cell cannot clear a value — [Drata Help (same article, risk note)](https://help.drata.com/en/articles/13381439-import-or-update-controls-in-bulk-new-experience)
- Drata announced bulk CSV import with flexible column mapping for Risks, Personnel Trainings and Background Checks. Custom Assets and Custom Tasks have their own bulk imports, and bulk evidence import is in limited availability — [Drata update: Bulk CSV import for controls, risks…](https://drata.com/updates/bulk-csv-import-for-controls-risks-personnel-trainings-and-background-checks); [Drata: Bulk CSV import for custom assets](https://drata.com/updates/bulk-csv-import-for-custom-assets-2); [Drata Help: Bulk import evidence](https://help.drata.com/en/articles/16989042-bulk-import-evidence)
- Custom-framework CSV rules:
  - Headers must match the template exactly, and Code and Name are required.
  - Duplicate codes (within the file or against existing requirements) cause the row to be skipped.
  - The characters `<`, `>` and `\` are forbidden.
  - The Control Mapping column takes comma-separated control codes. Every control listed must exist, be enabled and be in scope, or the whole row is skipped.
  — [Drata Help: Custom framework](https://help.drata.com/en/articles/6346623-custom-framework)

**Secureframe**
- The "flexible CSV upload" for the risk register works like this:
  - Upload the register "in its current state" with no template reformatting.
  - Select the header row, map columns to template fields, and fix values flagged "invalid".
  - Review, then import.
  - All imported risks default to **Draft** status, whatever their previous assessment state, so assessed risks must be moved to "Assessment Complete" by hand.
  - If every row is skipped, a warning appears rather than a hard error.
  — [Secureframe Support: Risk register flexible CSV uploads](https://support.secureframe.com/en/articles/15111225-risk-register-flexible-csv-uploads)
- Devices and personnel also have CSV import with a validation-errors review step. Secureframe recommends integrations (HRIS/IdP) over CSV for personnel — [Secureframe: Import devices via CSV](https://support.secureframe.com/en/articles/15111077-import-devices-via-csv); [Secureframe: Import personnel via CSV](https://support.secureframe.com/en/articles/15111155-import-personnel-via-csv)
- Secureframe's importer is built on OneSchema, first for Custom Frameworks and later for Risks and TPRM assessments.
  - Before OneSchema, imports "often failed at the database level", errors were vague ("import error on line 62"), and support tickets were escalated to engineering.
  - After: "a few CSV Import related tickets in over 1 year", against hundreds of emails before.
  - This is a vendor case study — [OneSchema case study: Secureframe](https://oneschema.co/case-studies/accelerate-upmarket-product-roadmap)

**Hyperproof**
- Controls are imported from Hyperproof's example CSV template, with these rules:
  - The CSV must contain ALL headings, including optional ones, and headings are case-sensitive.
  - Control IDs must be unique across the organization, and a non-unique row is skipped.
  - Upsert: Hyperproof searches for exact identifiers, creating a record when none matches and updating it when one does.
  - Existing controls are linked by putting the Hyperproof ID in the control ID field, and new and existing controls can be mixed in one file.
  - Errors are shown in an "Error viewer".
  - Only one scope per control is supported via CSV, and CSV can only edit existing scope assignments.
  — [Hyperproof Docs: Importing your own controls](https://docs.hyperproof.io/cm/en/getting-started/importing-your-own-controls-10474/importing-your-own-controls-16232); [Hyperproof: Reusing existing controls](https://docs.hyperproof.io/cm/en/getting-started/importing-your-own-controls-10474/reusing-existing-controls); [Hyperproof: Importing scope assignments](https://docs.hyperproof.io/admin/en/get-to-know-hyperproof/working-with-teams/importing-scope-assignments)
- Risks and vendors have separate import articles. These docs.hyperproof.io URLs now redirect to help.hyperproof.app, and I couldn't read the full risk-import content — [Hyperproof: Importing risks](https://docs.hyperproof.io/cm/en/risk-register-overview/importing-risks); [Hyperproof: Importing vendors](https://docs.hyperproof.io/cm/en/vendor-register-overview/importing-vendors)
- A Nov 2024 release note fixed a control CSV import where the window "didn't indicate where the error occurred", showing that error localization had been a pain point — [Hyperproof release notes 2024-11-14](https://intercom.help/hyperproofio/en/articles/14303721-release-notes-2024-nov-14)

**LogicGate Risk Cloud**
- The record importer is under Work > Import Records and accepts CSV or XLSX.
  - The user picks a workflow and step, generates an import template (.xlsx) for the step's layout, fills it in and uploads it.
  - Validation errors come back as a **marked-up file** to fix and re-upload. After validation passes, "Create Records" runs the import.
  - The user needs the Import entitlement and edit access to the step.
  — [LogicGate Help: Import Data into Risk Cloud](https://help.logicgate.com/hc/en-us/articles/4402674054292-Import-Data-into-Risk-Cloud)
- The same capability is exposed as a Bulk Import API that takes multipart/form-data with the file under the key `file`. Headers match the layout's field names — [LogicGate Developer: Bulk import records](https://www.logicgate.com/developer/risk-cloud-api-bulk-import-records)

**AuditBoard**
- "AuditBoard Import Tools" is an Excel add-in. Users build data in Excel and import it into AuditBoard, and it "can create links to existing AuditBoard records or to new records on other worksheets", so one workbook can carry related objects. Access needs Customer Support enablement — [Microsoft AppSource: AuditBoard Import Tools](https://appsource.microsoft.com/en-us/product/web-apps/WA200006771)
- For comparison, Diligent HighBond's Bulk Importer uses download template → fill → upload, restricted to System Admins — [HighBond: Bulk importing controls](https://help.highbond.com/helpdocs/highbond/en-us/Content/administration/bulk_importer/bulk_uploading_controls.htm)

**ServiceNow GRC/IRM**
- Imports use the generic Import Sets framework:
  - Accepted formats are CSV, XLS/XLSX, XML and JSON. Data lands in a staging table.
  - A **transform map** of field maps defines how staging fields map to target table fields, and maps can be reused.
  - **Coalesce** fields give update-instead-of-insert, which is upsert by key.
  - The docs warn against "extremely large" import sets, which can cause outages.
  - The Import Set Deleter purges staging data older than 7 days by default.
  — [ServiceNow Docs: Import sets key concepts](https://www.servicenow.com/docs/r/yokohama/integrate-applications/system-import-sets/c_ImportSetsKeyConcepts.html); [ServiceNow Docs: Transform maps](https://www.servicenow.com/docs/r/yokohama/integrate-applications/system-import-sets/c_CreatingNewTransformMaps.html)
- Community posts show GRC teams scripting their own transform maps, for example for TPRM questionnaire templates into `asmt_metric`, and working around timeouts on large imports — [ServiceNow Community: TPRM questionnaire template import timeouts](https://www.servicenow.com/community/grc-blog/solving-tprm-questionnaire-template-import-timeouts-in/ba-p/3574911)

**Archer**
- Data Feed Manager creates and updates records through data feeds. Content imports used to require changing key fields and running an import for each file in every package. Archer's "Authoritative Source Data Feed" utility lets admins drop content files into designated feeds instead — [Archer Community: Simplify Archer content data imports](https://community.archerirm.com/hc/en-us/articles/50697476415251); [Archer Community: Data Feed Manager](https://community.archerirm.com/hc/en-us/articles/52147209194131-Archer-Data-Feed-Manager)

**Eramba (open source)**
- Most modules have Actions → Import:
  - Download a CSV template whose **first row explains the expected input for each column**.
  - Mandatory fields must be completed. Dates use YYYY-MM-DD, multi-value cells are pipe-separated (`|`), and some relationship fields need the related item's **numeric ID** rather than its name.
  - After upload, eramba checks the file and lists issues to fix before import.
  - **No duplicate check:** "If you import the same CSV file twice you will duplicate data". Imports only create records, except in Compliance Analysis, which can update.
  — [eramba Learning: Introduction to CSV Imports](https://eramba.org/learning/courses/37)
- Risk import was long missing. Eramba's reasoning was that risks have many relationships and "you would spend a lot of time finding the 'Id' of every object". The thread is undated — [eramba discussions: Risk imports](https://discussions.eramba.org/t/feature-risk-imports-ongoing/281)
- Asset import requires the owner field, while guardian is optional — [eramba discussions: import assets mandatory fields](https://discussions.eramba.org/t/bug-import-assets-mandatory-fields/1054)

**SimpleRisk (open source core plus a paid "Extra")**
- Bulk import is not in the core product and needs the Import/Export Extra.
  - Import covers Risks, Assets, Asset Groups, Controls, Users, Template Groups and Control Tests. Export adds Mitigations, Reviews and Combined.
  - CSV only. The system reads the first line, and each column gets a dropdown to map it to a SimpleRisk field. Unmapped fields get defaults, and only subject is mandatory.
  - An "Import First Row" checkbox controls whether the first row is treated as a header.
  - After import, a summary lists the risk IDs created.
  - Update of existing records is not documented.
  — [SimpleRisk: Import-Export Extra guide](https://support.simplerisk.com/kb/import-export-extra-installation-and-administration-guide)

**CISO Assistant (open source)**
- The feature list includes a "Data import wizard", "rich import/export capabilities" (UI, CLI, Kafka), a REST API with PAT auth, and single-domain export/import for consultants — [CISO Assistant README](https://github.com/intuitem/ciso-assistant-community/blob/main/README.md)

**Other GRC/TPRM comparators**
- Scrut extended its vendor import template with 8 more fields (service description, assessment status, reassessment dates) — [Scrut release note](https://scrut.launchnotes.io/announcements/ann_70qxegulIEX8f)
- 6clicks and KnowBe4 (KCM) also document risk-register imports — [6clicks KB](https://knowledgebase.6clicks.com/importing-risk-assessments-into-the-risk-register); [KnowBe4: Import risks](https://support.knowbe4.com/hc/en-us/articles/4404508669331-How-to-Import-Risks-to-Your-Risk-Register)

### Inferences
- **Upsert key.** The common GRC answer is a human-readable business key the customer controls: Drata's Control Code, Vanta's Risk ID, Hyperproof's Control ID, ServiceNow's coalesce field. Tools without one (Eramba) duplicate data on re-import, which is the classic onboarding failure mode. A GRC360 importer should therefore have an explicit "match on" key per entity and show a create/update preview.
- **Linking related records.** Linking risk→control, control→requirement or risk→asset is almost always done by putting existing reference codes in a delimited cell. This forces an **import order**: users/org → frameworks/requirements → controls → assets/vendors → risks → findings. Asking for internal numeric IDs (Eramba) is user-hostile, so human-readable codes are better.
- **Required fields.** Minimal required fields (Vanta: only Risk Scenario; SimpleRisk: only subject) plus a default status (Secureframe: Draft) lower the barrier. Imported data then enters a "needs review" state instead of being trusted outright.
- **Policies.** Policies are not imported as rows. They are uploaded as DOCX/PDF documents, or synced from SharePoint, Confluence or Google Drive, and then mapped to controls.
- **Undo.** None of the reviewed GRC vendors documents an undo or rollback of an import. Undo only appears as a UX best practice (section 4).

### Gaps
- OneTrust import documentation (vendors, assets, risks) wasn't found in public search results. OneTrust's docs appear to be behind a customer login.
- AuditBoard's RCM import template columns and validation rules, and Archer's key-field matching specifics, aren't public.
- No vendor documents row or file-size limits for its importer (Drata, Vanta, Secureframe and LogicGate are all silent on this).
- ServiceNow IRM-specific table schemas for risk and control imports weren't found in current docs.
- Bulk attachment import (many evidence files at once) only appears in Drata's limited-availability bulk evidence import. Its details weren't read.

## 2. Migration from other GRC tools or legacy spreadsheets (services, tools/APIs, exchange formats, effort)

### Takeaway
There is no standard GRC-to-GRC exchange format in commercial practice. Migrations are re-implementations: export to files, rebuild the control crosswalk, re-import registers through CSV, re-authorize integrations, and keep old evidence as archived files. A single-framework SaaS migration typically takes 4–6 weeks, with 4–8 weeks of overlapping subscriptions. Enterprise GRC migrations (AuditBoard, Archer, ServiceNow) are usually done by implementation partners over months, sometimes with dedicated migration tools.

### Cited Findings
- **What transfers between Vanta and Drata** (from a consultancy guide; the author sells managed migrations):
  - Policy text moves as files, but approval workflows, version history and employee acceptances do not, so every employee re-accepts.
  - Control mappings don't transfer and need a full re-map.
  - Historical evidence "does not import as continuous audit history".
  - Evidence freshness clocks reset at cutover.
  - Integrations must be re-authorized one by one.
  - Offboarded-employee history is usually lost.
  - Vendor inventory and risk register (tiers, review dates, treatment decisions) need manual re-entry.
  - The trust center URL changes, and the auditor has to re-onboard.
  — [Agency: Switching Drata↔Vanta migration guide](https://blog.getagency.com/articles/switching-drata-to-vanta-migration-guide)
- **Effort.** The same source estimates **4–6 weeks** for a single-framework SaaS environment:
  - W1: export everything.
  - W1–2: build the control crosswalk through the TSC.
  - W2–3: set up the new platform and integrations.
  - W3–4: re-enter vendors and risks and push policy re-acceptance.
  - W4: run in parallel and reconcile.
  - W5: cut over and re-onboard the auditor.
  - It advises "Never migrate in the middle of a Type II observation period" and recommends getting export rights confirmed in writing (what, in what format, for how long after termination) — [Agency migration guide](https://blog.getagency.com/articles/switching-drata-to-vanta-migration-guide)
- **Competitive migration programs.** A third-party site claims Drata runs a structured migration program that imports controls and evidence from Vanta, but no primary source was found. Vanta advertises "no-cost GRC and customer success resources" and runs webinars on leaving Drata — [Agency: Can I switch from Drata to Vanta](https://getagency.com/questions/can-i-switch-from-drata-to-vanta); [Vanta: Vanta vs Drata](https://www.vanta.com/compare/drata); [Vanta webinar: teams leaving Drata](https://www.vanta.com/webinars/its-not-you-its-your-platform-three-teams-on-leaving-drata-for-vanta)
- **Partner-led enterprise migrations.**
  - Protiviti moved a regional bank's internal audit and risk assessment into AuditBoard within **six months**. The work included process mapping, gap analysis, migration of historical audit and risk data from legacy systems, testing and validation, and training — [Protiviti client story](https://www.protiviti.com/gl-en/client-story/leading-bank-taps-protiviti-auditboard-to-transform-internal-audit)
  - BD Emerson offers AuditBoard migration of workpapers and risk-control matrices from spreadsheets, shared drives or a legacy GRC tool, including "normalizing control language" and mapping controls to risks. It also claims AuditBoard was rebranded "Optro" in March 2026, which I couldn't confirm elsewhere — [BD Emerson: AuditBoard consulting](https://www.bdemerson.com/service/auditboard-consulting)
- **Dedicated migration tooling.** Precision Bridge "Archer Migrator" moves GRC data from RSA Archer to ServiceNow. SAP partners describe migrating data from third-party GRC systems into SAP GRC — [G2: Precision Bridge Archer Migrator](https://www.g2.com/products/precision-bridge-archer-migrator/discuss); [SAP partner: Visionsoft](https://www.sap.com/italy/products/financial-management/partners/visionsoft-inc-curatum-cyber-security.html)
- **Vendor migration methodology.** LogicGate publishes a whitepaper on migrating legacy GRC to Risk Cloud, covering its migration methodology, data confidentiality, integrity and availability, and migration risks. API-based bulk import is available for programmatic migration — [LogicGate whitepaper](https://www.logicgate.com/resources/whitepapers/future-proofing-enterprise-grc-your-roadmap-for-migrating-to-risk-cloud/); [LogicGate Bulk Import API](https://www.logicgate.com/developer/risk-cloud-api-bulk-import-records)
- **Round-trip export/import.** Vanta's export → edit → re-upload flow and Hyperproof's control export are the closest thing to a portable format inside one tool — [Vanta Help](https://help.vanta.com/en/articles/12005142-adding-and-managing-risks); [Hyperproof: Exporting controls](https://intercom.help/hyperproofio/en/articles/14303773-exporting-controls-from-the-controls-window)
- **OSCAL as an exchange format.** OSCAL is the only formal standard. It has seven models (catalog, profile, component definition, SSP, assessment plan, assessment results, POA&M) in XML, JSON and YAML, with traceability from assessment back to catalog — [NIST OSCAL concepts: layers](https://pages.nist.gov/OSCAL/learn/concepts/layer); [FedRAMP: What is OSCAL](https://automate.fedramp.gov/about/what-is-oscal)
- **OSCAL adoption.** One consultancy reports that in 2025 FedRAMP processed more than 100 Rev5 authorizations without a single OSCAL submission. FedRAMP RFC-0024 (Jan 2026, closed 2026-03-11) proposed mandatory machine-readable (OSCAL) packages for Rev5 starting Sept 2026. Sources conflict on the final scope: one says it was narrowed to Class D (High), another still says all Rev5 — [FedRAMP RFC-0024](https://www.fedramp.gov/rfcs/0024); [Center for Cybersecurity Policy](https://www.centerforcybersecuritypolicy.org/insights-and-research/fedramp-signals-acceleration-of-requirements-for-machine-readable-packages-in-the-rev5-process); [Elevate Consult](https://elevateconsult.com/insights/oscal-vs-traditional-fedramp-documentation-choosing-the-right-compliance-approach/)
- **Internal-importer bottleneck.** Secureframe's internal importer was an onboarding bottleneck that slowed upmarket (enterprise) deals until they adopted an embedded importer — [OneSchema case study](https://oneschema.co/case-studies/accelerate-upmarket-product-roadmap)

### Inferences
- **What to offer for migration.** For a new GRC product (GRC360), "migration" means three things:
  - Good, forgiving spreadsheet import for each register.
  - A crosswalk or mapping step for controls, because the old tool's control IDs are not portable.
  - An archive bucket for historical evidence and audit reports, which arrive as attachments rather than live records.
- **Exports from other tools as input.** Importers should accept exports from Vanta, Drata, Eramba, SimpleRisk and others as they come out of those tools. Secureframe's "upload in its current state" is the right UX. Saved mapping presets per source tool would cut repeat effort.
- **Timing.** Migration timing should avoid audit observation periods. An onboarding checklist could ask "When is your next audit?"
- **Services as a sales lever.** White-glove or partner migration is standard upmarket and is used as a competitive sales lever.

### Gaps
- I found no primary-source confirmation of any vendor's free migration offer or its terms (Drata's, Vanta's or AuditBoard's).
- I found no public statistics on typical enterprise GRC migration duration beyond the single Protiviti case (six months).
- OSCAL import/export support in commercial GRC tools (Vanta, Drata and others) wasn't verified. One blog covers which platforms export OSCAL in 2026, but I didn't read it — [Mycroft blog](https://diogenesclub.mycroft.io/blog/fedramp-20x-platform-readiness-oscal-export-guide)

## 3. Framework/content libraries: loading and updating framework content, OSCAL, SCF, cross-mapping, CISO Assistant YAML

### Takeaway
Vendors ship pre-mapped framework libraries that customers activate rather than import. Customers bring custom or local frameworks through an Excel/CSV upload, and AI-assisted mapping to the vendor's common control set is becoming standard (Drata Framework Mapping Agent, Vanta AI test suggestions). Licensed metaframeworks supply the content backbone: SCF is free under Creative Commons, has 1,500+ controls mapped to 200+ laws, ships as CSV/Excel or OSCAL JSON, and updates quarterly. UCF is a paid subscription used by ServiceNow. CISO Assistant is the best open reference for a versioned library DSL: Excel ↔ YAML, URNs, version-based updates, and mapping sets with set-theory relationships.

### Cited Findings
- **Secure Controls Framework (SCF)**
  - It is "the Common Controls Framework®" metaframework, with 34 domains, "1,500+ controls", mapped to "200+ unique laws, regulations, and frameworks".
  - It is free under Creative Commons ("No licensing fees for the core framework").
  - It downloads as CSV/Excel or NIST OSCAL JSON, with **quarterly releases** ("4 releases per year"; the page references 2026.2).
  - Stable control IDs (e.g. GOV-03, IAC-06) support version management, and it is "natively supported by dozens of enterprise GRC platforms".
  — [securecontrolsframework.com](https://securecontrolsframework.com/)
- **SCF crosswalks.** Since 2024 SCF crosswalks use **NIST IR 8477 Set Theory Relationship Mapping (STRM)**. Each mapping has a relationship type (subset of, equal to, superset of, intersects with, no relationship) and a numeric strength score. Per-framework STRM Excel files are sold for $3 each, or $20 as a bundle (the 2024.3 bundle was seen) — [SCF](https://securecontrolsframework.com/); [SCF STRM bundle](https://securecontrolsframework.com/strm-bundle); [SCF STRM NIST 800-53 R5](https://securecontrolsframework.com/strm-nist-800-53-r5)
- **SimpleRisk content.** SimpleRisk installs default frameworks and assessments, separate from its "Compliance SecureForge (SCF)" content — [SimpleRisk Import-Export Extra guide](https://support.simplerisk.com/kb/import-export-extra-installation-and-administration-guide)
- **OSCAL model layers:**
  - Control layer: Catalog (controls), and Profile (baseline selection or tailoring of a catalog).
  - Implementation layer: Component Definition (what a product or service provides), and SSP (how a system implements controls).
  - Assessment layer: Assessment Plan, Assessment Results (scope, evidence, findings), and POA&M (tracking findings to closure).
  - Formats are XML, JSON and YAML.
  — [NIST OSCAL layers](https://pages.nist.gov/OSCAL/learn/concepts/layer); [NIST OSCAL Control Layer lecture](https://csrc.nist.gov/csrc/media/Projects/open-security-controls-assessment-language/documents/oscal-lecture-2/The%20Anatomy%20of%20OSCAL%20Models-Control_Layer-2023.03.21.pdf); [NIST Assessment Layer lecture](https://csrc.nist.gov/csrc/media/Projects/open-security-controls-assessment-language/documents/oscal-lecture-4/The%20Anatomy%20of%20OSCAL%20Models-Assessment_Layer.pdf)
- **ServiceNow + UCF Common Controls Hub**
  - Admins build "shared lists" in UCF CCH and import them. Free UCF access with a GRC license ended on 2018-11-30, so customers now buy UCF directly.
  - Terminology mapping: UCF Authority Document → Authority Document, Citation → Citation, Control → Control Objective.
  - Imported UCF content is **read-only** ("Do not customize").
  - Each new shared list must include every authority document already imported, and a list holds at most 100 documents.
  - Deprecated content is not auto-deactivated, so admins validate citation↔control-objective links, aided by an email listing them.
  — [ServiceNow Docs: Integrate with UCF CCH](https://www.servicenow.com/docs/r/zurich/governance-risk-compliance/c_UCF.html); [ServiceNow Store listing](https://store.servicenow.com/store/app/f89ce3ee1b246a50a85b16db234bcb56)
- **Drata "test once, comply many"**
  - Custom frameworks map to controls with the same control-centric structure as built-in ones, and custom controls are reused across frameworks.
  - The **Framework Mapping Agent** works on an uploaded custom framework. It recommends mappings from active DCF (Drata Control Framework) controls, custom controls and the full DCF library, each with a confidence indicator. "Nothing is added until you accept."
  - It requires the Custom Framework add-on, at no extra cost for the Agent.
  — [Drata: Custom frameworks](https://drata.com/custom-frameworks); [Drata Help: Framework Mapping Agent](https://help.drata.com/en/articles/16630433-framework-mapping-agent-ai-assisted-control-mapping-for-custom-frameworks)
- **Vanta.** Custom frameworks are uploaded via an Excel template with a section hierarchy. Vanta AI suggests tests for each control from its description, and custom tests are pre-mapped to common framework controls — [Vanta Help](https://help.vanta.com/en/articles/11345361-bringing-your-current-compliance-program-into-vanta); [Vanta developer docs: tests](https://developer.vanta.com/docs/concepts/tests)
- **Framework counts.** A third-party comparison says Vanta lists 35+ pre-mapped frameworks (Dec 2025), and Drata lists 25 (21 fully mapped, 4 "requirement only"). This is secondary — [CPO Magazine: Vanta vs Drata](https://www.cpomagazine.com/digital/vanta-vs-drata-for-enterprise-compliance/)
- **CISO Assistant library format (v2)**
  - **Excel tabs** are `_meta` (key/value) or `_content` (rows with a header).
  - **`library_meta`** has mandatory keys `urn`, `version`, `locale`, `ref_id`, `name`, `description`, `copyright`, `provider` and `packager`, plus optional `dependencies`.
  - **Framework requirements** have the columns `assessable`, `depth`, `ref_id`, `implementation_groups`, `threats`, `reference_controls`, `questions`, `weight` and `importance` (mandatory/recommended/nice_to_have).
  - **Reference controls** have the categories policy, process, technical, physical and procedure, plus a `csf_function`.
  - **Mapping sets** (`requirement_mapping_set`) have the columns source/target node, `relationship` (`equal`, `subset`, `superset`, `intersect`), `rationale` and `strength_of_relationship`. The converter auto-generates the reverse mapping.
  - **URN form** is `urn:<packager>:risk:<object>:<refid>`.
  - **Updates:** "increment `version`… if not higher, your framework will not be updated", so updates are version-gated.
  - Tools: `convert_library_v2.py` (Excel→YAML), `prepare_framework_v2.py`, `prepare_mapping_v2.py`.
  — [CISO Assistant tools/README](https://github.com/intuitem/ciso-assistant-community/blob/main/tools/README.md)
- **CISO Assistant content and loading**
  - Excel libraries can be loaded directly via Governance → Library → Load, and validation errors are reported.
  - Some licensed frameworks (CIS Controls, CSA CCM) are marked `*`: the user has to download the publisher's Excel sheet, because the content can't be redistributed.
  - There are 130 official and 38 community libraries in the enumerated list, while the feature list says "+220 frameworks". The README is internally inconsistent here.
  - Local-regulation examples: Morocco DNSSI, Korea ISMS-P, Swiss FINMA 2023/01, Spain ENS, Saudi NCA ECC-2:2024, India DPDPA 2023, France ANSSI SecNumCloud.
  - Other features listed: "Automatic mapping", "Mapping explorer", and assessing one scope against multiple frameworks at once.
  — [CISO Assistant README](https://github.com/intuitem/ciso-assistant-community/blob/main/README.md)
- **Archer content.** Archer's Authoritative Source content packages are loaded through data feeds rather than manual key-field changes — [Archer Community](https://community.archerirm.com/hc/en-us/articles/50697476415251)

### Inferences
- **Content layers.** A GRC content library should be modelled as four separate layers:
  - Read-only, vendor-maintained framework catalogs with stable IDs/URNs and a version.
  - A common control set (an SCF-style metaframework, or the vendor's own like Drata's DCF).
  - Mapping sets with typed relationships (STRM: equal/subset/superset/intersect plus strength).
  - Tenant-owned custom frameworks and controls.
- **Updates.** Content updates should be versioned and diffed. Deprecated requirements need to be flagged for review rather than silently deleted, which is a lesson from ServiceNow UCF.
- **SCF as a base.** For a startup GRC product, SCF (free, CC-licensed, OSCAL/CSV, quarterly, 200+ mappings) is the cheapest legal backbone. Two licensing issues need care: SCF's own terms, and content like ISO 27001 text or CIS that can't be redistributed (the CISO Assistant `*` model). Local regulations (e.g. Azerbaijani regulations) can then be added as custom libraries in the same Excel→YAML format.
- **AI mapping.** AI-assisted mapping of uploaded custom frameworks to the common control set, with confidence scores and human accept/reject, is now table stakes at Drata and Vanta.

### Gaps
- I didn't confirm whether SCF's OSCAL download includes STRM crosswalks, or only the catalog.
- I didn't verify how often Vanta and Drata update built-in framework content, or how they notify customers of framework version changes (e.g. ISO 27001:2013→2022, PCI DSS 4.0.1).
- The CISO Assistant YAML schema itself (field-level) isn't documented in the README. The Excel spec is the authoritative description.

## 4. Import UX best practice in general SaaS (embeddable importers, AI mapping, validation, large files, async jobs, history)

### Takeaway
The converged pattern is a 4–5 step wizard: upload (drag-and-drop plus picker plus template) → header/sheet detection and preview → auto-mapping with override and saved presets → row-level inline validation with fix-in-place → upsert decision → async commit with a created/updated/skipped/errored summary and downloadable error rows. Embeddable vendors (OneSchema, Flatfile, Dromo, CSVBox) and OSS (react-spreadsheet-import, Impler, react-csv-importer) supply most of this. AI or ML column mapping is now standard: Flatfile claims >90% of mapping actions predicted.

### Cited Findings
- **Pattern catalogue (2026 article):**
  - Multiple entry paths: file, paste, connectors (HubSpot, Jira, Asana).
  - A downloadable template.
  - Parse preview showing detected header, delimiter and row count ("4,812 rows detected").
  - Auto-mapping that shows sample values, with map / create-field / skip for unmatched columns, and **mapping saved as a named template**.
  - Row-level validation with counts ("212 rows missing a required email"), letting users fix inline, download error rows, or import only valid rows.
  - **Duplicate handling:** name the match key and ask skip/update/create with an impact preview ("340 of these rows match existing contacts").
  - **Async background jobs** with a progress bar, count, ETA and a completion notification, plus a created/updated/skipped/errored summary.
  - **Undo/rollback**, or a "clearly tagged import batch the user can find and bulk-delete".
  - Note: the article names products but doesn't attribute specific features to them.
  — [SaaSUI: SaaS data import mapping UX patterns](https://www.saasui.design/blog/saas-data-import-mapping-ux-patterns)
- **Smashing Magazine (Dec 2020).** Friction in data onboarding drives users away, so importer complexity should stay hidden. Upload affordances should signal both drag-and-drop and a visible button, and a manual spreadsheet-like entry option is a third path — [Smashing Magazine: Designing an attractive and usable data importer](https://smashingmagazine.com/2020/12/designing-attractive-usable-data-importer-app/)
- **Dromo** (vendor blog) recommends:
  - Validating as early as possible, ideally at upload.
  - Fuzzy header matching (Levenshtein, Jaro-Winkler, embeddings) instead of exact string match.
  — [Dromo: 5 best practices](https://dromo.io/blog/5-best-practices-to-streamline-your-csv-import-process); [Dromo: Data mapping best practices](https://dromo.io/blog/data-mapping-best-practices-csv-imports)
- **CSVBox** (vendor blog) recommends:
  - A file → map → validate → submit flow.
  - Blocking errors vs non-blocking warnings.
  - Fixing and resubmitting only the failed rows.
  - Logging import events with row context for support.
  — [CSVBox: multi-step import flow](https://blog.csvbox.io/multi-step-import-flow/); [CSVBox: reduce support tickets](https://blog.csvbox.io/reduce-support-tickets-import-ux/); [CSVBox: validate before DB](https://blog.csvbox.io/validate-csv-before-db/)
- **Flatfile mapping.** An ML model trained on mapping choices from "1.8 billion" rows predicts "over 90% of matching actions". Saved mappings are reapplied automatically, and multi-sheet files get a sheet-selection step. Imports can be asynchronous. The SDK is event-driven (upload, prepare, map, transform/validate, export) — [Flatfile Support: Mapping data](https://support.flatfile.com/articles/8569925090-mapping-data); [Flatfile Support: Data importer](https://support.flatfile.com/en/articles/7873681-flatfile-s-data-importer); [Flatfile docs](https://flatfile.com/docs)
- **Drata's in-app version** shows the same pattern: field mapping, then *value mapping* (dropdown or enumerated values), cell colouring (red error / yellow warning or update), header hover rules, and submit gated on errors — [Drata Help](https://help.drata.com/en/articles/13381439-import-or-update-controls-in-bulk-new-experience)
- **Embeddable vendor landscape** (all sources are competitor blogs with conflicting prices):
  - **OneSchema:** React-first, strong AI mapping, no public pricing, 50+ prebuilt validators (per the Secureframe case).
  - **Flatfile:** enterprise platform from roughly $500/mo. A Dromo blog claims it rebranded to "Obvious" and pivoted to data orchestration, which is unverified.
  - **Dromo:** React/Angular/Vue plus a headless API, AI mapping. Dromo says free to start and $599/mo Pro.
  - **CSVBox:** script tag or React adapter, 15–30 minute setup. Its own pages say $0 / $49 / custom, while Dromo says tiers start at $19.
  — [Dromo comparison](https://dromo.io/blog/dromo-vs-flatfile-vs-oneschema-a-comprehensive-comparison); [Dromo: Flatfile alternatives 2026](https://dromo.io/blog/best-flatfile-alternatives-competitors-2026); [CSVBox: Flatfile alternatives](https://csvbox.io/resources/flatfile-alternatives); [OneSchema: Dromo alternatives](https://www.oneschema.co/blog/dromo-alternatives); [OneSchema case study](https://oneschema.co/case-studies/accelerate-upmarket-product-roadmap)
- **Open-source options:**
  - **react-spreadsheet-import** (UgnisSoftware) is described as a free OSS alternative to Flatfile and Dromo.
  - **Beamworks react-csv-importer** uses PapaParse with a drag-and-drop mapping UI but has no validation or data editing.
  - **Impler** is OSS with static and dynamic validation.
  - **TableFlow** is described as OSS but its listed license is ambiguous.
  - **CSVImporter** is a Rails backend-only option.
  - Parsing libraries: PapaParse (CSV) and SheetJS (XLSX).
  — [awesome.ecosyste.ms: react-spreadsheet-import](https://awesome.ecosyste.ms/projects/github.com%2FUgnisSoftware%2Freact-spreadsheet-import); [OneSchema: Open-source CSV importers](https://www.oneschema.co/blog/open-source-csv-importers); [CSVBox: OSS Flatfile alternatives](https://blog.csvbox.io/open-source-flatfile-alternatives/); [AlternativeTo: Impler](https://alternativeto.net/software/impler)
- **LogicGate error handling.** LogicGate returns a marked-up file with errors annotated, an alternative to in-browser fixing that suits very large files — [LogicGate Help](https://help.logicgate.com/hc/en-us/articles/4402674054292-Import-Data-into-Risk-Cloud)

### Inferences
- **Recommended GRC360 import flow:**
  1. Choose entity with "download template" (XLSX with a first-row or hint-row description, as in eramba, plus dropdown validation lists).
  2. Upload XLSX/CSV (select sheet and header row, as in Secureframe).
  3. AI or fuzzy column mapping, with presets saved per source tool (e.g. "Eramba export", "Vanta export").
  4. Value mapping for enums (likelihood/impact scales, statuses, as in Drata).
  5. Grid with cell-level errors and warnings, plus "update existing (matched on key X)" highlighting.
  6. Async commit with a summary.
  7. Import batch in history with an error-row download and "delete this batch".
- **Build vs buy.** Buying an embeddable importer is a fast way to reach a Secureframe-level UX ("in less than a single day"). Building on react-spreadsheet-import plus SheetJS is the OSS route if data residency rules out third-party processing (section 5).

### Gaps
- I found no NN/g research article specifically on CSV import, and no independent (non-vendor) UX research quantifying import abandonment.
- Concrete large-file thresholds (row counts at which to switch to async) weren't found in vendor docs.
- I didn't verify Flatfile's alleged rebrand to "Obvious" from a primary source.

## 5. Security and compliance considerations of imports (PII, data residency, audit trail)

### Takeaway
Imported GRC data is sensitive: personnel lists (PII), vendor contacts, risk descriptions revealing weaknesses, and audit findings. Importers therefore need role-gated access, encryption, short staging retention, regional processing and an audit trail. Third-party embedded importers are themselves sub-processors that need DPAs and region choice. GRC vendors gate import behind specific roles or entitlements but rarely document import audit logs publicly.

### Cited Findings
- **Role gating in GRC tools:**
  - LogicGate requires a role with the **Import entitlement** plus edit access to the step.
  - Drata limits the Framework Mapping Agent to Admin, Compliance Manager, GRC Lead and Control Manager, and approvers must hold specific roles.
  - HighBond restricts bulk import to System Admins.
  - AuditBoard's Excel import add-in requires Customer Support enablement.
  — [LogicGate Help](https://help.logicgate.com/hc/en-us/articles/4402674054292-Import-Data-into-Risk-Cloud); [Drata Help: Framework Mapping Agent](https://help.drata.com/en/articles/16630433-framework-mapping-agent-ai-assisted-control-mapping-for-custom-frameworks); [HighBond](https://help.highbond.com/helpdocs/highbond/en-us/Content/administration/bulk_importer/bulk_uploading_controls.htm); [AppSource: AuditBoard Import Tools](https://appsource.microsoft.com/en-us/product/web-apps/WA200006771)
- **Sensitive risks.** Vanta lets a risk be marked "sensitive", restricting its visibility and editing to admins. This matters when importing risk registers that describe exploitable weaknesses — [Vanta Help](https://help.vanta.com/en/articles/11345361-bringing-your-current-compliance-program-into-vanta)
- **Staging data retention.** ServiceNow purges import staging data older than 7 days by default (Import Set Deleter) — [ServiceNow Docs](https://www.servicenow.com/docs/r/yokohama/integrate-applications/system-import-sets/c_ImportSetsKeyConcepts.html)
- **OneSchema** (self-reported):
  - SOC 2 Type 2, SOC 3, GDPR, CCPA and HIPAA.
  - US, EU, CA and AU regions, plus self-hosted on AWS, GCP or Azure.
  - AES-256 at rest, TLS 1.2 in transit.
  - **7-day default retention**, with deletion via API.
  - Signs DPAs and BAAs.
  — [OneSchema SOC 2 changelog](https://docs.oneschema.co/changelog/soc2-type-ii); [OneSchema vs competitors](https://www.oneschema.co/oneschema-vs-competitors)
- **Flatfile** (self-reported): SOC 2 Type II, ISO 27001, GDPR and CCPA, region-specific hosting, "HIPAA ready" (not certified), RBAC and MFA — [Flatfile security](https://flatfile.com/security/)
- **CSV vs API for migration.** API-based migration is argued to be safer than CSV handling because CSV files are unencrypted plain text that circulate by email or download. This comes from a vendor blog — [Import2 blog](https://import2.com/security-benefits-of-api-based-data-migration-over-csv-imports)
- **Customer expectations.** A OneStream community request for RCM mass-load asks for validation, downloadable error reports, security controls and an **audit trail of loaded/updated records**. This is a customer requirement signal, not a shipped feature — [OneStream community](https://community.onestream.com/reporting-7/mass-upload-mass-updates-capability-for-rcm-account-reconciliation-8572)
- **Personnel imports.** Secureframe recommends HRIS/IdP integrations over CSV for personnel, which reduces manual handling of employee PII — [Secureframe: Import personnel via CSV](https://support.secureframe.com/en/articles/15111155-import-personnel-via-csv)

### Inferences
- **Import audit trail.** Each import should be logged as an auditable event: who, when, file name and hash, entity type, mapping used, and created/updated/skipped counts with record IDs. This doubles as the "undo batch" mechanism and as audit-trail evidence for the GRC tool's own SOC 2 or ISO 27001 scope.
- **Data residency.** For regional customers (e.g. Azerbaijan or EU), embedded third-party importers add a sub-processor and may move data across borders. Parsing in the browser or on-premise (SheetJS/PapaParse plus your own backend), or a vendor's self-hosted or regional option, avoids this.
- **Uploaded files.** Uploaded source files and error-row downloads contain the same sensitive data. They need short retention, encryption and restricted access (cf. ServiceNow's 7 days, OneSchema's 7-day default).

### Gaps
- No GRC vendor (Vanta, Drata, Secureframe, Hyperproof) publicly documents an import history or audit log view for imports specifically.
- I found nothing on whether GRC vendors scan uploaded files (DOCX/PDF policies, evidence) for malware, or how they handle macro-enabled XLSX.
- The data residency options of GRC SaaS importers themselves (as opposed to embedded importer vendors) weren't researched.
