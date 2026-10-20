# Enterprise Browsers and Browser-Level DLP for GenAI (Island, Prisma Access Browser, Edge for Business + Purview, Chrome Enterprise Premium, extension-vs-browser trade-off)

Research date: 2026-10-20. Scope: how each product works technically, plus lessons for "cipher" (endpoint agent + browser extension + gateway, regex/rule-based, no ML). Every claim has an inline source. Claims marked **[vendor]** come from marketing or competitor pages and are biased. Claims marked **[ML]** depend on machine-learning classifiers that cipher will not have.

---

## 1. Architecture: Chromium fork, extension, or built-in browser capability? Engine and languages

### Takeaway
There are three architectures. **Island** and **Prisma Access Browser** are Chromium forks written mainly in C++, and both now also sell a lighter extension for stock browsers. **Edge for Business + Purview** and **Chrome Enterprise Premium** build the controls into the vendor's own browser and drive them with enterprise policies. Chrome also exposes a documented, open-source local-agent hook (the Content Analysis SDK: C++ with protobuf) that a third-party endpoint agent like cipher can plug into.

### Cited Findings
**Island**
- Island job postings ask for senior C/C++ engineers to "dive deep into the huge open code base of Chromium" and value knowledge of browser internals such as sandboxing, profiles, CSP and certificate handling. One Tel Aviv posting lists "Past experience with Chromium code base or extension development" as a plus. — [career.io Island Senior C++ Engineer](https://career.io/job/senior-c-engineer-tel-aviv-yafo-island-847ee3f8b56f8a08e0e4ba24c8f4706f); [Georgian/Insight portfolio job board, Island Senior C++ Developer (Aug 2025, Florida)](https://careers.georgian.io/companies/island-2-663559ae-da75-478c-af14-4cb804a9348b/jobs/57293026-senior-c-developer)
- The Florida posting asks for 6+ years of modern C++, multi-platform desktop **and mobile** experience, and AWS/OCI cloud experience. — [Insight Partners job board](https://jobs.insightpartners.com/companies/island-2-663559ae-da75-478c-af14-4cb804a9348b/jobs/57293026-senior-c-developer)
- Island now also ships the **Island Extension**, which brings its controls into Chrome, Edge, Firefox and Safari. Island says the extension supports "most but not all" of the full browser's capabilities "because of browser extension restrictions." **[vendor]** — [Island Extension page](https://www.island.io/island-extension); [Island enterprise browser extension](https://www.island.io/enterprise-browser-extension)
- Island says its extension also works in other Chromium-based browsers, including ChatGPT Atlas and Perplexity Comet (agentic AI browsers). **[vendor]** — [Island Enterprise Browser page](https://island.io/enterprise-browser)

**Palo Alto Networks Prisma Access Browser (PAB, ex-Talon; recently branded "Prisma Browser")**
- Palo Alto closed its acquisition of Talon Cyber Security on Dec 28, 2023. Audited filings put total consideration at $458.6M ($439.0M cash plus $19.6M replacement awards). Early press reports said $625M. The stated rationale was secure access "for unmanaged and personal devices with an enterprise browser" inside Prisma SASE. — [SC World](https://www.scworld.com/brief/talon-acquisition-closed-by-palo-alto-networks); [PANW 10-K FY2024](https://www.sec.gov/Archives/edgar/data/1327567/000132756724000029/panw-20240731.htm); [PANW 10-K FY2026](https://www.sec.gov/Archives/edgar/data/0001327567/000132756726000023/panw-20260731.htm); [CFO Dive](https://cfodive.com/news/palo-alto-networks-agrees-buy-talon-cyber-security-merger-acquisition-ramp-up/698951)
- A Palo Alto blog post (Ofer Ben-Noon, Talon co-founder, July 24, 2024) describes PAB as "built on Chromium." — [Palo Alto SASE blog: Securing GenAI Apps in Your Web Browser](https://www2.paloaltonetworks.com/blog/sase/securing-genai-apps-in-your-web-browser.md)
- There is also a **Prisma Browser Extension** (formerly Prisma Access Browser Extension) for Chromium consumer browsers (Chrome, Edge, Brave, Arc) on Windows, macOS and ChromeOS. Its policy options are narrower than the full browser's: block, allow and warn only, with no in-extension MFA enforcement. — [Venn: Prisma Access Browser Extension](https://www.venn.com/learn/browser-security/prisma-access-browser-extension/) (a competitor-authored explainer)
- A UK G-Cloud reseller listing says PAB can be deployed as a "software add-on or extension" or standalone, and calls it a "native enforcement point for managed and unmanaged devices" for Prisma SASE. — [UK Digital Marketplace G-Cloud listing](https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/133937338982082)

**Microsoft Edge for Business + Purview**
- Inline protection is "built natively into Edge for Business" and can be enabled without deploying Endpoint DLP. — [Message Center MC1046161 mirror](https://mc.merill.net/message/MC1046161); [The Hacker News, Mar 2025](https://thehackernews.com/2025/03/microsoft-adds-inline-data-protection.html)
- Edge (not only Edge for Business) is the native enforcement browser for Purview Endpoint DLP. Chrome on Windows needs the **Microsoft Purview browser extension**, and when the action is warn or block, "unallowed browsers" are blocked and the user is redirected to Edge. — [Learn: Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about); [Learn: DSPM for AI considerations](https://learn.microsoft.com/en-us/purview/ai-microsoft-purview-considerations)

**Google Chrome Enterprise Premium (CEP)**
- DLP is built into Chrome and driven by **Chrome Enterprise Connectors** policies. The Chromium policy definitions (`components/policy/resources/templates/policy_definitions/Miscellaneous/*.yaml`) define `OnBulkDataEntryEnterpriseConnector` (paste/drag-drop), `OnFileAttachedEnterpriseConnector` (upload), `OnFileDownloadedEnterpriseConnector`, `OnPrintEnterpriseConnector` and the ChromeOS-only `OnFileTransferEnterpriseConnector`. — [Chromium source: OnBulkDataEntryEnterpriseConnector.yaml](https://raw.githubusercontent.com/chromium/chromium/main/components/policy/resources/templates/policy_definitions/Miscellaneous/OnBulkDataEntryEnterpriseConnector.yaml)
- Chromium build flags enable local content analysis on Windows, macOS and Linux: `enterprise_local_content_analysis = is_win || is_mac || is_linux`. Separate "Data Control rules" (`enterprise_data_controls`) are enabled on Windows, macOS, Linux, ChromeOS, Android and iOS. — [Chromium source: components/enterprise/buildflags/buildflags.gni](https://raw.githubusercontent.com/chromium/chromium/main/components/enterprise/buildflags/buildflags.gni)
- Chromium vendors the SDK as `//third_party/content_analysis_sdk:liblcasdk` in `chrome/browser/enterprise/connectors/analysis` (`content_analysis_sdk_manager.cc`, `local_binary_upload_service`). — [Chromium source: analysis/BUILD.gn](https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/enterprise/connectors/analysis/BUILD.gn)

**Chrome Content Analysis Connector Agent SDK** (the highest-value item for cipher)
- Repo: [github.com/chromium/content_analysis_sdk](https://github.com/chromium/content_analysis_sdk). License BSD-3-Clause. Built with C++, CMake 3.23+ and Protocol Buffers 3.18+ (vcpkg). Layout: `agent/` (linked into the DLP agent), `browser/` (compiled into Chrome), `proto/` (shared messages), `demo/` (sample agent and client). The latest commit is `0a0e7ea` from 2026-08-11 ("Add size argument to LCAC client demo (#113)"), so the repo is still maintained. — [GitHub repo](https://github.com/chromium/content_analysis_sdk) (cloned and inspected 2026-10-20)
- **Transport on Windows: named pipes.** The agent creates `\\.\pipe\<name>` and Chrome connects via `\Device\NamedPipe\<name>`. In system mode the pipe is created under `ProtectedPrefix\Administrators\` so only admin-privileged processes can create it, which stops a non-admin process from impersonating the DLP agent. In `user_specific` mode the user's SID is appended (`<name>.<SID>`). Pipes are created with `PIPE_REJECT_REMOTE_CLIENTS` and overlapped (async) I/O, with several listening instances for concurrent Chrome processes. — [SDK source common/utils_win.h & utils_win.cc](https://github.com/chromium/content_analysis_sdk/blob/main/common/utils_win.cc); [agent/src/agent_win.cc](https://github.com/chromium/content_analysis_sdk/blob/main/agent/src/agent_win.cc)
- **The public SDK's macOS and Linux paths are stubs.** `agent_mac.cc` and `agent_posix.cc` return `ResultCode::ERR_UNEXPECTED` from `Agent::Create` and `HandleEvents`, and `browser/src/client_mac.cc` returns `nullptr`/-1. — [SDK agent/src/agent_mac.cc](https://github.com/chromium/content_analysis_sdk/blob/main/agent/src/agent_mac.cc); [agent/src/agent_posix.cc](https://github.com/chromium/content_analysis_sdk/blob/main/agent/src/agent_posix.cc)
- Channel names in the demo: `path_user` (per-user agent) and `brcm_chrm_cas` (system agent, a name that originated with Broadcom/Symantec DLP). — [SDK demo/agent.cc](https://github.com/chromium/content_analysis_sdk/blob/main/demo/agent.cc)
- The agent API is `Agent::Create(Config{name, user_specific}, handler)`. Agent instances "are not thread safe except for Stop()". — [SDK analysis_agent.h](https://github.com/chromium/content_analysis_sdk/blob/main/agent/include/content_analysis/sdk/analysis_agent.h)

### Inferences
- The commercial leaders (Island, Talon/PAB) bet on a C++ Chromium fork for deep control (screenshots, printing, clipboard across processes, devtools, watermarking), then added extensions because users resist switching browsers. **Cipher's extension-plus-endpoint-agent design matches where the market is converging, not a lesser compromise.**
- No Rust- or TypeScript-core enterprise browser turned up. The extension products are necessarily JS/TS (MV3), but I found no primary source on their languages.
- Because the public SDK only implements Windows, a macOS/Linux cipher agent would have to reverse-engineer or reimplement Chrome's side. The Chromium build flag says Chrome supports local analysis on mac and linux, so a working transport probably exists in Chromium's vendored copy (not verified).

### Gaps
- I found no primary source (binary analysis or Island engineering blog) on Island's rebase cadence onto upstream Chromium, or on whether its core uses Rust.
- I could not confirm the Prisma Browser Extension's internals or the languages of either vendor's extension.
- I did not verify the macOS/Linux transport Chrome uses for local agents (Unix domain socket? XPC?). The public SDK leaves it unimplemented. Check `third_party/content_analysis_sdk` in Chromium directly.

---

## 2. Which data-movement events are controlled, on which AI sites, and how AI sites are identified

### Takeaway
Every product covers **paste** and **file upload**. The native browsers (Edge, Island, PAB) add **typed-prompt** inspection, and Chrome adds **print** and **download**. Screenshot, watermark and screen-share controls are a strength of the browser-owning products. AI sites are identified by vendor-maintained URL catalogs and categories, starting with a few top consumer apps (ChatGPT, Gemini, DeepSeek) and growing over time.

### Cited Findings
**Chrome (Content Analysis protocol and CEP)**
- Protocol trigger enum `AnalysisConnector`: `FILE_DOWNLOADED`=1, `FILE_ATTACHED`=2, `BULK_DATA_ENTRY`=3, `PRINT`=4, `FILE_TRANSFER`=5 and `DATA_COPIED`=6. The last two are marked as not implemented in the SDK. — [SDK proto analysis.proto](https://raw.githubusercontent.com/chromium/content_analysis_sdk/main/proto/content_analysis/sdk/analysis.proto)
- `Reason` enum (the user action): `CLIPBOARD_PASTE`, `DRAG_AND_DROP`, `FILE_PICKER_DIALOG`, `PRINT_PREVIEW_PRINT`, `SYSTEM_DIALOG_PRINT`, `NORMAL_DOWNLOAD`, `SAVE_AS_DOWNLOAD`, `CLIPBOARD_COPY`. — [analysis.proto](https://raw.githubusercontent.com/chromium/content_analysis_sdk/main/proto/content_analysis/sdk/analysis.proto)
- `OnBulkDataEntry` "triggers when data is entered in Chrome from the clipboard or by drag and dropping web content." **Typed keystrokes are not a Connector trigger.** — [OnBulkDataEntryEnterpriseConnector.yaml](https://raw.githubusercontent.com/chromium/chromium/main/components/policy/resources/templates/policy_definitions/Miscellaneous/OnBulkDataEntryEnterpriseConnector.yaml)
- Minimum Chrome versions: BulkDataEntry, FileAttached and FileDownloaded from Chrome 84; Print from 106; BulkDataEntry on iOS from 156; FileDownloaded on iOS 150 and Android 151; FileTransfer on ChromeOS 108. — Chromium policy YAMLs, e.g. [OnPrintEnterpriseConnector.yaml](https://raw.githubusercontent.com/chromium/chromium/main/components/policy/resources/templates/policy_definitions/Miscellaneous/OnPrintEnterpriseConnector.yaml)
- CEP DLP rule triggers: File uploaded, File downloaded, Content pasted, Content printed, URL visited, plus File transfer on ChromeOS. URL-visited rules can add a **watermark**, and on Windows, Android, iOS and Mac can **restrict screenshots and screen sharing**. — [Google Workspace Admin Help: Use Chrome Enterprise Premium to integrate DLP with Chrome](https://knowledge.workspace.google.com/admin/security/use-chrome-enterprise-premium-to-integrate-dlp-with-chrome?hl=en)
- Rule conditions include URL category, source URL, "Chrome context" (Incognito, Clipboard, Other Profile) and the signed-in web app account (for example, personal vs corporate ChatGPT). — [same Google help page](https://knowledge.workspace.google.com/admin/security/use-chrome-enterprise-premium-to-integrate-dlp-with-chrome?hl=en)
- Google's 2024 security blog recommends content rules on paste, upload/download and print for GenAI sites, URL filtering to warn on or block GenAI apps, and login-event reporting to see which GenAI domains users sign into. — [Google Security Blog, Apr 18 2024](https://security.googleblog.com/2024/04/prevent-generative-ai-data-leaks-with.html?m=1)
- A July 2026 community post reports nine predefined CEP DLP templates. Three are "Shadow AI" templates: audit GenAI site visits, restrict paste on GenAI sites, and block unsanctioned GenAI sites while allowing Gemini. The other six cover PII, financial and health data. A community forum post is not an official release note. — [Android Enterprise community](https://www.androidenterprise.community/best-practices-with-chrome-enterprise-46/configure-chrome-enterprise-premium-dlp-templates-2886)

**Microsoft Edge for Business + Purview**
- Inline protection covers "typing of text directly into a web application or generative AI prompt." It launched with ChatGPT, Google Gemini and DeepSeek, and Microsoft said the list would expand. — [MC1046161](https://mc.merill.net/message/MC1046161); [The Hacker News](https://thehackernews.com/2025/03/microsoft-adds-inline-data-protection.html)
- Roadmap RM486368 ("New Inline Protection controls for AI apps in Edge for Business") shows GA, November 2025. — [RM486368](https://mc.merill.net/message/RM486368)
- A later update added **inline file-upload protection** to unmanaged GenAI apps in Edge, enforceable by file size, type and sensitivity on Intune-managed Windows devices. Public preview was set for mid-November 2025 and GA for early December 2025. — [M365 admin (handsontek) mirror](https://m365admin.handsontek.net/?p=17558)
- A further message (MC1182684) extended inline controls to "more unmanaged GenAI apps in Edge." I could not fetch it in full (403). — [itelio MC1182684](https://www.itelio.com/en/microsoft-message-center/MC1182684)
- Endpoint DLP (agent-based) activities: upload to a restricted cloud service domain or access from an unallowed browser; **paste to supported browsers** ("Evaluation is performed on the content that is being pasted," independent of source-file classification; GA on Windows, **Preview on macOS**); copy to clipboard from protected files; copy to USB; copy to network share; print; Bluetooth; RDP (Windows only); and Windows Recall snapshots (preview). — [Learn: Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- AI sites come from Microsoft's catalog, "Supported AI sites by Microsoft Purview for data security and compliance protections." The DSPM one-click policy "Detect sensitive info added to AI sites" covers paste and upload in Edge, Chrome and Firefox in audit mode. — [Learn: DSPM for AI considerations](https://learn.microsoft.com/en-us/purview/ai-microsoft-purview-considerations) (the linked catalog page `ai-microsoft-purview-supported-sites` was not fetched)
- In activity explorer, AI interaction events for unmanaged AI apps in Edge include "text prompts only," not responses. — [Learn: DSPM for AI considerations](https://learn.microsoft.com/en-us/purview/ai-microsoft-purview-considerations)

**Prisma Access Browser**
- Controls for GenAI apps: block copy/paste, disable file uploads (illustrated with ChatGPT), data masking, and "control over sensitive data typing." Admins can block unapproved GenAI apps and redirect users to sanctioned ones, with access gated by just-in-time MFA and device posture. — [Palo Alto SASE blog, Jul 2024](https://www2.paloaltonetworks.com/blog/sase/securing-genai-apps-in-your-web-browser.md)
- Official docs say PAB can allow copy/paste between sanctioned apps while blocking it to other apps or desktop apps. PAB is "embedded with AI Access Security" for GenAI visibility and access control. — [Palo Alto docs: Discover Risks Posed by GenAI Apps on Prisma Browser](https://docs.paloaltonetworks.com/ai-access-security/administration/discover-risks-posed-by-genai-apps/discover-risks-posed-by-genai-apps-on-prisma-access-browser); [Prisma Browser GenAI use case](https://www.paloaltonetworks.com/sase/prisma-browser-genai-usage)
- PAB 2.0 positioning: "real-time visibility and access control over Generative AI usage." — [vsdaily launch coverage](https://vsdaily.com/palo-alto-networks-launches-worlds-first-sase-native-secure-browser-expands-prisma-sase-with-ai-powered-protections/)

**Island**
- Island extends DLP to GenAI by inspecting typed prompts, pasted content and file uploads before data reaches the AI service. This claim comes via a competitor review site. **[vendor-ish]** — [Venn: Island Browser Review](https://www.venn.com/learn/island-browser-review)

### Inferences
- **Typed-prompt inspection is the differentiator** that native browsers (Edge, Island, PAB) advertise over Chrome Connectors, which only see paste, drag-drop and files. A browser extension can implement it as a submit-time hook (keydown Enter or send-button click) that scans the prompt DOM. That gives cipher parity with Edge's "typed prompt" feature on Chrome, but it is fragile per site (selectors change). A per-site adapter registry that is updated out-of-band, like a URL catalog, is the pattern to copy.
- A good initial AI catalog for cipher: chatgpt.com/chat.openai.com, claude.ai, gemini.google.com, copilot.microsoft.com, chat.deepseek.com, perplexity.ai, and so on. Use domain matching plus personal-vs-corporate account detection, which Chrome does with its signed-in-account condition.

### Gaps
- I could not retrieve Microsoft's current list of supported AI sites for Edge inline protection, or Island's or PAB's AI app catalog sizes.
- I found no primary documentation of Island's screenshot, print or copy-out controls specific to GenAI sites.

---

## 3. Policy delivery

### Takeaway
All four products use a **cloud console that pushes policy to the browser**: the Google Admin console for Chrome, Purview plus the Edge management service plus Intune for Edge, and the Island and PAB management consoles. Chrome's Connector policies are **cloud-only**, so they cannot be set purely through GPO or registry. Microsoft uses Intune to auto-block "unprotected" browsers so users can't route around Edge.

### Cited Findings
- Each Chrome Connector policy is a JSON list. Fields: `service_provider` (enum: `google`, `local_user_agent`, `local_system_agent`, `brcm_chrm_cas`, `trellix`), `enable`/`disable` (each with `url_list` + `tags`, e.g. `dlp`, `malware`), `block_until_verdict` (1 = wait for verdict), `default_action` (`allow`|`block` when the analysis service errors), `minimum_data_size` (**default 100 bytes**), `require_justification_tags`, `custom_messages` (≤200 chars, with `learn_more_url` and language), and `verification` (per-OS `key` lists for verifying the agent). Feature flags are `cloud_only: true`, `dynamic_refresh: true` and `per_profile: true`. — [OnBulkDataEntryEnterpriseConnector.yaml](https://raw.githubusercontent.com/chromium/chromium/main/components/policy/resources/templates/policy_definitions/Miscellaneous/OnBulkDataEntryEnterpriseConnector.yaml)
- In CEP, blocking on paste and upload depends on the connector settings "Delay file upload" and "Delay text entry." Rule changes can take up to 24 hours to propagate. Scans can be stored by region (US/EU). Admins need the "View and Manage Chrome DLP rule" privilege, and connector policies must be configured first. — [Google help: CEP DLP](https://knowledge.workspace.google.com/admin/security/use-chrome-enterprise-premium-to-integrate-dlp-with-chrome?hl=en)
- Edge: saving the first Purview DLP or collection policy that targets unmanaged apps in Edge for Business makes the **Microsoft Edge management service automatically create** the Edge configuration policies, Intune policies and two security groups ("Purview DLP browser protection - included/excluded users"). They are read-only and stay in sync with Purview. Settings apply "when a user signs in to Microsoft Edge for Business on a managed device using their Entra ID credentials." — [Learn: Activate your DLP policy in Microsoft Edge](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-dlp-purview-configuration) (updated 2026-10-06)
- The auto-created Intune policies are named "Edge policy to block use of browsers where Purview DLP protections for unmanaged AI apps don't apply" and "...block use of unmanaged GenAI apps in browsers where in-browser protections don't apply." In Chrome, access to a set list of unmanaged GenAI apps is blocked. **Firefox and other browsers are blocked entirely.** The Edge setting is "Block use of cloud apps in browsers where Purview in-browser protections doesn't apply." — [same Learn page](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-dlp-purview-configuration)
- If automation fails, admins must "Sync now" in the M365 admin center, and activation can lag up to a day. — [same Learn page](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-dlp-purview-configuration)
- Endpoint DLP policy updates take "about an hour" to sync, and Authorized Groups changes take 24 hours. Device onboarding uses local scripts (≤10 machines), GPO, SCCM, Intune/MDM, VDI scripts, or Defender for Endpoint onboarding. — [Learn: Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- PAB is administered from the Prisma Access Browser management console (Strata Cloud Manager), which has GenAI Prompt Events and Data Protection Events (DLP) sections. — [Palo Alto TechDocs: PAB administration](https://docs.paloaltonetworks.com/content/techdocs/en_US/prisma-access-browser/administration.html) (table of contents only)

### Inferences
- Cipher's gateway console plays the role of the Google Admin console or Purview. Worth copying:
  - (a) per-URL enable/disable lists with tags;
  - (b) explicit `block_until_verdict` and fail-open/fail-closed (`default_action`) knobs;
  - (c) a minimum-size threshold, so tiny pastes skip scanning (Chrome defaults to 100 bytes);
  - (d) justification-required overrides;
  - (e) custom block messages with a learn-more link.
- Microsoft's "block unprotected browsers" automation shows the real answer to "the user switches browsers": the **endpoint agent must enforce browser allow-listing**, or at least detect AI-site access from browsers without the cipher extension.

### Gaps
- I could not confirm whether `local_user_agent` and `local_system_agent` can be configured through Chrome Enterprise Core (free) or need CEP licenses. `cloud_only` implies Google Admin console (CBCM) management, but the license requirement for local-agent providers is not stated in the YAML.
- Island's policy-delivery internals (signed policy bundles, polling vs push) are undocumented in public sources I found.

---

## 4. Detection approach

### Takeaway
All four rely on large libraries of **pattern-based detectors** (regex + checksum + keywords + proximity + confidence) and add **EDM** (hashed exact values), **fingerprinting** and **OCR**. The incumbents differentiate on **[ML]** trainable classifiers and named entities, which a regex-only cipher won't match. But Microsoft's own SIT model shows that regex + checksum + supporting keywords + proximity windows + confidence tiers is the core design, and cipher can reproduce it.

### Cited Findings
- Microsoft SIT model: custom SITs are defined by "patterns," "keyword evidence," "character proximity to evidence," and "confidence levels." A primary element "can be a regular expression with or without a checksum validation, a keyword list, a keyword dictionary, or a function." Supporting elements raise confidence (High/Medium/Low), and proximity is "the number of characters between primary and supporting element." Built-in SITs ship with "REGEX patterns, keywords, and confidence levels." — [Learn: EDM-based SITs](https://learn.microsoft.com/en-us/purview/sit-learn-about-exact-data-match-based-sits)
- Microsoft EDM: customer data is hashed with a salt, "only the hashed values are uploaded." Matching compares "one-way cryptographic hashes" and supports up to 100 million rows refreshed daily. A primary element must first be detected by an existing pattern SIT, then secondary fields are checked within proximity. Multi-token hashing covers names and addresses. EDM is supported for the DLP "Devices" location. — [Learn: EDM-based SITs](https://learn.microsoft.com/en-us/purview/sit-learn-about-exact-data-match-based-sits)
- Microsoft "Advanced classification" on endpoints enables Document Fingerprinting, EDM, **[ML]** Trainable classifiers and **[ML]** Named entities. — [Learn: Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- Microsoft OCR extends endpoint scanning to .jpg, .png, .tif, .tiff, .bmp and .jpeg. — [Learn: Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- The DSPM default policy "Block sensitive info from AI apps in Edge" "detects inline for a selection of common sensitive information types." Adaptive Protection (**[ML]/risk-scoring** from Insider Risk Management) can tighten blocks for elevated-risk users. — [Learn: DSPM for AI considerations](https://learn.microsoft.com/en-us/purview/ai-microsoft-purview-considerations)
- Google CEP conditions: predefined data types (e.g., "United States - Social Security Number"), "contains text string," "contains word," "matches regular expression," "matches words from a word list," custom detectors, and AND/OR/NOT combinators. Content limit: "up to 10 MB of text content in a file." — [Google help: CEP DLP](https://knowledge.workspace.google.com/admin/security/use-chrome-enterprise-premium-to-integrate-dlp-with-chrome?hl=en)
- Google OCR for images and PDFs on upload, download and print is "off by default" and must be enabled. — [Google help (search snippet)](https://support.google.com/a/answer/10104358)
- PAB uses "over 1,000 data classifiers" and automatic content redaction/masking. Detection is via Palo Alto Enterprise DLP. The ML share of those classifiers isn't stated. — [Palo Alto SASE blog](https://www2.paloaltonetworks.com/blog/sase/securing-genai-apps-in-your-web-browser.md)
- Chrome's local-agent protocol leaves detection entirely to the agent. The browser sends `text_content` (for paste) or `file_path` (for files) plus metadata (`url`, `filename`, `digest` SHA-256, `email`, `tab_title`). The agent returns `TriggeredRule{action, rule_name, rule_id}` per tag. — [analysis.proto](https://raw.githubusercontent.com/chromium/content_analysis_sdk/main/proto/content_analysis/sdk/analysis.proto)

### Inferences
- What cipher can replicate without ML: SIT-style detectors (regex + checksum such as Luhn, IBAN mod-97 or national-ID check digits, + keyword proximity window + confidence tiers + instance-count thresholds), keyword dictionaries, a salted-hash EDM equivalent (hash candidate tokens locally and compare against a hashed customer list, so raw values never reach cipher's cloud), simple document fingerprinting (shingle hashing), and secrets detection (API keys, private keys). A secrets-detector library is a strong angle for developer-heavy teams leaking code into Claude or Copilot.
- What cipher can't replicate: trainable classifiers, named-entity detection and adaptive risk scoring. Cipher should say so honestly and compete on precision and transparency of rules instead.
- Inline masking/redaction (PAB) is a UX worth copying in the extension: replace the matched span with a token instead of blocking the whole prompt.

### Gaps
- Island's detector library size and composition were not found in primary sources.
- I did not verify what share of PAB's "1,000+ classifiers" is ML.

---

## 5. Endpoint integration and handling outside the browser (and the Chrome local-agent protocol in detail)

### Takeaway
Microsoft is the only one of the four with a first-party **OS-level endpoint DLP agent** linked to the browser. Edge enforces natively, Chrome/Firefox get an extension, and the Windows/macOS agent handles clipboard, USB, print and desktop apps. Chrome instead hands content to **any third-party local agent** over a documented protobuf protocol on named pipes. That is the exact integration point for cipher's endpoint agent. Island and PAB handle "outside the browser" mostly by controlling what leaves the browser (copy-out to desktop apps) rather than by inspecting desktop apps.

### Cited Findings
**Chrome local content analysis: protocol details**
- Wrapper messages: `ChromeToAgent { request | ack | cancel }` and `AgentToChrome { response }`. — [analysis.proto](https://raw.githubusercontent.com/chromium/content_analysis_sdk/main/proto/content_analysis/sdk/analysis.proto)
- `ContentAnalysisRequest` fields:
  - `request_token` (unique per request)
  - `analysis_connector`
  - `request_data` (ContentMetaData: `url`, `filename`, `digest`, `csd` download info, `email` (may be empty if not signed in), `tab_title`, `print_metadata` {`printer_name`, `printer_type` CLOUD/LOCAL})
  - `tags`
  - `client_metadata.browser.machine_user` (omitted for profile-level scans)
  - `oneof content_data { text_content | file_path | print_data{handle,size} }`
  - `expires_at` (deadline, seconds since epoch)
  - `user_action_id` and `user_action_requests_count` (for grouping multi-file actions)
  - `reason`

  — [analysis.proto](https://raw.githubusercontent.com/chromium/content_analysis_sdk/main/proto/content_analysis/sdk/analysis.proto)
- `ContentAnalysisResponse { request_token, results[] { tag, status SUCCESS/FAILURE, triggered_rules[] { action REPORT_ONLY|WARN|BLOCK, rule_name, rule_id } } }`. — [analysis.proto](https://raw.githubusercontent.com/chromium/content_analysis_sdk/main/proto/content_analysis/sdk/analysis.proto)
- Chrome then sends `ContentAnalysisAcknowledgement { request_token, status SUCCESS|INVALID_RESPONSE|TOO_LATE, final_action ALLOW|REPORT_ONLY|WARN|BLOCK }`. The final action can differ from the agent's verdict if the response arrived too late or other requests in the same user action changed the outcome. `ContentAnalysisCancelRequests { user_action_id }` cancels pending scans. — [analysis.proto](https://raw.githubusercontent.com/chromium/content_analysis_sdk/main/proto/content_analysis/sdk/analysis.proto)
- The proto is `proto2` with `optimize_for = LITE_RUNTIME` and says Chromium's `connectors.proto` is the source of truth. — [analysis.proto](https://raw.githubusercontent.com/chromium/content_analysis_sdk/main/proto/content_analysis/sdk/analysis.proto)
- Print content is passed as a shared-memory `print_data.handle` (platform-specific scoped print handles in `agent/src/scoped_print_handle_*.cc`). Files are passed as a local path, not bytes. — [SDK agent/src](https://github.com/chromium/content_analysis_sdk/tree/main/agent/src); [analysis.proto](https://raw.githubusercontent.com/chromium/content_analysis_sdk/main/proto/content_analysis/sdk/analysis.proto)
- The policy's `verification` field (per-OS `key` lists) lets admins pin the agent's identity. — [OnBulkDataEntryEnterpriseConnector.yaml](https://raw.githubusercontent.com/chromium/chromium/main/components/policy/resources/templates/policy_definitions/Miscellaneous/OnBulkDataEntryEnterpriseConnector.yaml)

**Microsoft endpoint DLP linkage**
- Endpoint DLP runs on Windows 10/11, Windows Server 2019+ and the three latest macOS releases. Onboarding to Defender for Endpoint also onboards to DLP. — [Learn: Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- "Paste to supported browsers" evaluates the pasted content itself, and is GA on Windows and Preview on macOS. Settings include "Unallowed browsers," "Service domains" and "Sensitive service domain groups" on both OSes. — [Learn: Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- Copy-to-clipboard behavior: when the source file matches a Block rule, copying is blocked except within the same Office file. Copying from Notepad or any non-Office app with sensitive content is blocked. While a DLP-blocked file is open, copying from other files in the same app is restricted. Applies to redirected clipboards in AVD/Windows 365. — [Learn: Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- Limitation: "If data is never saved to a file on the local device, Endpoint DLP cannot scan or classify it." — [Learn: Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- Files are classified on create/modify. Offline Windows devices keep enforcing cached policies, and just-in-time protection blocks egress of never-evaluated files until evaluation completes. **Offline behavior and JIT are not supported on macOS.** — [Learn: Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- The Purview browser extension "is also required for Endpoint DLP policies on Windows when you use Chrome." — [Learn: DSPM for AI considerations](https://learn.microsoft.com/en-us/purview/ai-microsoft-purview-considerations)
- Purview can also take network-level signals via SASE/SSE partner integrations ("Detect sensitive info shared with AI via network"), with detection "dependent on the network partner implementation." — [Learn: DSPM for AI considerations](https://learn.microsoft.com/en-us/purview/ai-microsoft-purview-considerations)

**PAB / Island**
- PAB can allow copy/paste between sanctioned apps while blocking it to other apps **or desktop apps** (the browser owns its clipboard). — [Palo Alto docs](https://docs.paloaltonetworks.com/ai-access-security/administration/discover-risks-posed-by-genai-apps/discover-risks-posed-by-genai-apps-on-prisma-access-browser)

### Inferences
- **Concrete integration path for cipher on Windows:**
  1. Ship the cipher endpoint agent as a Content Analysis service provider. Link `liblcasdk` (C++), or reimplement the named-pipe and protobuf framing in Rust or Go from the BSD-licensed proto.
  2. Register it under a pipe name.
  3. Have the admin set `OnBulkDataEntryEnterpriseConnector` / `OnFileAttachedEnterpriseConnector` / `OnPrintEnterpriseConnector` with `service_provider: local_system_agent` (or `local_user_agent`), `block_until_verdict: 1`, and a `url_list` of AI domains tagged `dlp`.

  Chrome then hands cipher paste text, file paths and print data synchronously and shows the native block/warn UI. This covers paste, drag-drop, upload, print and download, but **not typed text**, so cipher's extension still has to handle typing and DOM-level submit. Edge is Chromium too and probably carries the same connector code, but I found no Edge documentation of third-party local agents (unverified).
- Respect `expires_at`. Chrome sends `TOO_LATE` acks when the agent is slow, so cipher's regex engine must answer in tens to hundreds of milliseconds, which favors a precompiled multi-pattern engine (Hyperscan or Rust `regex` RegexSet).
- Microsoft's "not saved to disk = not scanned" gap and the clipboard-source-file model show the limits of file-centric endpoint DLP. Cipher's agent could instead evaluate **clipboard content at paste time** into AI-capable desktop apps (ChatGPT desktop, Claude desktop, Copilot app), which Microsoft does not clearly cover.

### Gaps
- I did not verify whether Edge for Business accepts third-party local content analysis agents via equivalent policies.
- Chrome's exact handling when `block_until_verdict: 0` (async report-only) for local agents, and the timeout values, were not found.
- The macOS transport for Chrome local agents was not confirmed (see §1).

---

## 6. Pricing, licensing, positioning, and limitations (including extension vs enterprise browser)

### Takeaway
Pricing runs from **$6/user/month (Chrome Enterprise Premium)** to six-figure annual minimums for **Island**. Microsoft gates AI-app DLP behind E5-class Purview plus **pay-as-you-go** billing for non-Copilot AI apps. Every browser-centric approach shares one weakness: it only protects the browser it controls. Vendors answer with forced browser blocking (Microsoft, via Intune) or by adding extensions (Island, PAB). LayerX-style vendors argue extensions win on deployment friction and BYOD, but concede gaps such as watermarking and full session recording.

### Cited Findings
- Chrome Enterprise Premium costs **$6 per user per month**. Chrome Enterprise Core is free. Premium includes DLP, including for unsanctioned AI tools. — [Chrome Enterprise pricing](https://chromeenterprise.google/pricing/); [The Register via ciso2ciso](https://ciso2ciso.com/?p=127082)
- CEP DLP: "You must have the Chrome Enterprise Premium add-on for this feature." — [Google help: CEP DLP](https://knowledge.workspace.google.com/admin/security/use-chrome-enterprise-premium-to-integrate-dlp-with-chrome?hl=en)
- Microsoft: for AI apps other than Microsoft 365 Copilot and Facilitator, organizations must set up **pay-as-you-go billing**. The Edge integration needs an Edge configuration policy, and third-party GenAI monitoring needs devices onboarded to Purview. — [Learn: DSPM for AI considerations](https://learn.microsoft.com/en-us/purview/ai-microsoft-purview-considerations)
- Microsoft's file-upload inline protection requires **Intune-managed Windows devices**. — [handsontek MC mirror](https://m365admin.handsontek.net/?p=17558)
- Island does not publish pricing. Reported figures conflict: an AWS Marketplace 12-month package at $250,000, enterprise plans "starting at $500,000/yr," and MSP or reseller per-user rates of $50–$825/user/month (one reseller lists $100/user/month). These come from a competitor (Venn), so verify before relying on them. — [Venn: Island pricing](https://www.venn.com/learn/island-browser/island-browser-pricing/); [Venn: Island review](https://www.venn.com/learn/island-browser-review); [Somewhere reseller](https://somewhere.com/browser)
- PAB is positioned as part of Prisma SASE ("SASE-native secure browser"), mainly for unmanaged and BYOD devices. — [PANW 10-K FY2024](https://www.sec.gov/Archives/edgar/data/1327567/000132756724000029/panw-20240731.htm); [vsdaily](https://vsdaily.com/palo-alto-networks-launches-worlds-first-sase-native-secure-browser-expands-prisma-sase-with-ai-powered-protections/)
- Edge limitations: for unmanaged AI apps in Edge, only text prompts (not responses) are captured. Users in the Edge-block policies are "blocked from using unprotected browsers." Firefox and other browsers are blocked outright, and Chrome loses access to a list of GenAI apps. — [Learn: DSPM for AI considerations](https://learn.microsoft.com/en-us/purview/ai-microsoft-purview-considerations); [Learn: Activate DLP in Edge](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-dlp-purview-configuration)
- Microsoft endpoint gaps: macOS paste-to-browser is Preview, macOS lacks offline enforcement and JIT, and unsaved content is not scanned. — [Learn: Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- LayerX (extension vendor) argues enterprise browsers bring vendor lock-in, operational friction and forced workflow changes. It claims the Prisma extension is "primarily a visibility add-on" with "no true DLP." **[vendor, competitor-biased]** — [LayerX vs Prisma Access Browser Extension](https://layerxsecurity.com/?p=4558); [LayerX or Island](https://layerxsecurity.com/?p=2148); [LayerX or Talon](https://layerxsecurity.com/?p=2415); [LayerX: The Enterprise Browser Extension](https://layerxsecurity.com/?p=2761)
- A 2026 third-party comparison rates the extension model strongest for no-new-browser and BYOD/contractor deployment, but says it "cannot match native watermarking or full session recording." It also says frequent extension updates can disrupt locked-down VDI and kiosk setups. — [cipherssecurity.com, Aug 2026](https://cipherssecurity.com/enterprise-browser-security-platform-2026/); [toolradar LayerX](https://toolradar.com/tools/layerx)
- One source says LayerX was acquired by Akamai in July 2026. **Unverified, single source.** — [cipherssecurity.com](https://cipherssecurity.com/enterprise-browser-security-platform-2026/)
- An analyst-style taxonomy groups extension products, managed enterprise editions of Chrome and Edge, and cloud-isolated browsers as separate categories. Gartner reportedly lists LayerX under both "Secure Enterprise Browser" and "AI Usage Control." — [Expert Insights: Island alternatives (2026)](https://expertinsights.com/web-security/the-top-alternatives-to-island); [toolradar](https://toolradar.com/tools/layerx)

### Inferences
- **Positioning for cipher:** the market is split between expensive full-browser platforms (Island, PAB) and suite-bundled native controls (Microsoft E5 plus PAYG, Google $6). The open niche is a cheap, vendor-neutral, transparent, rule-based tool that works across Chrome, Edge and Firefox and **also covers desktop AI apps and API/CLI traffic via the gateway**. The browser-only products cover that last area weakly.
- Cipher's architecture (extension + endpoint agent + gateway) maps directly onto the strongest pieces of each:
  - typed-prompt and DOM hooks (Edge, Island);
  - a native Chrome Connector local agent for paste, upload and print with browser-rendered block UI (Chrome SDK);
  - endpoint-level browser allow-listing so users can't route around it (Microsoft's Intune automation);
  - network enforcement for non-browser traffic (Purview SASE integration).
- The main risk of extension-only enforcement is users switching to an unprotected browser or a desktop app, or disabling the extension. Mitigations: force-install the extension via `ExtensionInstallForcelist`, have the endpoint agent detect AI-domain connections from processes without cipher hooks, and block AI domains at the gateway for non-compliant clients.

### Gaps
- I found no official Microsoft per-user pricing for Edge inline AI DLP (the PAYG meter rates were not retrieved), and no current confirmation of whether the E5 / E5 Compliance / E5 Information Protection & Governance SKU is required.
- I found no published PAB list pricing (it is bundled with Prisma Access/SASE).
- No independent (non-vendor) benchmark exists comparing the bypass resistance of extension and enterprise-browser approaches.
