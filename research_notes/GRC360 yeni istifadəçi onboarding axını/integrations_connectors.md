# GRC integrations and connectors during customer onboarding: types, setup mechanics, security patterns, build vs buy

Scope: how GRC / compliance products connect to a new customer's systems and databases during onboarding, and how that is set up safely. Target reader: GRC360 product team (Spring Boot/Java 21, Next.js, PostgreSQL, multi-tenant SaaS and on-prem).
Research date: 2026-10-14. About 20 searches and fetches. Primary vendor docs were used where reachable. Pricing figures come from competitor blogs and are flagged as such.

## 1. Which integration categories do GRC tools offer, and which are set up first during onboarding?

### Takeaway
Compliance-automation vendors (Drata, Vanta, Secureframe, Sprinto) all centre onboarding on the same core categories: identity provider, cloud infrastructure, version control, ticketing, HRIS and device/endpoint. Drata's documented onboarding order is IdP first (it creates the personnel list and roles), then cloud, then version control, then ticketing, with HRIS as optional enrichment after the IdP.

### Cited Findings
- Drata's quick-start guide has customers connect integrations in this order: identity provider first, then infrastructure (cloud), then version control, then ticketing. On the IdP it says: "It is important to complete this connection first." — [Drata Quick Start Guide](https://help.drata.com/en/articles/13265650-quick-start-guide)
- Drata: "Drata uses your identity provider to establish your personnel list." Role assignment also depends on it: "You must connect your identity (IdP) connection before you can assign roles in Drata." — [Drata Quick Start Guide](https://help.drata.com/en/articles/13265650-quick-start-guide)
- Drata gives each category a purpose. Cloud "enables Drata to continuously monitor and collect evidence for dozens of security controls". Version control supplies change-management evidence. Ticketing is used "to automatically create and track remediation tasks when tests fail." — [Drata Quick Start Guide](https://help.drata.com/en/articles/13265650-quick-start-guide)
- HRIS is optional in Drata and comes after the IdP. It enriches the personnel records the IdP created ("This secondary integration is used to enrich the original personnel data pulled in from your IdP"). HRIS data is read-only and never modified by Drata. — [Drata: How Drata uses HRIS data](https://help.drata.com/en/articles/13344234-how-drata-uses-hris-data-new-experience); [Drata: populating personnel data](https://help.drata.com/en/articles/5308992-populating-and-managing-personnel-data-in-drata)
- Drata supports several IdP and HRIS connections at once, with a priority order that decides which source is authoritative for attributes such as name and email. Best practice is to "connect your IdPs and HRIS systems in the desired priority order." — [Drata: integrate multiple identity and HRIS connections](https://help.drata.com/en/articles/12194071-integrate-multiple-identity-and-hris-connections)
- Drata's onboarding then moves on to personnel: verifying employment status, collecting workstation configuration evidence (Classic: employees "Download and install the Drata Agent (if applicable)"), background-check providers, and policies approved before employees first log in. Customers who joined on or after Feb 24, 2026 get a "New Experience" UI. — [Drata Quick Start Guide](https://help.drata.com/en/articles/13265650-quick-start-guide)
- Secureframe's integration count varies by source: its help center says 300+ integrations, its website says 200+, and an older webinar says 100+. Its website categories include Human Resources, Device Management, Endpoint Security and Cloud Services. Integrations are prioritised by customer demand. Secureframe offers its own agent for customers without MDM, and says this is not a replacement for MDM. — [Secureframe Integrations list](https://support.secureframe.com/en/articles/15111624-secureframe-integrations-list); [Secureframe integrations page](https://secureframe.com/de-de/integrations)
- Sprinto says it integrates with cloud, identity, HR, device and ticketing platforms, and that integrations "can be added at any time" (IAM tools, infrastructure monitoring, code repositories, ticketing). Named HRMS examples include UKG Ready/Pro, Breathe, GreytHR, HR Cloud and HR Partner. — [Sprinto integrations](https://sprinto.com/integrations/); [Sprinto docs: People – how it works](https://docs.sprinto.com/data-library/people/how-it-works); [Sprinto HR Partner integration](https://docs.sprinto.com/integrations/overview/hr-partner-integration)
- Vanta's AWS connector bundles optional AWS sub-products: CodeCommit, IAM Identity Center and Amazon Inspector/Basic Scanning. "The products you enable here determine what permissions need to be granted in the policy." — [Vanta: Connecting AWS accounts](https://help.vanta.com/en/articles/11345630-connecting-vanta-aws-accounts)
- For systems with no native connector, Vanta offers "private integrations" through its Build Integrations API. Customers can define custom resources with their own schema and run custom tests on them. Vanta describes the older alternative, manual export and upload, as "time consuming and error prone". — [Vanta developer docs: integrations concepts](https://developer.vanta.com/docs/concepts/integrations); [Vanta: private integrations](https://www.vanta.com/resources/private-integrations)

### Inferences
- A good default onboarding order for GRC360 is: (1) IdP/SSO, which provides users, personnel and roles; (2) cloud provider, which provides assets and configuration evidence; (3) code repository; (4) ticketing for remediation; (5) HRIS to enrich and reconcile the personnel list; (6) MDM/endpoint or an agent; then (7) document stores and Slack/Teams. The order follows dependencies: personnel and roles drive control ownership, assignments and training.
- The category mix depends on the buyer. Compliance-automation tools (Vanta/Drata) emphasise cloud and code. Enterprise IRM buyers (GRC360's likely on-prem segment) are more likely to need CMDB/asset sources, vulnerability scanners and internal databases.
- Every vendor surveyed has a "bring your own data" route (private-integration API, CSV upload, custom resource). GRC360 should treat a generic import/push API plus CSV upload as part of the MVP, not an afterthought.

### Gaps
- I found no analyst (Gartner/Forrester) source ranking which integrations deliver the most onboarding value. The ordering above comes from vendor docs (Drata) only.
- I could not retrieve full Vanta or Secureframe onboarding checklists, published MDM lists (Jamf, Intune, Kandji), or the setup flows for document stores (SharePoint, Google Drive, Confluence) or Slack/Teams.

## 2. How does setup work technically? (OAuth, API keys, read-only IAM roles, service accounts, webhooks, scheduled sync, agents, JDBC, SFTP/CSV, generic REST)

### Takeaway
Cloud-to-SaaS connectors use read-only, customer-created credentials: an IAM role with an external ID (AWS), an OAuth app consent, or an API token. Data then arrives by scheduled pull or push. Systems behind a firewall are reached through an outbound-only agent (mutual TLS over port 443) or a mid-tier server that runs JDBC queries. Customer-defined push APIs and file uploads cover the long tail.

### Cited Findings
**AWS read-only cross-account role (Vanta example)**
- Setup options are Console, CloudFormation and Terraform. Account-level and Organization-level connections cannot be mixed within one workspace. — [Vanta: Connecting AWS accounts](https://help.vanta.com/en/articles/11345630-connecting-vanta-aws-accounts)
- Manual steps: (1) create a customer-managed policy `VantaAdditionalPermissions` from JSON Vanta provides; it must be customer-managed, not inline. (2) Create an IAM role with a "Custom trust policy" pasted from Vanta. (3) Attach the AWS-managed `SecurityAudit` policy plus `VantaAdditionalPermissions`; "Both these permissions are required." (4) Name the role `vanta-auditor` and paste its ARN into Vanta. (5) Choose which regions to scan. (6) Optionally set an Inspector severity threshold. (7) Add the role to S3 bucket policies where those exist. — [Vanta: Connecting AWS accounts](https://help.vanta.com/en/articles/11345630-connecting-vanta-aws-accounts)
- A third-party Cloud Posse Terraform module for Vanta uses an external ID in the trust policy against confused-deputy attacks. It describes SecurityAudit as broad read-only access and adds explicit denies on sensitive data such as RDS logs and DataPipeline. All calls show up in CloudTrail as AssumeRole. — [Cloud Posse: aws/vanta component](https://docs.cloudposse.com/components/library/aws/vanta/) (third-party; Vanta's own article does not describe the external ID)

**Unknown-system / long-tail mechanics**
- Vanta Build Integrations API: the integration authenticates via OAuth 2.0, computes the full current state of the resources it owns, and pushes it with `PUT /v1/resources/<type>` on a recurring cadence (e.g. hourly). It can read its own data back but cannot touch other tenant data or change settings. The same API also supports uploading file-based evidence. — [Vanta developer docs: Build integrations overview](https://developer.vanta.com/reference/build-integrations/overview)

**On-prem agents (outbound tunnel pattern)**
- Workato's on-prem agent runs inside the customer network and "only makes outbound connections to Workato" over TCP 443, so no inbound firewall ports are needed. The tunnel uses mutual TLS: the agent "validates the gateway certificate against an embedded trust store that trusts only Workato's private CA" and presents a client certificate issued at activation. TLS-inspecting proxies break it and must be bypassed for the gateway FQDNs. Agents can be grouped for HA/load balancing. — [Workato: Accessing on-prem](https://docs.workato.com/on-prem.html)
- Okta ships an "On-premises Connector for Generic Databases" for provisioning against JDBC databases behind the firewall. This shows that even IdPs use the agent pattern for database-backed apps. — [Okta: On-premises Connector for Generic Databases](https://help.okta.com/en-us/Content/Topics/Provisioning/opc/connectors/on-prem-connector-generic-db.htm) (title and existence only; details not fetched)

**Direct database connections (ServiceNow pattern)**
- ServiceNow import sets support a JDBC-type data source (System Import Sets > Administration > Data Sources) that names a MID Server and a database format (MySQL, Oracle, SQL Server). — [ServiceNow: Create a JDBC type data source](https://docs.servicenow.com/bundle/utah-integrate-applications/page/administer/import-sets/task/create-jdbc-type-data-source.html)
- The Integration Hub JDBC step "runs only on a ServiceNow MID Server with JDBC step capabilities" and needs an Integration Hub subscription. Allowed operations default to SELECT/INSERT/UPDATE/DELETE/SHOW/DESCRIBE and can be restricted with the `mid.property.jdbc_operations` property. Multiple SQL statements are disallowed, and the docs say input must be sanitised against SQL injection. Large results run asynchronously as a data stream, with a default 600 s timeout (max 7200 s). — [ServiceNow: JDBC step](https://www.servicenow.com/docs/r/integrate-applications/integration-hub/jdbc-step.html)

**SCIM user provisioning (standards)**
- SCIM 2.0 is defined by RFC 7643 (core schema: User, Group, EnterpriseUser extension) and RFC 7644 (protocol: REST endpoints `/Users`, `/Groups`, filtering, PATCH, bulk). — [RFC 7643](https://www.rfc-editor.org/rfc/rfc7643); [RFC 7644](https://www.rfc-editor.org/rfc/rfc7644)

### Inferences
- GRC360 should support a small set of connection mechanisms rather than one per vendor:
  - (a) OAuth 2.0 authorization-code consent for SaaS APIs (Google Workspace, Microsoft Graph/Entra, Jira, Slack, GitHub).
  - (b) API token or client-credential entry for APIs without OAuth.
  - (c) AWS cross-account role with a vendor-generated external ID, deployed by a CloudFormation or Terraform template; the Azure/GCP equivalents are app registration / service principal with Reader roles and Workload Identity Federation (not researched here).
  - (d) Inbound SCIM 2.0 server so IdPs can push users. Spring has SCIM libraries; Okta and Entra both act as SCIM clients.
  - (e) Push API plus CSV/SFTP import for the long tail.
  - (f) For on-prem/firewalled systems and direct database access, an outbound-only agent (Java) using mutual TLS over 443 that runs allowlisted, read-only SELECT queries or views via JDBC.
- In on-prem deployments GRC360 sits inside the customer network, so the agent is unnecessary there. Direct JDBC from the GRC360 server to the customer's database (read-only user, views) becomes the simplest route.
- ServiceNow's JDBC controls (operation allowlist, single statement, async with timeout) are a reasonable template for GRC360's own query connector. GRC360 should go further and allow SELECT only.

### Gaps
- I did not verify Azure (Lighthouse / service principal Reader) or GCP (service account / Workload Identity Federation) read-only patterns from primary docs.
- I found no primary source on webhook vs. polling choices by Vanta/Drata, or on their sync frequencies, apart from Vanta's "e.g. hourly" push cadence.
- I did not research SFTP/CSV file-drop conventions in GRC tools.

## 3. How do enterprise GRC platforms (ServiceNow IRM, Archer, MetricStream, OneTrust, LogicGate) integrate with customer databases and on-prem systems?

### Takeaway
Enterprise IRM platforms rely on generic data-feed / ETL machinery rather than turnkey connectors. ServiceNow uses MID Servers (an on-prem agent), JDBC data sources and Integration Hub. Archer uses its Data Feed Manager with database-query, file and JavaScript (REST) transporters. For SaaS deployments they need a customer-side server to reach internal systems.

### Cited Findings
- ServiceNow: JDBC import data sources and the Integration Hub JDBC step both run through an on-prem MID Server (details in section 2). — [ServiceNow: JDBC step](https://www.servicenow.com/docs/r/integrate-applications/integration-hub/jdbc-step.html); [ServiceNow: Create JDBC data source](https://docs.servicenow.com/bundle/utah-integrate-applications/page/administer/import-sets/task/create-jdbc-type-data-source.html)
- Archer's Data Feed Manager course covers Archer-to-Archer, Database, File (including attachments) and RSS data feeds. It is self-paced and about 8 hours long, which suggests feed configuration is specialist work. — [Archer Data Feed Manager course](https://community.archerirm.com/hc/en-us/articles/52147209194131-Archer-Data-Feed-Manager)
- Archer's SaaS migration questionnaire lists "Database Query Transport (SQL, et al)" as a data-feed transport type. — [Archer SaaS Migration Questionnaire](https://community.archerirm.com/hc/en-us/article_attachments/52612280713107)
- Archer's JavaScript Transporter makes web requests with native XML/JSON parsing and can chain dependent API calls, removing the need for custom middleware. Release 6.6 added an application-managed output writer to work around the JS engine's memory limits (268 MB for strings, 2 GB for binary). — [Archer blog: JavaScript transporter memory constraints](https://isyzh67588.lithium.com/t5/archer-blogs/escaping-javascript-transporter-memory-constraints-with-the-new/ba-p/520602)
- An Archer community thread says on-premises feed configuration is straightforward, but for SaaS "you'll need to stand up a server internally" to reach internal sources. — [Archer community: trigger datafeed](https://isyzh67588.lithium.com/t5/archer-custom-objects-forum/trigger-datafeed-using-custom-object-button/m-p/716244)
- A third-party example of the OneTrust pattern: IBM Guardium Discover & Classify sends DSAR findings into OneTrust through a Docker-hosted component that calls OneTrust's API with OAuth client credentials and scopes. In other words, the customer-side tool pushes into the GRC SaaS. — [IBM Guardium + OneTrust integration PDF](https://www.ibm.com/support/pages/system/files/inline-files/IBM_Guardium_Discover_and_Classify-V4.2.2-Integrations-IGDC_and_OneTrust_Integration.pdf)

### Inferences
- There are two archetypes. (1) Compliance automation (Vanta/Drata): many turnkey, opinionated, read-only SaaS connectors with a self-serve UI. (2) Enterprise IRM (ServiceNow/Archer): generic feed engine plus on-prem agent plus specialist configuration. GRC360, which is multi-tenant SaaS and also on-prem, fits between them. Turnkey connectors suit the top categories; a generic feed (JDBC query, REST/JS mapping, file) plus an agent suits the long tail and on-prem estates.
- Feed engines need field mapping, key matching (update vs. insert), scheduling and error reports. Archer's long training course is evidence that a usable mapping UI is a differentiator.

### Gaps
- I found no reachable primary docs for MetricStream, LogicGate or OneTrust on how they connect to customer databases or on-prem systems (agents, integration hubs). OneTrust's own on-prem discovery agent was not confirmed.
- I did not retrieve ServiceNow IRM-specific integrations (e.g. GRC indicators fed from CMDB or vulnerability response). Only the generic platform mechanics are documented here.

## 4. Security best practice: least privilege, credential storage and encryption, rotation, tenant isolation, audit logs, data minimisation, auditor expectations

### Takeaway
Use the narrowest read-only scopes, keep connector secrets in a central vault or KMS with envelope encryption (never next to the data), prefer short-lived or dynamic credentials and automate rotation, log every secret access tamper-evidently, and isolate tenants explicitly. For AWS this means a unique external ID per tenant, validated on the backend, which many vendors get wrong.

### Cited Findings
**Secrets management (OWASP)**
- Centralise and standardise secret storage. Apply least privilege per secret: "Secrets must have the minimum privileges assigned to them to enable their required use/role." — [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- Automate rotation ("It is therefore better to automate the rotation of keys"). Rotate regularly "so that any stolen credentials will only work for a short time." Use dynamic, short-lived secrets "where possible." — [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- Envelope encryption: KMS protects a data key, and "The data key, in turn, encrypts the secret." "You should not store keys next to the secrets they encrypt." BYOK is complex and not generally recommended unless the threat model requires it. — [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- Audit logs must resist tampering and deletion. At minimum they record who requested which secret, for what system and role, whether it was approved, and when it was used. Monitor "who/what, from which IP" accesses secrets. Secrets must be revocable, and attempts to use revoked secrets logged. Incident response starts with immediate revocation. — [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- A third-party design explainer recommends per-tenant keys: rotate a tenant master key by re-wrapping data keys (lazily on read or in a background job), and cache unwrapped data keys briefly to limit KMS calls. — [DesignGurus: tenant-aware encryption](https://www.designgurus.io/answers/detail/how-would-you-implement-tenantaware-encryption-envelope-encryption-byok) (secondary source)

**Cross-account cloud access (confused deputy)**
- AWS: the external ID's "primary function" is to prevent the confused-deputy problem. The trust policy should condition on `sts:ExternalId`. — [AWS IAM: The confused deputy problem](https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html); [AWS APN blog: external ID](https://aws.amazon.com/blogs/apn/securely-using-external-id-for-accessing-aws-accounts-owned-by-others/)
- External IDs are not passwords and need not be secret. What matters is that the vendor generates them, so a customer cannot choose another tenant's value. — [NCC Group: Demystifying AssumeRole and sts:ExternalId](https://www.nccgroup.com/research/demystifying-aws-assumerole-and-stsexternalid/)
- Datadog's guidance for SaaS vendors:
  - Generate "a random, customer-specific external ID" and store it in a secrets manager.
  - Assume customer roles from a dedicated bastion account, with an outbound integration role per region.
  - Check that the customer role actually enforces the external ID (if it can be assumed without one, "the role is vulnerable"), and flag overprivileged policies such as AdministratorAccess. Repeat these checks on a schedule.
  - "Minimize and document permissions" and "Avoid the use of AWS managed policies."
  - Use STS session policies to scope credentials per microservice.
  - Monitor AssumeRole events in CloudTrail and watch for unusual session names. Publish vendor IP ranges.
  - Block new integrations for AWS accounts already linked by another tenant.

  — [Datadog Security Labs: Securely integrating with customers' AWS accounts](https://securitylabs.datadoghq.com/articles/securely-integrating-with-customers-aws-accounts/)
- Praetorian, as cited in a search summary: 37% of vendors had not implemented ExternalId correctly, and another 15% had a correct UI but no backend validation. — via search summary of [AWS APN blog / related research](https://aws.amazon.com/blogs/apn/securely-using-external-id-for-accessing-aws-accounts-owned-by-others/) (original Praetorian source not fetched; treat as indicative)
- Note the tension: Vanta's documented setup attaches the AWS-managed SecurityAudit policy, while Datadog advises avoiding AWS managed policies as typically overprivileged. — [Vanta](https://help.vanta.com/en/articles/11345630-connecting-vanta-aws-accounts) vs [Datadog Security Labs](https://securitylabs.datadoghq.com/articles/securely-integrating-with-customers-aws-accounts/)

**Data minimisation and read-only scoping (vendor practice)**
- Vanta lets customers deselect regions ("Vanta will not pull in any resources within that region") and enable only the AWS products they need, which shrinks the policy. The Cloud Posse module adds explicit denies on sensitive data such as RDS logs. Drata states HRIS data is read-only. — [Vanta](https://help.vanta.com/en/articles/11345630-connecting-vanta-aws-accounts); [Cloud Posse](https://docs.cloudposse.com/components/library/aws/vanta/); [Drata HRIS](https://help.drata.com/en/articles/13344234-how-drata-uses-hris-data-new-experience)
- ServiceNow's MID Server can restrict JDBC operations with a property, and its docs require input sanitisation against SQL injection. — [ServiceNow JDBC step](https://www.servicenow.com/docs/r/integrate-applications/integration-hub/jdbc-step.html)
- Workato's agent uses mutual TLS with a pinned private CA and outbound-only connections. — [Workato on-prem](https://docs.workato.com/on-prem.html)

### Inferences
Concrete GRC360 controls drawn from the sources above:
- Store connector credentials in a `connector_credentials` table that holds only ciphertext. Use envelope encryption with a per-tenant data key wrapped by a KMS or Vault Transit key. On-prem deployments use a customer-supplied KMS/HSM or Vault; a local master key is the last resort.
- Enforce tenant isolation in the connector runtime: every job carries `tenant_id`, credentials are only decryptable in that tenant's context, PostgreSQL row-level security applies, and a cloud account or IdP tenant ID cannot be linked by two tenants.
- Prefer OAuth refresh tokens and STS-assumed roles over long-lived keys. Track credential age and expiry and warn before expiry.
- For JDBC: require a dedicated read-only database user, recommend views over base tables, run SELECT only, allow a single statement, enforce timeouts and row caps, use parameterised queries, and require TLS to the database.
- Show a "permissions requested" screen before each connection, so the customer can see the data-minimisation choices.
- Write an append-only audit log of connector create, edit, credential view, rotation, sync run and failure events. This is also evidence the customer's own auditors can use.
- What auditors expect is inferred from OWASP plus SOC 2/ISO 27001 norms: least-privilege service accounts, documented scopes, encrypted secrets, rotation, and access logging.

### Gaps
- I did not fetch primary NIST guidance (SP 800-57 key management, SP 800-53 IA-5/SC-12/SC-28). Auditor expectations are inferred, not sourced.
- I did not confirm the original Praetorian study.
- I found no source describing how Vanta or Drata isolate tenants inside their connector runtime.

## 5. Build vs buy: unified-API / embedded-iPaaS vendors and open-source options; costs and trade-offs

### Takeaway
Unified APIs (Merge, Apideck, Unified.to, Truto) speed up commodity categories like HRIS and ticketing, but they are priced per connection and leave long-tail gaps. A GRC vendor (Sprinto) went to a second provider when its first unified API lacked a customer's HRIS. Open-source, source-available options (Nango for auth and sync, Airbyte for ELT) can be self-hosted, which matters for GRC360's on-prem deployments, but their licences restrict resale as a hosted service.

### Cited Findings
- Merge prices per linked account (one customer × one integration). Per competitor blogs, the self-serve Launch plan is free for the first 3 production linked accounts, then $650/month for up to 10, plus about $65 per additional account. That works out to roughly $3,250/month at 50 accounts and $13,000/month at 200. Enterprise is contract-based: one estimate is a $30–55K platform fee plus about $65 per account, and an AWS Marketplace bundle of $25K/12 months for 20 accounts is cited. — [Knit: Understanding Merge.dev pricing](https://getknit.dev/blog/understanding-merge-dev-pricing-finding-the-right-unified-api-for-your-integration-needs); [Truto: Merge drawbacks 2026](https://truto.one/blog/what-are-the-drawbacks-and-limitations-of-mergedev-2026-guide/) (competitor sources; not verified on Merge's site)
- Apideck is reportedly priced per consumer (end customer, any number of integrations) at about $13–24 per consumer per month. Unified.to is usage-priced with unlimited customer connections on every plan. — [Truto: cheapest unified API 2026](https://www.truto.one/blog/what-is-the-cheapest-unified-api-platform-2026-pricing-breakdown); [Unified.to: Merge vs Unified 2026](https://unified.to/blog/merge_vs_unified_a_2026_comparison_for_saas_and_ai_teams) (vendor/competitor sources)
- Sprinto case (written by Truto, the vendor that won the business): Sprinto already used an unnamed "leading unified API provider" for HRIS, but a 400+ employee customer's HRIS (PrimePay) was not supported ("The specific HRIS that they're using was not already available with us"). The roadmap was too slow, so Sprinto used Truto for that integration (Sept 2025). — [Truto: Why Sprinto opted for Truto](https://www.truto.one/blog/why-sprinto-opted-for-truto-despite-already-using-a-leading-unified-api) (promotional)
- Nango is under the Elastic License (ELv2). It can be self-hosted for free with a limited feature set ("self-host OAuth for 190+ APIs for free"). Cloud and Enterprise Self-Hosted unlock all features. A secondary source lists Starter from $50/month and Growth from $500/month, metered on connections, proxy requests, function runs and storage. Sources disagree on the API count (190+ self-hosted OAuth vs 700–900+ catalogue). — [Nango GitHub](https://github.com/nangohq/nango); [Nango pricing](https://www.nango.dev/pricing); [rywalker.com Nango summary](https://rywalker.com/research/nango) (secondary)
- Airbyte's licence FAQ: Core is ELv2, while connectors and the CDK are MIT. "Anyone can use Airbyte, free of charge… on your infrastructure." Airbyte's own "why open source" page instead groups connectors and core under ELv2, so the two pages conflict. The Connector Builder and low-code CDK define API connectors as YAML manifests. — [Airbyte license FAQ](https://airbyte.com/license-faq); [Airbyte: why open source](https://airbyte.com/why-open-source) (conflict noted)
- Workato's embedded/on-prem agent architecture is described in section 2. — [Workato on-prem](https://docs.workato.com/on-prem.html)

### Inferences
- Under per-linked-account pricing, GRC360's cost per tenant grows with the number of connected systems (IdP + HRIS + ticketing ≈ 3 linked accounts per tenant). Model this against GRC360's price per tenant before committing.
- Unified APIs mostly cover HRIS, ATS, ticketing, CRM, file storage and accounting. They generally do not cover deep cloud-security posture data (AWS/Azure/GCP configuration), which every compliance vendor appears to build itself.
- On-prem customers usually cannot let data go through a third-party SaaS unified API. That favours either self-hostable components (Nango ELv2, Airbyte connectors) or in-house Java connectors. Check ELv2's restriction on offering the software as a managed service with legal before embedding it in GRC360's SaaS.
- A pragmatic split for GRC360:
  - Build natively: IdP (Entra ID / Okta / Google via Microsoft Graph, Okta API, Google Admin SDK, plus a SCIM 2.0 server), AWS/Azure/GCP read-only, Jira, and the generic JDBC/CSV/REST feed plus agent.
  - Consider a unified API (or Nango for OAuth plumbing) for the HRIS long tail (BambooHR, Workday, Personio, regional HRIS).

### Gaps
- I did not retrieve Paragon, Apideck or Workato Embedded pricing or capability docs directly, and I have no official Merge price page.
- I found no data on what share of integrations GRC vendors build in-house vs. buy.

## 6. Which integrations deliver the most onboarding value first (vendor/analyst view)?

### Takeaway
Vendor documentation consistently puts the identity provider first, because it seeds personnel, roles and access reviews. Cloud infrastructure comes next as the main source of automated control evidence, then version control and ticketing. HRIS is positioned as secondary enrichment. I found no analyst ranking.

### Cited Findings
- Drata: IdP first ("It is important to complete this connection first"), then cloud ("continuously monitor and collect evidence for dozens of security controls"), then version control, then ticketing. HRIS is optional, after the IdP. — [Drata Quick Start Guide](https://help.drata.com/en/articles/13265650-quick-start-guide)
- Drata: HRIS validates and enriches the IdP personnel list. It does not create it. — [Drata HRIS](https://help.drata.com/en/articles/13344234-how-drata-uses-hris-data-new-experience)
- Secureframe prioritises building new integrations by customer demand, and offers an agent where customers lack MDM. — [Secureframe Integrations list](https://support.secureframe.com/en/articles/15111624-secureframe-integrations-list)
- An HRIS gap can block a mid-market customer from becoming "audit-ready" (Sprinto/PrimePay case, promotional source). — [Truto blog](https://www.truto.one/blog/why-sprinto-opted-for-truto-despite-already-using-a-leading-unified-api)

### Inferences
- First-wave connectors for GRC360:
  - Microsoft Entra ID, Google Workspace and Okta (users, groups, MFA status; SSO via SAML/OIDC; SCIM provisioning).
  - AWS, then Azure, then GCP (asset inventory and configuration evidence).
  - Jira, plus ServiceNow for enterprise (remediation tickets).
  - CSV/Excel import for assets, risks and personnel. This lets onboarding progress even when no API exists.
- Second wave: HRIS (BambooHR, Personio, Workday), GitHub/GitLab, MDM (Intune, Jamf), vulnerability scanners, and document stores (SharePoint, Google Drive, Confluence) for policy evidence.
- Onboarding UX pattern (from Drata): show a checklist ordered by dependency, explain why each step matters ("establishes your personnel list"), let customers skip optional steps, and make it easy to add integrations later.

### Gaps
- I found no Gartner, Forrester or IDC data on onboarding time-to-value by integration type.
- I found no quantitative data (e.g. % of controls automated per integration) from any vendor.
