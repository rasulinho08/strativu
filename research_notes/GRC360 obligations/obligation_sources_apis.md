# GRC360: where obligations content can come from automatically

Quick research, 2026-10-15. About 20 searches and fetches. Tags used below:
- **[V]**: confirmed from a source found in this session.
- **[K]**: background knowledge that was not re-checked this session. Verify before relying on it.
- **[?]**: nothing found.

## TL;DR

- **Azerbaijan, the core market:** there is **no official public API, RSS feed or bulk export** for e-qanun.az or cbar.az.
  - The texts are free to read on the web, as HTML. CBAR also publishes some acts as PDF.
  - e-qanun.az runs an undocumented JSON backend (`api.e-qanun.az`), which a community client has reverse-engineered. Its Swagger is "IP/referer-gated", and access is requested through justice.gov.az.
  - The only clean route is a **formal data-access agreement with the Ministry of Justice**. That is worth pursuing, because it could set GRC360 apart in the region.
- **Commercial feeds:** they exist (TR Regulatory Intelligence, CUBE, LexisNexis, Corlytics, Ascent, UCF, FiscalNote, Regology), but they are enterprise-priced and mostly cover EU, UK, US and APAC financial services. Coverage of Azerbaijan or the CIS is unproven. Ask each vendor directly.
- **Free official APIs:** EUR-Lex/CELLAR, legislation.gov.uk, and the US Federal Register, eCFR and GovInfo are all good and give article- or section-level XML. They are the cheapest way to cover international content (GDPR, DORA, NIS2, UK and US rules).
- **Open framework datasets:** CISO Assistant (YAML, includes GDPR, DORA and NIS2), SCF (CC BY-ND, so it **cannot be modified or AI-derived**) and NIST OSCAL give requirement-level structure at once.
- **Recommended mix:**
  - Seed international content from open datasets and official APIs.
  - For Azerbaijani acts, add **LLM-assisted extraction** from the e-qanun HTML, with a human reviewer approving each item.
  - Leave room for a paid-feed connector, such as UCF, CUBE or TRRI, for enterprise clients who already license one.

## 1. Commercial regulatory-content providers

| Provider | What it gives | Access | Auth / cost | Article-level? | Source |
|---|---|---|---|---|---|
| Thomson Reuters Regulatory Intelligence (TRRI) | Regulatory feed: final and proposed rules, consultations, speeches, press releases. "Series" tracking from proposed to final. | **SFTP file feed** placed by TR (configured in the TR portal). REST is also supported. ServiceNow app `com.sngrcinttr`. | Separate paid licence, enterprise. | Document-level feed with taxonomy, not obligations by default. [V] | https://www.servicenow.com/docs/r/zurich/governance-risk-compliance/grc-trri-integration.html |
| CUBE (RegPlatform, RegPlatform Intel) | AI-classified regulatory content: 180 countries, 60 languages, more than 3,000 issuing bodies, mapped to the client's frameworks. | "API-first". Real-time API link with MetricStream. Agents on Azure Marketplace (2026). | Enterprise; mid-market "Intel" tier launched 2025. No public API docs. | Claims obligation and requirement-level mapping. [V] | https://fintech.global/2026/09/02/cube-turns-regulatory-overload-into-an-ai-advantage/ ; https://www.businesswire.com/news/home/20211130005106/en/CUBE-Partners-with-MetricStream-to-Bolster-Client-Decision-Making-and-Compliance-Capabilities |
| LexisNexis Regulatory Compliance (AU) | Three streams: **obligations**, tools, alerts (from draft to commencement). Superseded items kept for 12 months. | **REST pull API**. The GRC tool sets how often it polls. | Subscription. | Yes, an obligations register. Australia-focused. [V] | https://compliance.community.lexisnexis.com.au/hc/en-au/article_attachments/16115583331087 |
| Corlytics | Regulatory library of obligations, with applicability filtering by activity and jurisdiction. | In-app or **via APIs**. | Enterprise. | Yes, obligation-level. [V] | https://www.corlytics.com/?p=9966 |
| Ascent (AscentAI) | Obligations generated for each customer and kept up to date automatically. Integrates with GRC tools. | API. | 2021 press release: "no hidden API fees" (may be dated). | Yes, obligation-level. Mostly US and UK financial services. [V] | https://ascentregtech.com/?p=2833 |
| Unified Compliance Framework (UCF) Common Controls Hub | Authority documents, then **citations**, then common controls. Mandated vs implied controls. Mapped across about 1,000+ documents [K]. | CCH REST API with API keys. Used by the ServiceNow and HOPEX connectors. | Paid. API access must be included in the CCH subscription. | Yes, citation-level text with control mapping. Strongest "obligations to controls" dataset. [V] | https://www.servicenow.com/docs/r/zurich/governance-risk-compliance/c_UCF.html ; https://support.unifiedcompliance.com/unified-compliance-faqs ; https://doc.mega.com/hopex-v6-en/GRC/Internal_Control/UCF.About_Unified_Compliance_Framework.html |
| FiscalNote (PolicyNote API) | Legislative, regulatory and stakeholder data: US Congress, all 50 states, 100+ countries. **MCP server** (Mar 2026). Self-serve access being introduced. | REST and MCP. | Paid. | Mainly bill and regulation tracking, not obligations. [V] | https://app.dealroom.co/news/feed/fiscalnote-expands-policynote-api-with-mcp-server-support-for-ai-agents |
| Regology | Claims 16M+ laws and regulations. GRC integrations and API listed. | API (details are behind its integrations page). | Paid. | Unclear. [V] | https://regology.com/llms-txt |
| Compliance.ai | Financial-services regulatory content. Developer platform launched 2017. | API (old docs). | Paid. | Unclear; may be dated. [V] | https://www.apitracker.io/a/compliance-ai/developers |
| Wolters Kluwer (OneSumX Reg Change, Compliance Intelligence) | Regulatory change content for banks and insurers. | [?] No API docs found. | Enterprise. | [?] | — |

