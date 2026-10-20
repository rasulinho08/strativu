# AI-native GenAI data protection / AI usage security vendors (Harmonic, LayerX, Prompt Security, Lasso, Aim, WitnessAI, Nightfall)

Research date: 2026-10-20. Scope: competitor profile for "cipher" (endpoint agent + browser extension + gateway, rules/regex only, no ML). Most technical detail is vendor marketing or competitor-written comparisons. Independent technical teardowns (Chrome Web Store permission lists, reverse engineering) were **not found** for any vendor. Treat capability claims as vendor-stated unless marked otherwise.

**Corporate status snapshot (late 2026)**
| Vendor | Status Oct 2026 | Current product name |
|---|---|---|
| Harmonic Security | Independent; $50M Series B on 14 Oct 2026 | Harmonic (Guide, MCP Gateway) |
| LayerX | Acquired by Akamai (~$205M, closed 2 Jul 2026) | Akamai Workforce Protector |
| Prompt Security | Acquired by SentinelOne (~$180M, closed Sep 2025) | Singularity modules: AI Usage Control, Agentic AI Security, AI Application Security |
| Lasso Security | Independent; $30M round Sep 2026 | Lasso (employees ext., MCP Gateway, LEAP/RAPID guardrails) |
| Aim Security | Acquired by Cato Networks (~$350M reported, Sep 2025) | Cato AI Security (AISEC) |
| WitnessAI | Independent; $58M Jan 2026 | WitnessAI (Observe/Protect/Control) |
| Nightfall AI | Independent; last known round $40M Series B (Aug 2022) | Nightfall (Foundation / Premier editions) |

---

## 1. What each product does and which channels it covers (browser, desktop AI apps, IDE/coding assistants, API/LLM gateway, MCP/agents, SaaS)

### Takeaway
All seven have moved past browser-only coverage toward "browser + endpoint + MCP/agents". Harmonic, Prompt Security and Nightfall claim the widest employee-side coverage (browser, desktop AI apps, IDE/CLI coding assistants, MCP). LayerX/Akamai stays browser-centred. WitnessAI and Cato/Aim cover traffic at the network or SASE layer. Lasso leans toward AppSec, agents and MCP.