**Takeaway:** none of these clearly cover Azerbaijan. CUBE (180 countries) is the most likely to. UCF is the best fit for mapping international obligations to controls. Before committing, ask each vendor for an Azerbaijan, Georgia and Kazakhstan coverage list, along with pricing for a reseller or OEM licence. GRC360 would be redistributing the content to its own customers, so a standard end-user licence would not cover that.

## 2. Free official legal-data APIs

| Source | Access | Auth / licence | Formats and granularity | Updates | Source |
|---|---|---|---|---|---|
| **EUR-Lex / CELLAR** (EU Publications Office) | **SPARQL** endpoint `http://publications.europa.eu/webapi/rdf/sparql` for metadata. **Cellar REST** to fetch documents by CELEX or ELI. EUR-Lex **SOAP web service** for search (it cannot download files). **RSS**, predefined or custom. | SOAP needs free registration. SPARQL and REST are open. Reuse is free under Commission Decision 2011/833/EU [K]. | **Formex XML**, which has article-level elements, plus XHTML and PDF. Consolidated versions are available. Akoma Ntoso (AKN4EU) is being rolled out [K]. | Daily (OJ). | https://eur-lex.europa.eu/content/help/data-reuse/webservice.html ; https://eur-lex.europa.eu/content/help/data-reuse/reuse-contents-eurlex-details.html ; R client: https://rdrr.io/cran/eurlex/f/README.md |
| **legislation.gov.uk** | REST: append `/data.xml` (CLML), `/data.akn` (Akoma Ntoso), `/data.html`, `/data.pdf` to any URI. Atom feeds [K]. | Open, **OGL v3.0**. | CLML and AKN, structured to section level. Fetching a section directly may return 404 (per a third-party report), so parse the full document. | Continuous, with point-in-time versions. | https://research.legislation.gov.uk/node/58 ; https://op.europa.eu/en/web/forum/uk-oj2 |
| **US Federal Register API** | REST/JSON (federalregister.gov/developers [K]). | **No key**, public domain. | Rules, proposed rules and notices, as document-level JSON plus full-text XML. | Daily. | https://dev.to/ronin13/us-regulations-have-a-free-json-api-every-rule-notice-and-executive-order-without-scraping-4o34 |
| **eCFR API** | REST (versioner, search, structure; ecfr.gov/developers [K]). | **No key**. | Section-level XML and JSON, with point-in-time history. | Daily. | https://www.vaquill.ai/blog/ecfr-api-official-guide-cfr-as-json-xml-and-bulk-data |
| **GovInfo API** | REST plus **bulk data** (eCFR XML per title; bulk files need no key). | API needs a free **api.data.gov key**. DEMO_KEY is heavily limited. | USLM and CFR XML. | Daily. | https://govinfo.gov/developers ; https://www.vaquill.ai/blog/govinfo-api-guide-keys-endpoints-limits-and-bulk-data |

## 3. Azerbaijan (and Turkey)

### e-qanun.az: Unified Internet Database of Legal Acts (Ministry of Justice)
- **Official position [V]:**
  - Launched 2006.
  - Texts are free on the website and in the mobile app.
  - No public API, RSS or bulk export is documented.
  - Source: https://justice.gov.az/en/digital-justice/e-qanunaz-unified-electronic-database-of-legal-acts
- **Undocumented backend [V, community README]:** https://glama.ai/mcp/servers/beerbottle90/eqanun-api
  - **Endpoints:**
    - JSON API at `api.e-qanun.az`.
    - `GET /getDetailSearch`, with parameters `name`, `title`, `text`, `exact`, `statusId`, `start` and `length`.
    - `GET /detailNameCount`.
    - `GET /framework/{id}` returns metadata including `htmlUrl`.
  - **Full text:**
    - Served as MS-Word-generated HTML from a separate static host.
    - Charsets are mixed (windows-1251, -1252 or -1254).
    - The host blocks hotlinking and needs a same-site `Referer`.
  - **Corpus:** about 59.5k documents.
  - **Official Swagger:** exists, but is "IP/referer-gated". Access is requested through justice.gov.az.
  - **Not provided:** article-level structure, and PDF or DOCX output.
  - **Terms:** the client's MIT licence covers only the code. The legal texts stay under the Ministry's terms.
- **Implication for GRC360:**
  - Scraping is technically possible but fragile, and the legal position is unclear.
  - Better route: **request official API access, or a data-sharing MoU, from the Ministry of Justice**. The gated Swagger suggests such access is already granted case by case.
  - Article splitting would be GRC360's job, e.g. regex on "Maddə N" headings, then LLM extraction.
- **Third-party aggregator:** legalacts.az, a commercial electronic database. https://legalacts.az/en/article/General+info [V, terms not checked]