### Cited Findings
**Harmonic Security**
- Three-part product: browser extension, endpoint agent and a local MCP Gateway. The browser extension covers "ChatGPT, Gemini, Perplexity and 1,000+ AI surfaces" — [Harmonic Guide](https://www.harmonic.security/products/guide); [Harmonic browser page](https://www.harmonic.security/solutions/browser-based-genai-security)
- Claimed channels: browser chatbots; desktop AI apps (Claude CoWork, Cursor, ChatGPT Desktop); ChatGPT/Codex across web, desktop and CLI; command-line tools, IDEs and AI APIs (e.g. calls to the OpenAI API from scripts); and agentic workflows over MCP — [Harmonic Guide](https://www.harmonic.security/products/guide)
- The MCP Gateway "transparently intercepts all MCP traffic", shows which clients and servers are in use, blocks risky actions, and logs every client↔server interaction for audit. It runs on Windows, macOS and Linux — [Harmonic MCP Gateway](https://www.harmonic.security/products/mcp-gateway); [Harmonic Guide](https://www.harmonic.security/products/guide)
- The browser extension also identifies the AI account type (corporate vs personal) and subscription plan, and finds AI embedded in approved web apps — [Harmonic browser page](https://www.harmonic.security/solutions/browser-based-genai-security)

**LayerX → Akamai Workforce Protector**
- Controls prompts, responses, agent actions and data exchanges across AI, SaaS, web and "desktop apps". Its DLP covers text input, copy/paste, uploads and downloads — [Akamai Workforce Protector](https://www.akamai.com/products/akamai-workforce-protector)
- "Desktop app" coverage means PWA-enabled desktop apps (Microsoft 365, Outlook, Slack, Teams, VS Code), not native thick clients. It also covers agentic browsers (ChatGPT Atlas, Perplexity Comet, Dia) and the AI side panel. The page does not mention MCP — [Akamai Workforce Protector](https://www.akamai.com/products/akamai-workforce-protector)
- Other features: SaaS DLP, shadow SaaS discovery and malicious-extension detection (ExtensionPedia) — [LayerX funding PR](https://layerxsecurity.com/blog/layerx-security-extends-series-a-funding-to-37m-to-power-next-gen-enterprise-browser-security-challenges-sse-solutions-and-enterprise-browsers/); [Akamai Workforce Protector](https://www.akamai.com/products/akamai-workforce-protector)

**Prompt Security (SentinelOne)**
- Covers browsers, desktop IDEs, terminal-based coding assistants, APIs and custom workflows. Its MCP Gateway sits between AI apps and "more than 13,000 known MCP servers" — [SentinelOne blog](https://www.sentinelone.com/blog/a-new-chapter-for-ai-and-cybersecurity-sentinelone-acquires-prompt-security/)
- Coding assistant coverage includes GitHub Copilot, Cursor and Claude Code. An API integration screens homegrown LLM apps. SentinelOne claims 15,000+ governed AI tools — [AppSecSanta](https://appsecsanta.com/prompt-security)
- Now sold as three Singularity modules: AI Usage Control, Agentic AI Security and AI Application Security — [AppSecSanta](https://appsecsanta.com/prompt-security)

**Lasso Security**
- "Lasso for Employees" is a browser extension that inspects prompts and uploads on web AI apps. Lasso also has an API gateway/SDK for runtime protection of agents and apps, and an open-source MCP Gateway (April 2025) — [Aurascape comparison (competitor)](https://aurascape.ai/answers/aurascape-vs-lasso-security-comparison/); [Yahoo/PR](https://finance.yahoo.com/news/lasso-releases-first-open-source-110000349.html)
- Per a competitor, the browser extension does not cover non-browser clients such as Claude Code, CLI tools or IDEs — [Aurascape (competitor)](https://aurascape.ai/answers/aurascape-vs-lasso-security-comparison/)
- The "Deputy" gateway inspects LLM and MCP traffic in real time, and a Classify/Threat Detection API scores prompts and completions — [API Evangelist profile](https://github.com/api-evangelist/lasso-security)
- Sep 2026 launches: LEAP, a CPU-only guardrail, and RAPID, a self-hosted engine that judges inputs against plain-language policies — [Raising.fi](https://raising.fi/news/lasso-security-undisclosed-september-2026)

**Aim Security → Cato AI Security**
- Aim had three use cases: employee use of public AI apps, private AI apps and agents, and the agentic AI development lifecycle. Aim researchers found EchoLeak (CVE-2025-32711, a zero-click flaw in M365 Copilot) — [SecurityWeek](https://www.securityweek.com/cato-networks-acquires-ai-security-firm-aim-security/)
- As of Sep 2026 Cato markets AI Security for End Users, AI Security for Applications (an AI firewall) and Agentic AI Security (MCP server discovery and agent tool-call profiling through the SASE cloud). aim.security has redirected to catonetworks.com since July 2026 — [Aona comparison (competitor)](https://aona.ai/resources/comparisons/aona-vs-aim-security/)
- Cato's 3 Aug 2026 update added "AI Security Access Control with User Access Policy" for users of the AI Security Browser Plugin — [Cato KB, Aug 3 2026](https://knowledge.catonetworks.com/docs/product-updates-aug-3-2026)

**WitnessAI**
- Discover/Protect/Control/Analyze platform. It catalogs 3,000+ AI apps and claims network-level visibility "including thick clients like Windows 11 Copilot and Office 365 without relying on browser extensions or agents." It also intercepts developer prompts from GitHub Copilot and Cursor — [WitnessAI datasheet PDF](https://witness.ai/wp-content/uploads/2025/05/WIT-Secure-AI-Enablement-Platform-OP.pdf)
- Covers employees, models, apps, agents and MCP servers. It includes a bidirectional "AI Firewall" for customer-facing chatbots — [AppSecSanta](https://appsecsanta.com/witnessai)

**Nightfall AI**
- Foundation Edition covers SaaS (API-based, 12 apps including Google Drive, Slack, GitHub, Jira, Confluence, Salesforce, M365, Notion and ChatGPT Enterprise), email, GenAI apps, browsers and endpoints — [Nightfall pricing](https://www.nightfall.ai/pricing)
- Endpoint coverage: file uploads, clipboard paste, USB, printing, git push and CLI activity, with personal vs corporate session differentiation — [Nightfall pricing](https://www.nightfall.ai/pricing)
- Premier Edition adds hooks for Cursor, Claude Code (IDE and CLI) and VS Code on macOS and Windows. These scan and block prompts, MCP tool calls, tool responses and shell commands; LLM responses are monitor-only. It also adds local stdio and remote HTTP/SSE MCP discovery, an OpenTelemetry audit trail for Claude Cowork/Code, and Claude Compliance API monitoring for Claude Enterprise — [Nightfall pricing](https://www.nightfall.ai/pricing)
- Supported GenAI apps include ChatGPT, Claude, Copilot, Gemini, DeepSeek, Perplexity and Grok — [Nightfall shadow AI page](https://www.nightfall.ai/solutions/prevent-data-leakage-to-shadow-ai)

### Inferences
- "Coding-agent hooks" are now table stakes at the high end: Nightfall, Harmonic and Prompt Security all claim them. Nightfall's choice to hook Claude Code/Cursor/VS Code natively (not via TLS interception) is a cheap, regex-compatible pattern cipher could copy.
- Nightfall and Harmonic both monitor the Claude Compliance API, and Harmonic is reported to do the same ([FourWeekMBA](https://fourweekmba.com/ai-harmonic-security-raises-50m-taps-claude-compliance-api/)). Vendor-provided enterprise APIs are becoming a second channel alongside inline interception.

### Gaps
- No public, independent test of which desktop AI apps (native ChatGPT/Claude/Copilot clients) each endpoint agent actually intercepts inline versus only logs. Harmonic says inline controls apply only "where the application and deployment method support them."
- Whether Lasso has an IDE plugin or endpoint agent: not found.

---

## 2. Form factor and deployment (extension/MV3/browsers, endpoint agent, proxy/SASE, API gateway, SDK; MDM/GPO force-install)

### Takeaway
Three architecture camps:
- **Extension-first (+ optional agent):** Harmonic, LayerX/Akamai, Prompt, Lasso, Nightfall.
- **Network/SASE-only:** WitnessAI via SSE connectors; Cato/Aim via Cato PoPs. Cato/Aim now also has a browser plugin.
- **Hybrid:** Nightfall (extension + kernel/system-extension agent + SaaS APIs + IDE hooks).

All deploy extensions by MDM or GPO force-install. Safari is consistently the weak spot.

### Cited Findings
- **Harmonic:** Supported browsers are Chrome, Edge, Firefox, Safari, Chromium variants (Arc, Brave, Vivaldi, Island, Genspark), Firefox-based Zen and AI browsers (Comet, Dia) — [Harmonic browser page](https://www.harmonic.security/solutions/browser-based-genai-security). It deploys via Intune, Jamf, Kandji or Group Policy with "no proxy redesign or certificate changes" — [Harmonic Guide](https://www.harmonic.security/products/guide). A reviewer describes a "lightweight end-user agent" whose footprint is "smaller than traditional DLP, but not zero" — [aisecurityplatform.com review](https://aisecurityplatform.com/reviews/harmonic/)
- **LayerX/Akamai:** A lightweight browser extension "without proxies, traffic rerouting, or network changes". It supports Chrome, Edge, Firefox and Safari on Windows/macOS/Linux, with deployment on iOS/Android, and works on managed and BYOD devices. It integrates with IdP, SIEM, MDM, Google Workspace/Chrome and Intel vPro — [Akamai Workforce Protector](https://www.akamai.com/products/akamai-workforce-protector). Distribution is via GPO, any device management platform or the browser's management console, and it integrates directly into the Chrome Enterprise console — [Bleeping Computer sponsored](https://www.bleepingcomputer.com/news/security/layerx-enterprise-browser-security-extension-secure-the-modern-workspace/); [LayerX + Google](https://layerxsecurity.com/?p=4657)
- **Prompt Security:** A "lightweight agent and browser extensions" — [SentinelOne blog](https://www.sentinelone.com/blog/a-new-chapter-for-ai-and-cybersecurity-sentinelone-acquires-prompt-security/). Sources **conflict** on the endpoint agent. AppSecSanta says "no standalone endpoint agent is described" ([AppSecSanta](https://appsecsanta.com/prompt-security)). Nightfall's competitor review says a separate endpoint agent covers local, desktop, terminal and agentic activity ([Nightfall review of Prompt](https://www.nightfall.ai/blog/prompt-security-reviews)). It is sold as SaaS in SentinelOne Singularity; on-prem existed before the acquisition and its current status is unclear — [AppSecSanta](https://appsecsanta.com/prompt-security)
- **Lasso:** Browser extension for employees. The MCP Gateway is open source (MIT, Python), plugin-based, and proxies MCP servers — [Lasso GitHub releases](https://github.com/lasso-security/mcp-gateway/releases); [druce.ai profile](https://druce.ai/governance/wiki/vendors/lasso-security). Also offers an API gateway/SDK — [Aurascape (competitor)](https://aurascape.ai/answers/aurascape-vs-lasso-security-comparison/)
- **Cato/Aim:** Inspection runs in the Cato SASE cloud after the prompt leaves the device. Traffic must be steered via the Cato Client, a site connection, or the Cato browser extension, so devices outside that path are not covered — [Aona (competitor)](https://aona.ai/resources/comparisons/aona-vs-aim-security/). Cato's AI Security page says it monitors prompts and responses inline "using APIs or with a browser extension" — [Cato AISEC](https://www.catonetworks.com/platform/ai-security-aisec/) (as quoted in search; page body did not render). The base Cato Browser Extension is GA and included in Cato ZTNA user licensing — [Cato news](https://www.catonetworks.com/news/cato-extends-zero-trust-access-to-any-device-with-new-browser-extension/)
- **WitnessAI:** No agents or browser extensions. Its network connectors cover Zscaler, Palo Alto Networks, Netskope, Fortinet and F5. "Witness Anywhere" covers remote workers "without agents", and there is an API integration — [WitnessAI datasheet](https://witness.ai/wp-content/uploads/2025/05/WIT-Secure-AI-Enablement-Platform-OP.pdf). It runs single-tenant with customer-key encryption and regional sandboxes — [datasheet](https://witness.ai/wp-content/uploads/2025/05/WIT-Secure-AI-Enablement-Platform-OP.pdf); [AppSecSanta](https://appsecsanta.com/witnessai)
- **Nightfall:** A browser plugin plus a separate endpoint agent for macOS and Windows. The plugin deploys via Google Workspace or MDM; the agent via MDM in about 30 minutes — [Nightfall browser DLP blog](https://www.nightfall.ai/blog/browser-dlp-solutions). Supported macOS MDMs: Jamf, JumpCloud, Iru (Kandji), Mosyle and Workspace ONE. A "stealth mode" hides the UI — [Nightfall Mac install](https://help.nightfall.ai/data-exfiltration-prevention/exfiltration_endpoint/installation_mac). Extensions are force-installed via Google Workspace policy (Chrome) or MDM payloads (others), but **Safari is manual install only** — [Nightfall endpoint status](https://help.nightfall.ai/data-exfiltration-prevention/exfiltration_endpoint/endpoints-installation-status). AWS Marketplace terms include 2 devices per user — [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-mui6ld62t4ub6)

### Inferences
- Safari force-install is a shared pain point; Nightfall documents it explicitly. A cipher endpoint agent with a network-layer fallback for Safari would be a differentiator.
- WitnessAI and Cato need an existing SSE/SASE stack plus TLS decryption, which is a high bar for small and mid-sized buyers. Agent and extension products avoid "certificate changes". Harmonic markets this explicitly.

### Gaps
- Manifest V3 confirmation and the exact Chrome Web Store permission lists (e.g. `<all_urls>`, `scripting`, `nativeMessaging`, `clipboardRead`, `webRequest`) could not be retrieved for any vendor. Recommend pulling the CRX/manifest directly from the Chrome Web Store IDs.
- Prompt Security's supported browsers are not stated publicly in the sources found.

---

## 3. Technical hooking mechanisms (DOM/paste/upload interception, native messaging, local proxy, TLS interception, clipboard, kernel components)

### Takeaway
Public detail is thin. Nightfall's help centre gives the most concrete endpoint architecture. Network vendors depend on TLS-inspecting SSE partners or SASE PoPs.

| Vendor | Documented hook point |
|---|---|
| Nightfall | Kernel/system driver, macOS Endpoint Security system extension, user-space agent, Accessibility API for clipboard, extension↔agent link |
| Harmonic | Paste-time warnings in the extension; a local MCP proxy |
| Prompt Security | DOM analysis plus user-action hooks (typing, paste, click, upload) |
| LayerX | In-page interception of text input, paste and upload ("Deep Session Analysis") |
| WitnessAI | Network connectors on SSE/NGFW stacks |
| Cato/Aim | SASE PoP inspection |

### Cited Findings
- **Nightfall (most detailed):**
  - macOS needs Full Disk Access (to scan files outside home), Screen Recording (for screen-based exfiltration detection) and Accessibility (for "thick-app and clipboard monitoring").
  - Components: a user-space agent that must reach a system extension containing an Endpoint Security client (error "ES Client Unauthorized"), a "kernel or system driver" (errors "Driver Missing" and "Driver Not Loaded"), an agent service, and a browser extension that reports "Browser Extension Not Connected".
  - On Windows, extension verification uses an on-disk scan (since v1.4.22). Agent v1.4.35.x added Atlas browser support on Windows.
  - [Nightfall endpoint status](https://help.nightfall.ai/data-exfiltration-prevention/exfiltration_endpoint/endpoints-installation-status)
- Nightfall: Network Extensions are required for web/cloud DLP enforcement on macOS. This was reported in a search summary of the same help page but was **not visible** in the fetched version, so it is unconfirmed — [Nightfall endpoint status](https://help.nightfall.ai/data-exfiltration-prevention/exfiltration_endpoint/endpoints-installation-status). Clipboard paste monitoring shipped by April 2025 — [Nightfall April 2025 update](https://nightfall.ai/blog/nightfall-product-updates-news-april-2025)
- **Prompt Security:** The extension detects GenAI use "through DOM analysis and user actions such as typing, pasting, clicking, and file uploads" — [AppSecSanta](https://appsecsanta.com/prompt-security)
- **Harmonic:** The extension "warns users as they paste sensitive data"; the prompt "is intercepted and the user sees what was flagged and why" — [Harmonic browser page](https://www.harmonic.security/solutions/browser-based-genai-security); [Harmonic Guide](https://www.harmonic.security/products/guide). The MCP Gateway is a local gateway intercepting MCP client↔server traffic — [Harmonic MCP Gateway](https://www.harmonic.security/products/mcp-gateway)
- **LayerX/Akamai:** Uses "Deep Session Analysis" to monitor events within the browsing session — [Bleeping Computer sponsored](https://www.bleepingcomputer.com/news/security/layerx-enterprise-browser-security-extension-secure-the-modern-workspace/). Its anti-tampering operates at the browser, page and file-system levels and extends to incognito — [Akamai Workforce Protector](https://www.akamai.com/products/akamai-workforce-protector)
- LayerX's "Man in the Prompt" research showed extensions **without special permissions** can read and inject into ChatGPT/Gemini prompts via the DOM, and concluded permission-based assessment "will not suffice" — [Dark Reading](https://www.darkreading.com/vulnerabilities-threats/attackers-use-browser-extensions-inject-ai-prompts%0A); [CyberInsider](https://cyberinsider.com/the-top-ai-tools-exposed-to-man%e2%80%91in%e2%80%91the%e2%80%91prompt-browser-extension-attack/)
- **WitnessAI:** Intercepts at the network level through SSE/NGFW connectors (Zscaler, PAN, Netskope, Fortinet, F5) — [WitnessAI datasheet](https://witness.ai/wp-content/uploads/2025/05/WIT-Secure-AI-Enablement-Platform-OP.pdf)
- **Cato/Aim:** Inspection happens in a Cato PoP after steering via the Cato Client, site or extension — [Aona (competitor)](https://aona.ai/resources/comparisons/aona-vs-aim-security/)
- **Lasso:** The MCP Gateway intercepts requests and responses, masks secrets and PII, blocks prompt injection, and scans server reputation via plugins. A Jan 2026 release added guardrails v3 API support and non-chat argument formats — [druce.ai](https://druce.ai/governance/wiki/vendors/lasso-security); [GitHub releases](https://github.com/lasso-security/mcp-gateway/releases)

### Inferences
- WitnessAI's thick-client coverage (Copilot, Office) only works where the partner SSE decrypts TLS. Inference: cert-pinned desktop apps would escape it. This is not confirmed.
- Nightfall's Windows "driver" is likely a minifilter or WFP component. This is inferred from the error names only, not documented.
- The Endpoint Security plus Accessibility combination is the standard macOS pattern. Cipher's agent will need the same MDM PPPC payloads (FDA, Accessibility, System Extension approval).

### Gaps
- No public documentation found on native messaging usage, local proxy ports or TLS root-cert installation for any of the extension/agent vendors.
- Harmonic's agent internals (Rust, per job ads) are not publicly documented: no information on kernel vs user mode, or ES framework use.

---

## 4. Implementation languages / tech stack

### Takeaway
Little is public. The only solid stack evidence is Harmonic's job ads (Rust endpoint agents, TypeScript/React front end, Java/Terraform/Python back end) and Lasso's open-source Python MCP gateway.

### Cited Findings
- **Harmonic:** The Principal Systems Engineer and Principal Endpoint Engineer roles want deep Rust (or C++ willing to move to Rust) "to build security agents that run on Windows, macOS, and Linux" — [BuiltIn Bristol](https://builtinbristol.uk/job/principal-systems-engineer/9024378); [BuiltIn London](https://builtinlondon.uk/job/principal-systems-engineer/9605860)
- **Harmonic:** The Senior Software Security Engineer role lists Java and Terraform as primary, with TypeScript, Rust and Python also used — [BuiltIn London](https://builtinlondon.uk/job/senior-software-security-engineer/10721225). The Principal Front End Engineer role uses TypeScript/React — [Welcome to the Jungle](https://app.welcometothejungle.com/jobs/M050Ycd_/company)
- **Harmonic:** Has more than 90 employees across the US and UK — [CryptoBriefing](https://cryptobriefing.com/harmonic-security-raises-50m-series-b/)
- **Lasso:** The MCP Gateway is open source, MIT-licensed, Python — [druce.ai](https://druce.ai/governance/wiki/vendors/lasso-security); [GitHub](https://github.com/lasso-security/mcp-gateway/releases)
- **Lasso:** LEAP is a CPU-only guardrail model. The CEO claims under 5 ms latency and "thousands of times" the throughput of existing guardrails — [Raising.fi](https://raising.fi/news/lasso-security-undisclosed-september-2026); [Dealroom](https://dealroom.co/news/148347-lasso-security-raises-30m-series-a-to-run-ai-guardrails-without-gpus/)
- **Nightfall:** Detectors are built on a ~125M-parameter model and use LLM-generated embeddings for context — [Nightfall detectors](https://www.nightfall.ai/ai-based-dlp-detectors). Its macOS agent uses the Apple Endpoint Security framework (see Q3).

### Inferences
- Rust for cross-platform endpoint agents (Harmonic) is a reasonable signal for cipher's own agent choice.

### Gaps
- No job-ad or engineering-blog stack evidence was found for LayerX, Prompt Security, WitnessAI, Cato/Aim or Nightfall in this pass. Their GitHub orgs were not checked beyond Lasso's.

---

## 5. Detection approach (regex/dictionaries/EDM/fingerprinting vs ML/SLM/LLM) — what is ML-based

### Takeaway
Every vendor markets ML or LLM-based detection as its core differentiator against "legacy regex DLP". None publicly positions regex-only as a feature. Cipher's rules-only approach is contrarian. It can be framed around determinism, explainability, on-device privacy and latency, but expect competitors to attack it on false positives.

### Cited Findings
| Vendor | Detection approach | ML-based? |
|---|---|---|
| Harmonic | "Purpose-built small language models" that read user intent and sensitive data; positioned against pattern-matching DLP; regex not mentioned | Yes |
| LayerX/Akamai | Method not disclosed on product page | Not stated |
| Prompt Security | "Contextual, LLM-based detection" for PII/PHI/secrets/proprietary data | Yes |
| Lasso | CPU-only LEAP guardrail model; self-hosted RAPID engine against plain-language policies | Yes |
| Cato/Aim | Risk scoring; method not disclosed | Not stated |
| WitnessAI | Intent-based classification, explicitly "rather than matching keywords"; "proprietary models" for agent intent | Yes |
| Nightfall | "Pre-trained ML and transformer-based detectors"; LLM file classifiers; computer vision; custom detectors | Yes (custom detector type unconfirmed) |

- **Harmonic:** Uses "purpose-built small language models" that read the full interaction to understand user intent and sensitive data. It claims inline decisions in under 200 ms and contrasts itself with pattern-matching DLP. Regex is not mentioned — [Harmonic Guide](https://www.harmonic.security/products/guide); [Harmonic browser page](https://www.harmonic.security/solutions/browser-based-genai-security). It distinguishes safe from risky use (e.g. explaining a function vs pasting proprietary code). There are no public accuracy benchmarks — [aisecurityplatform.com review](https://aisecurityplatform.com/reviews/harmonic/)
- **Prompt Security:** Sensitive data detection is "contextual, LLM-based" — [AppSecSanta](https://appsecsanta.com/prompt-security). It also detects prompt injection, jailbreak and prompt leaks, and gives MCP servers dynamic risk scores — [SentinelOne blog](https://www.sentinelone.com/blog/a-new-chapter-for-ai-and-cybersecurity-sentinelone-acquires-prompt-security/)
- **Lasso:** LEAP is a CPU-only guardrail (an ML model) and RAPID is a self-hosted engine for "judgment call" decisions against plain-language policies — [Raising.fi](https://raising.fi/news/lasso-security-undisclosed-september-2026). Its MCP Gateway plugins mask secrets/PII (method unspecified) — [druce.ai](https://druce.ai/governance/wiki/vendors/lasso-security)
- **WitnessAI:** Intent-based: it "analyzes the meaning and purpose of each prompt rather than matching keywords or predefined patterns" and evaluates whole conversations for multi-turn attacks — [AppSecSanta](https://appsecsanta.com/witnessai). It claims "24+ risk dimensions" and "99% of malicious prompts blocked" — [WitnessAI datasheet](https://witness.ai/wp-content/uploads/2025/05/WIT-Secure-AI-Enablement-Platform-OP.pdf). Its roadmap applies "proprietary models to analyze the intention of actions" by agents — [BankInfoSecurity](https://www.bankinfosecurity.com/witnessai-secures-58m-to-grow-global-ai-security-reach-a-30510)
- **Nightfall:**
  - Uses "pre-trained ML and transformer-based detectors" for PII, PHI, PCI, API keys/secrets, credentials and source code, plus custom detectors and AI-based content classification and lineage — [Nightfall pricing](https://www.nightfall.ai/pricing)
  - Detectors are built on a 125M-parameter model and use LLM embeddings for context. Nightfall claims to outperform regex by "up to 85%" — [Nightfall detectors](https://www.nightfall.ai/ai-based-dlp-detectors)
  - Accuracy claims are **inconsistent**: "95% precision" on one page ([pricing FAQ](https://www.nightfall.ai/pricing)) versus "95% accuracy" with 100+ models and computer vision on another ([Nightfall](https://nightfall.ai/machine-learning-detectors))
  - A Snyk case study reports 94% true positives (vendor-published) — [Nightfall](https://www.nightfall.ai/ai-based-dlp-detectors)
- **LayerX/Akamai and Cato/Aim:** Neither product page discloses the detection method. Cato offers "risk scoring" — [Akamai Workforce Protector](https://www.akamai.com/products/akamai-workforce-protector); [Aona](https://aona.ai/resources/comparisons/aona-vs-aim-security/)

### Inferences
- Nightfall's custom detectors almost certainly include regex and word lists, as standard in its developer API heritage, but this was not verified here.
- Harmonic's "SLM in under 200 ms" and Lasso's "CPU-only, under 5 ms" claims show the industry is optimising ML for latency and cost. A regex engine can beat both on latency and cost, but not on context understanding (e.g. "proprietary code").

### Gaps
- Whether any vendor runs classification on-device vs in the cloud: Harmonic does not say ([Harmonic browser page](https://www.harmonic.security/solutions/browser-based-genai-security)), and Cato inspects in the cloud ([Aona](https://aona.ai/resources/comparisons/aona-vs-aim-security/)).
- No independent false-positive or false-negative benchmarks exist for any vendor.

---

## 6. Policy actions and user-facing UX

### Takeaway
Most vendors offer block, warn/coach, redact and monitor, plus "redirect to sanctioned tool". Harmonic adds business justification and account-aware (personal vs corporate) policies. WitnessAI adds model routing. Nightfall adds SaaS remediation (quarantine, revoke, encrypt).

### Cited Findings
| Vendor | Block | Warn / coach | Redact / tokenize | Justification | Redirect / route | Monitor-only |
|---|---|---|---|---|---|---|
| Harmonic | ✓ | ✓ | not mentioned | ✓ | ✓ | ✓ |
| LayerX/Akamai | ✓ | ✓ | ✓ | not mentioned | "guide" | — |
| Prompt Security | ✓ | ✓ | ✓ | — | — | alert + audit log |
| Cato/Aim | ✓ | not documented | ✓ | — | ✓ | — |
| WitnessAI | ✓ | not mentioned | ✓ (tokenize) | — | ✓ (model routing) | — |
| Nightfall | ✓ | ✓ | ✓ | — | ✓ | — |

- **Harmonic:**
  - Actions: block, warn with context, log silently, and coach with customizable text, colours and branding. Coaching rules vary by data type, app and role — [Harmonic Guide](https://www.harmonic.security/products/guide)
  - It also offers "request a business justification" and "redirect to a sanctioned tool". Redaction is not mentioned. Policies can be account-aware (log on a corporate account, coach or block on a personal one) — [Harmonic browser page](https://www.harmonic.security/solutions/browser-based-genai-security)
  - A typical rollout is ~30 days observe-only, then enforcement. This is a reviewer suggestion — [aisecurityplatform.com](https://aisecurityplatform.com/reviews/harmonic/)
- **LayerX/Akamai:** Adaptive policies "warn, redact, block, or guide" — [Akamai Workforce Protector](https://www.akamai.com/products/akamai-workforce-protector)
- **Prompt Security:** Redact or tokenize on the fly, block high-risk prompts, coach inline. The MCP Gateway can allow, block, filter or redact — [SentinelOne blog](https://www.sentinelone.com/blog/a-new-chapter-for-ai-and-cybersecurity-sentinelone-acquires-prompt-security/). Also alerts admins, applies role/department policies and keeps an audit trail — [AppSecSanta](https://appsecsanta.com/prompt-security)
- **Cato/Aim:** Block, redact, or redirect to approved tools; inline redaction applies to prompts and uploads. In-prompt coaching is not documented — [Aona (competitor)](https://aona.ai/resources/comparisons/aona-vs-aim-security/). An Aug 2026 access-control policy steers users to approved alternatives — [Cato KB](https://knowledge.catonetworks.com/docs/product-updates-aug-3-2026)
- **WitnessAI:**
  - Block, redact/tokenize in real time, and route prompts to models by sensitivity, role, risk and cost (e.g. a confidential prompt goes to a private endpoint). Warn is not mentioned — [AppSecSanta](https://appsecsanta.com/witnessai)
  - "VIP / high privacy mode" RBAC keeps executive conversations private — [datasheet](https://witness.ai/wp-content/uploads/2025/05/WIT-Secure-AI-Enablement-Platform-OP.pdf)
- **Nightfall:**
  - Actions: real-time blocking; redact, delete, quarantine; revoke permissions and disable downloads; labels and encryption; coaching and self-remediation; redirect to approved AI tools — [Nightfall pricing](https://www.nightfall.ai/pricing)
  - Redaction in prompts removes "just the problematic content — not the entire prompt" — [Nightfall shadow AI page](https://www.nightfall.ai/solutions/prevent-data-leakage-to-shadow-ai)
  - IDE hooks block prompts, tool calls and shell commands; model responses are monitor-only — [Nightfall pricing](https://www.nightfall.ai/pricing)

### Inferences
- Cipher's minimum credible action set: block, warn/coach (with custom message), redact in place, allow with justification, monitor-only, and redirect to a sanctioned tool. Personal vs corporate account detection is also expected (Harmonic and Nightfall both have it).

### Gaps
- No screenshots or UX teardown of the in-page warning/redaction modals were gathered.

---

## 7. Pricing, target customers, funding/acquisition, positioning, limitations/criticisms

### Takeaway
No vendor publishes prices; all are quote-based enterprise sales. Three of the seven were acquired in 2025–26 by platform vendors (SentinelOne, Cato, Akamai). The remaining independents are well funded (Harmonic $76M, WitnessAI $85M+, Nightfall ~$60M, Lasso ~$37M+). Common criticisms: opaque pricing, unverified accuracy claims, coverage gaps outside the browser (extension vendors) or outside the steered path (network vendors).

### Cited Findings
**Harmonic Security**
- Funding: $50M Series B on 14 Oct 2026, led by Crosspoint Capital Partners, bringing the total to $76M. Founded 2023 by Alastair Paterson (CEO) and Bryan Woolgar-O'Neil (CTO), ex-Digital Shadows. More than 100 companies are customers and it has partnerships with Climb and Distology — [Business Wire](https://www.businesswire.com/news/home/20261014886358/en/Harmonic-Security-Raises-$50-Million-Series-B-Enabling-Safe-AI-Adoption-for-Millions-More-Employees); [CryptoBriefing](https://cryptobriefing.com/harmonic-security-raises-50m-series-b/); [SecurityWeek](https://securityweek.com/harmonic-security-raises-50-million-for-workforce-ai-protection)
- Pricing is quote-based (6/10 for transparency in one review). Compliance: SOC 2 Type 2, ISO 27001 and HIPAA; EU and US hosting — [aisecurityplatform.com](https://aisecurityplatform.com/reviews/harmonic/); [Harmonic browser page](https://www.harmonic.security/solutions/browser-based-genai-security)
- Criticisms from a reviewer:
  - The agent install is a blocker for organisations with slow approvals
  - Classifier accuracy and long-tail browser fidelity are unverified
  - MCP gateway maturity is unverified
  - ISO 42001/EU AI Act mappings are not published
  - [aisecurityplatform.com](https://aisecurityplatform.com/reviews/harmonic/)
- Harmonic's own stated limitations: inline control applies only where supported, otherwise monitoring only. Autonomous agents have no browser request to inspect — [Harmonic Guide](https://www.harmonic.security/products/guide)

**LayerX → Akamai**
- Series A: $11M extension in Apr 2025 (Jump Capital). The total is ambiguous ($37M in the headline vs $45M in the body) — [LayerX PR](https://layerxsecurity.com/blog/layerx-security-extends-series-a-funding-to-37m-to-power-next-gen-enterprise-browser-security-challenges-sse-solutions-and-enterprise-browsers/); [SecurityWeek](https://www.securityweek.com/layerx-raises-11-million-for-its-browser-security-solution/)
- Akamai deal:
  - Agreed 14 May 2026 for ~$205M; LayerX expected to reach ~$10M ARR by year end; ~$0.12 non-GAAP EPS dilution for FY2026
  - Combined into Akamai Zero Trust (ZTNA, AI runtime protection, inference segmentation); founders Or Eshed and David Vaisbrud joined Akamai
  - [Akamai PR](https://www.akamai.com/it/newsroom/press-release/akamai-technologies-announces-intent-to-acquire-layerx-advancing-its-workforce-security-strategy-with-ai-usage-control)
- Closed 2 Jul 2026; rebranded Akamai Workforce Protector around Aug 2026 — [Softprom](https://softprom.com/akamai-layerx-secure-enterprise-browser-acquisition); [Akamai news](https://www.akamai.com/uk/en/about/news/)
- Positioning: works in existing browsers, as a counter to enterprise browsers (Island/Talon) and SSE — [LayerX PR](https://layerxsecurity.com/blog/layerx-security-extends-series-a-funding-to-37m-to-power-next-gen-enterprise-browser-security-challenges-sse-solutions-and-enterprise-browsers/)

**Prompt Security → SentinelOne**
- Founded Aug 2023 by Itamar Golan (CEO) and Lior Drihem (CTO); $5M seed in Jan 2024. SentinelOne announced the deal on 5 Aug 2025 and closed it on 5 Sep 2025, for ~$180M cash and stock. Pricing is not public — [AppSecSanta](https://appsecsanta.com/prompt-security); [Dark Reading](https://www.darkreading.com/endpoint-security/sentinelone-acquires-ai-startup-prompt-security)
- It is integrated into Singularity endpoint/cloud and positioned as accelerating SentinelOne's GenAI DLP — [SentinelOne blog](https://www.sentinelone.com/blog/a-new-chapter-for-ai-and-cybersecurity-sentinelone-acquires-prompt-security/); [MSSP Alert](https://www.msspalert.com/news/sentinelone-strengthens-ai-tool-visibility-for-mssps-with-prompt-security-buy)

**Lasso Security**
- Founded 2023 by Elad Schulman (CEO), Ophir Dror (CPO), Lior Ziv (CTO) and Yuval Abadi (COO); Tel Aviv. Raised a $6M seed in 2023 (Entrée Capital) — [FinTech Global](https://fintech.global/2023/11/23/lasso-security-bags-6m-in-seed-funding-to-advance-llm-cybersecurity/)
- Raised $30M in Sep 2026, led by ClearSky. Stage is reported inconsistently as Series A, seed or undisclosed; total is >$37M — [Raising.fi](https://raising.fi/news/lasso-security-undisclosed-september-2026); [Dealroom](https://dealroom.co/news/148347-lasso-security-raises-30m-series-a-to-run-ai-guardrails-without-gpus/)
- Criticism (competitor-sourced): no read-vs-write permissions within a tool; agent identity not tied to the human directory; the extension misses CLI/IDE clients — [WithWillow](https://withwillow.ai/blog/best-ai-agent-security-tools-2026); [Aurascape](https://aurascape.ai/answers/aurascape-vs-lasso-security-comparison/)
- Positioning is shifting toward agent and AppSec runtime guardrails — [Aurascape](https://aurascape.ai/answers/aurascape-vs-lasso-security-comparison/)

**Aim Security → Cato Networks**
- Acquired Sep 2025, Cato's first acquisition. Price undisclosed, reported at ~$350M. It came with $50M added to Cato's Series G (total $409M), and Cato passed $300M ARR — [SiliconANGLE](https://siliconangle.com/2025/09/03/cato-networks-acquires-aim-security-expand-ai-security-capabilities/); [SDxCentral](https://www.sdxcentral.com/news/cato-networks-acquires-aim-security-and-50m-in-funding/); [ChannelE2E](https://www.channele2e.com/news/cato-networks-acquires-aim-security-expands-financing-and-crosses-300m-arr)
- Licensing: one of five converged solutions on the Cato SASE Cloud. It requires a Cato SASE licence and steering. Time to first signal is "days to weeks". There is no AI-module-specific attestation and the event storage region is not documented — [Aona (competitor)](https://aona.ai/resources/comparisons/aona-vs-aim-security/)

**WitnessAI**
- Raised $58M in Jan 2026, led by Sound Ventures, with Qualcomm, Samsung, Fin Capital and Forgepoint. Prior investors include GV and Ballistic, which incubated it; Series A was $27.5M (May 2024) — [FinTech Global](https://fintech.global/2026/01/15/ai-security-platform-witnessai-raises-58m-to-expand-globally/); [AppSecSanta](https://appsecsanta.com/witnessai)
- Total reported as "over $85M". A $100M figure is unverified — [BankInfoSecurity](https://www.bankinfosecurity.com/witnessai-secures-58m-to-grow-global-ai-security-reach-a-30510)
- Self-reported >500% ARR growth. CEO is Rick Caccia; HQ Mountain View. Targets regulated large enterprises (finance, utilities, telecom, auto). Pricing is not public — [AppSecSanta](https://appsecsanta.com/witnessai)
- Limitation: it relies on an existing SSE/NGFW stack, and some integrations "take longer than expected" — [WitnessAI datasheet](https://witness.ai/wp-content/uploads/2025/05/WIT-Secure-AI-Enablement-Platform-OP.pdf); search summary of [Witness blog](https://witness.ai/blog/best-zscaler-alternatives-ai-security-governance/)

**Nightfall AI**
- Founded 2018 by Isaac Madan and Rohan Sathe, San Francisco. Raised a $40M Series B in Aug 2022 (WestBridge, Bain Capital Ventures, Venrock); total ~$60.3–63.3M. No 2025–26 round was found — [Nightfall PR](https://nightfall.ai/blog/nightfall-ai-raises-40-million-series-b-to-expand-cloud-data-protection-platform); [Clay](https://www.clay.com/dossier/nightfall-funding); [CB Insights](https://www.cbinsights.com/company/nightfall-ai/financials)
- Pricing:
  - Per user per year in two editions, Foundation and Premier; Premier has Tier 1 (≤3 apps) and Tier 2 (all apps). Prices are not shown
  - 150 GB data-at-rest scanning included, with TB add-on packs
  - No self-serve trial; a 7-day proof of value instead
  - "Nyx" autonomous DLP analyst included
  - [Nightfall pricing](https://www.nightfall.ai/pricing)
- AWS Marketplace shows only a placeholder of $1/dimension — [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-mui6ld62t4ub6). Reviewers call pricing the main friction point — [Recatools](https://recatools.com/ai-directory/nightfall-ai/)
- The pricing page is internally inconsistent: Premier vs "Complete" naming, Cowork vs Code attribution, and deploy time of "about an hour" vs "10 minutes" — [Nightfall pricing](https://www.nightfall.ai/pricing)

### Inferences
- Consolidation pattern: platform vendors (EDR, SASE, CDN/Zero Trust) bought standalone AI-usage-control startups at about $180–350M, with the target having roughly $10M ARR in Akamai/LayerX's case. This sets a rough exit benchmark and shows buyers may prefer suite add-ons. A small regex-only entrant likely needs to compete on price transparency, self-serve onboarding and on-device privacy, all of which none of these vendors offer.
- No vendor offers a public price or self-serve trial. Nightfall's "7-day PoV" is the closest. A transparent per-seat price would be a clear differentiator for cipher.

### Gaps
- No public list prices for any vendor; no analyst (Gartner/Forrester) pricing benchmarks were retrieved.
- Named reference customers were largely absent from the sources fetched.
- Primary-source confirmation of the Prompt Security deal value (~$180M) came via AppSecSanta; SentinelOne's blog did not state the price.