### Central Bank of Azerbaijan (cbar.az)
- **Publication format [V]:**
  - Normative acts are listed under "Hüquqi aktlar" by sector, such as Kredit təşkilatları or Ödənişlər.
  - Acts are published as **HTML pages** (e.g. https://www.cbar.az/law-370/regulations-on-information-security-management-in-banks), with some PDFs on uploads.cbar.az.
  - No API or RSS was found. CBAR acts are also registered in e-qanun after state registration [K].
- **Key information-security acts:**
  - **"Regulations on information security management in banks"**, CBAR Decision No. 20/1 of 14 Jul 2021. ISO 27000-based, with ISMS overseen by the Supervisory Board. Covers asset classification, access control, crypto keys and data-centre physical security. [V, from a summary] https://uploads.cbar.az/assets/Regulations%20on%20information%20security%20management%20in%20banks.pdf
  - **CBAR Decision No. 14/2 (reported May 2024):** minimum information-security requirements for all supervised entities, including banks, insurers, payment institutions and cloud providers. [V, secondary source only] https://regalert.today/document/df832c31-9835-425d-beb3-3ac5f2772982
  - **Older "Regulations on security of information systems in banks"**, Decision No. 26/4 of 10 Dec 2014. May be superseded; verify.

### Other Azerbaijani GRC laws
- **Law on Personal Data:** No. 998-IIIQ, 11 May 2010 [K].
- **Law on Information, Informatization and Protection of Information:** No. 460-IQ, 1998 [K]. **Cybersecurity amendments** passed first reading on 7 Jul 2026 [V]. They add terms such as cybersecurity and National CERT, and place obligations on ISPs, hosting providers and owners of information resources. A separate amendment, adopted in third reading, requires founders of critical-infrastructure security providers to be Azerbaijani citizens. https://report.az/en/milli-majlis/new-cybersecurity-obligations-for-internet-providers-pass-first-reading-in-milli-majlis ; https://report.az/en/amp/milli-majlis/azerbaijan-bans-foreigners-from-founding-cybersecurity-service-provider
- **Administrative Offences Code, draft Art. 371-2:** fines for cybersecurity violations, AZN 100 to 2,000 for legal entities. Draft as of Jul 2026 [V]. https://en.apa.az/social/azerbaijan-introduces-fines-for-violations-of-cybersecurity-requirements-516099
- **Information Security and Cybersecurity Strategy 2023–2027:** Presidential Order No. 4060, 28 Aug 2023 [V]. https://static.president.az/upload/Files/2023/08/28/321633af3a29da7a850dc20b3a6fb578_9640893.pdf
- **Machine-readable status:** none of these are machine-readable. All exist only as HTML, PDF or Word, in Azerbaijani; English versions are unofficial or partial. This is a **fast-changing area in 2026**, so GRC360 needs change monitoring. A simple approach: poll e-qanun search by date or statusId and diff the results.

### Turkey (mevzuat.gov.tr)
- No official public API was found [V].
- **Community clients use undocumented endpoints:**
  - The mevzuat.gov.tr search/datatable endpoint, plus DOC and PDF downloads: https://glama.ai/mcp/servers/@saidsurucu/mevzuat-mcp
  - A keyless Ministry of Justice JSON API, **bedesten.adalet.gov.tr/mevzuat**, with search, full text and table of contents; per the tr-eli-mcp project.
  - Article-level Markdown is produced by the community tools, not by the source.
- Same caveat as Azerbaijan: these endpoints are fragile and their terms are unclear.

## 4. Open framework and obligation datasets

| Dataset | What | Format / access | Licence | Notes | Source |
|---|---|---|---|---|---|
| **Secure Controls Framework (SCF)** | About 1,400 controls [K]. STRM (NIST IR 8477) mappings to 200–260+ laws, regulations and frameworks. | Excel, CSV, **OSCAL JSON** downloads. | **CC BY-ND 4.0**. Terms explicitly **prohibit derivatives, including using AI** to generate policies, risks and similar from SCF. | Can be redistributed unmodified with attribution. Cannot be edited or AI-transformed inside the product without a commercial licence. | https://securecontrolsframework.com/terms-conditions ; https://securecontrolsframework.com/commercial-license |
| **CISO Assistant libraries** (intuitem) | 100+ frameworks as **YAML** libraries, including GDPR, DORA (Act, RTS, ITS, GL) and NIS2, at requirement-node level with mappings. | GitHub repo (`backend/library/libraries` [K]). Excel-to-YAML converter. | Code is **AGPL-3.0**. Check each library's own licence. CIS and CSA CCM need a manual download. | The best ready-made structured EU obligations. AGPL matters if GRC360 copies the code; reusing the data alone is less clear, so check. | https://github.com/intuitem/ciso-assistant-community |
| **NIST OSCAL content** | SP 800-53 rev5 catalog and baselines, in OSCAL JSON, XML and YAML. | GitHub `usnistgov/oscal-content`. | US government work, public domain [K]. Confirm against the repo's LICENSE. | Gives GRC360 a native structured import format. Worth supporting OSCAL catalog import generally. | https://github.com/usnistgov/oscal-content ; https://pages.nist.gov/OSCAL/learn/concepts/layer/control/catalog |
| **OpenRegulatory** | Templates for medical devices (MDR, ISO 13485) and GDPR, such as TOMs, RoPA and DPIA. | GitHub `OpenSaMD/templates`. | "Template License" page not checked [?]. | Templates rather than obligations. | https://openregulatory.com/gdpr-templates/ ; https://github.com/OpenSaMD/templates |
| **GDPRhub** (noyb) | Wiki of GDPR decisions and article commentary. | MediaWiki; a standard MediaWiki API probably exists [K]. | Licence not confirmed [?]. | Case law and enforcement context, not an obligations list. | https://noyb.eu/node/175 |

## 5. AI-assisted extraction (law PDF or HTML to an obligations list)

- **Products:** most commercial vendors (CUBE, Corlytics, Ascent, Regology) now generate obligations with AI and keep human curation on top [V]. FiscalNote exposes its data to agents over MCP.
- **Research:**
  - LLMs extracting GDPR requirements with RAG, IEEE RE'25: https://orbilu.uni.lu/handle/10993/65265
  - Detail hallucinations in long regulatory documents: https://arxiv.org/pdf/2604.23113
  - LegalHalluLens, ICML 2026: typed obligation errors, i.e. lost modal verbs (shall, must, may) and dropped conditions or exceptions. https://arxiv.org/pdf/2606.18021
  - RegReAct, a multi-stage pipeline with validation loops: https://www.emergentmind.com/topics/regreact
- **Practical pattern:**
  1. Split the act deterministically into articles and paragraphs. For Azerbaijani text, split on "Maddə", "bənd" and "yarımbənd".
  2. Run an LLM pass favouring recall to find candidate obligations. For each one, capture the subject (who), the modal verb, the action, the conditions or exceptions, any deadline, and the article reference.
  3. Run a second LLM pass to classify and normalise each candidate, then map it to controls.
  4. Have a **human reviewer approve** each item, keeping the citation linked to the exact source span.
  5. Re-run when the act changes, and compare the obligations against the previous version.
  - A single-pass approach misses obligations; splitting the task into identify and then analyse improves recall. https://shekhargulati.com/page/2
- **Caveats:**
  - Hallucination: invented or dropped conditions.
  - Azerbaijani-language quality needs to be tested with this specific model.
  - Legal liability: present output as "suggested obligations", not legal advice.
  - SCF terms forbid running AI over SCF content.
  - Source terms of use apply to anything scraped.
  - Data residency, if acts or client data are sent to a hosted LLM.

## Open questions to chase

1. Ask the Ministry of Justice for official e-qanun.az API terms and Swagger access.
2. Ask CUBE, UCF and TRRI about Azerbaijan, CIS and Turkey coverage, and about OEM or redistribution pricing.
3. Check the CISO Assistant library data licence, as distinct from the AGPL on the code.
4. Confirm whether CBAR Decisions 14/2 (2024) and 20/1 (2021) are both in force, and whether 26/4 (2014) has been repealed.
5. Check the final status of the 2026 cybersecurity amendments to Law 460-IQ and of Art. 371-2.
