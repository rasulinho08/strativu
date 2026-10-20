# SASE / Secure Web Gateway Vendors' GenAI Data Protection (Netskope, Zscaler, Palo Alto Prisma Access, Cloudflare) — relevance for "cipher"

Research date: 2026-10-20. Scope: how network-based AI-DLP works (steering, TLS inspection, app catalogs, prompt/response parsing), detection methods, LLM/API gateways, positioning and limitations. Most material is vendor-authored (marketing/docs) or competitor-authored (dope.security, DeepInspect); this is flagged inline. Items marked **[ML]** use machine learning or LLM classification, which cipher (regex/rules only) will not have.

## 1. Traffic steering and endpoint client implementation

### Takeaway
All three big SSE vendors use a thin endpoint "steering" client that tunnels selected traffic to a cloud PoP, where TLS decryption and DLP actually run. On Windows that means NDIS LWF/WFP drivers or a TUN/route-based adapter. On macOS it means a Network Extension (system extension, MDM-approved). The client itself is mostly not the inspection engine. Inspection happens in the cloud, which is the opposite of cipher's on-device and in-browser model.

### Cited Findings
- **Zscaler Z-Tunnel 2.0** uses DTLS or TLS to send packets to the Zscaler service and can therefore carry all ports and protocols. Z-Tunnel 1.0 is the older HTTP CONNECT-style tunnel for web traffic. — [Zscaler Help: About Z-Tunnel 1.0 & 2.0](https://help.zscaler.com/unified/about-z-tunnel-1-0-z-tunnel-2-0)
- In Zscaler's transport, DTLS runs over UDP 443 and TLS over TCP 443, with configurable timeouts before falling back from one to the other. If control and data connections land on different servers, Z-Tunnel 2.0 can fail and fall back to Z-Tunnel 1.0. — [Zscaler Help: forwarding profiles](https://help.zscaler.com/z-app/configuring-forwarding-profiles-zscaler-app); [Zscaler Help: migrating to Z-Tunnel 2.0](https://help.zscaler.com/unified/migrating-z-tunnel-1-0-z-tunnel-2-0)
- To enable Z-Tunnel 2.0, set Tunnel Driver Type to "Packet Filter Based," mode to Tunnel, and version to Z-Tunnel 2.0 in the forwarding profile. On macOS, admins must push a system extension profile via MDM and configure firewall settings. — [Zscaler Help: Windows filter driver](https://help.zscaler.com/unified/using-windows-filter-driver-zscaler-client-connector); [Zscaler Help: migrating](https://help.zscaler.com/unified/migrating-z-tunnel-1-0-z-tunnel-2-0)
- Zscaler Client Connector internals (third-party exam-prep page, not verified against Zscaler docs):
  - Windows processes: `ZSATray.exe` (user UI), `ZSATunnel.exe` (SYSTEM service handling crypto, policy, Trusted Network Detection, and a local proxy on 127.0.0.1:9000), `ZSAUpdater.exe`.
  - Windows kernel drivers: `ZSAFilter` (NDIS 6.x Lightweight Filter) and `ZSAUdpFilter` (WFP).
  - Two Windows interception modes: Route-Based (virtual TUN adapter plus routing-table changes, which can clash with full-tunnel VPNs) and Packet Filter (LWF/WFP, coexists better with VPNs).
  - macOS: `com.zscaler.service` launchd root daemon plus a Network Extension (NEAppProxy / PacketTunnel).
  - Linux: TUN plus iptables.
  - Deployment and tamper protection: MSI/PKG via Intune/SCCM/Jamf, a `STRICTENFORCEMENT` fail-closed switch, uninstall/disable passwords, and OTP-based temporary bypass.
  — [OpenExamPrep ZCC architecture](https://open-exam-prep.com/study-guides/zscaler-zdta/zscaler-client-connector/zcc-architecture)
- **Netskope Client** handles roughly 90% of customers' inline traffic, per Netskope's community "in depth" post.
  - It supports a "Direct mode"/"DNS mode" steering style.
  - It supports process-level bypass. The example is a developer S3 CLI that doesn't trust the Netskope certificate.
  - It does certificate management natively, so customers don't need in-house PKI for the Netskope CA.
  - Identity is attributed at the endpoint.
  - It shows customizable user notifications that can ask users to justify an action.
  — [Netskope Community: In depth – the Netskope Client](https://community.netskope.com/next-gen-swg-2/in-depth-the-netskope-client-your-primary-steering-mechanism-7822)
- Netskope offers two steering-exception modes:
  - "Bypass + Direct": traffic goes straight from the device.
  - "Bypass + Tunnel": the client tunnels the traffic but the proxy doesn't inspect it.
  — [Dell KB: Netskope client communication](https://www.dell.com/support/kbdoc/en-us/000123997/how-to-configure-netskope-client-communication)
- In Netskope's newer decoupled model, steering exceptions are only steering bypasses, and the proxy evaluates SSL and RTP policies independently. Steering bypasses (direct to destination) do not show up in Skope IT. Only proxy bypasses generate events. — [Netskope Docs: migration guide for steering configurations](https://docs.netskope.com/en/migration-guide-for-steering-configurations/)
- Competitor characterisation (dope.security, dated 2026-09-16, promotional): the Netskope Client is "not a security agent." It tunnels in-scope traffic (by app, domain, or category) to the nearest NewEdge PoP and adds identity and posture (disk encryption, OS version, AV). TLS decryption, URL filtering, and DLP all happen in NewEdge. — [dope.security: What the Netskope Client actually does](https://dope.security/post/netskope-client-2026)
- Other steering methods mentioned across vendor docs are GRE/IPsec tunnels from sites and browser/PAC policies. Zscaler's QUIC guidance describes separate control points for "GRE/IPsec tunnels," "Z App traffic," and browser policy. — [Zscaler Help: Managing the QUIC protocol](https://help.zscaler.com/zia/managing-quic-protocol)

### Inferences
- The incumbents' clients are "steer-to-cloud" agents. Their complexity lives in packet capture (WFP/NDIS/NE), tunnel resilience, and VPN coexistence, not in content parsing. A small team can avoid most of this by inspecting inside the browser extension (pre-encryption DOM/fetch hooks) and only using a local proxy or Network Extension for desktop apps.
- Cipher's gateway would mirror the SSE PoP role. If it runs as a cloud or on-prem proxy, it inherits the same TLS-interception, pinning, and latency problems described below.
- Netskope documents both direct-mode/DNS steering and tunnel steering. The exact protocol details for its tunnel weren't confirmed in this pass.

### Gaps
- No primary source found for Netskope Client's Windows driver type or its macOS Network Extension type (NETransparentProxy vs PacketTunnel vs DNSProxy). The Netskope docs pages could not be fetched.
- Job postings (implementation languages such as C/C++/Rust/Swift) were not searched within the tool budget. No sourced claims on client languages.
- Zscaler's macOS Network Extension type comes only from a third-party exam-prep page.

## 2. TLS interception, certificate pinning, protocol handling, and AI-app payload parsing

### Takeaway
Network AI-DLP depends on MITM TLS with an enterprise root CA. The vendors cope with protocols they can't inspect by blocking QUIC so browsers fall back to TCP/TLS, and they cope with pinned apps by bypassing them, which leaves those flows uninspected. Desktop AI apps such as the ChatGPT macOS app are an acknowledged weak spot, and the usual workaround is to push users to the browser. "API-level" understanding comes from per-app parsers maintained by the vendor (Cloudflare explicitly reassembles ChatGPT's SSE stream).

### Cited Findings
- Netskope ships a predefined list of certificate-pinned apps that bypass the Netskope cloud by default. Admins can add custom pinned apps as steering exceptions. Bypassed traffic is not inspected. — [Netskope Docs: Certificate Pinned Applications](https://docs.netskope.com/en/certificate-pinned-applications.html) (summary via search; the page body didn't render on fetch); [Dell KB](https://www.dell.com/support/kbdoc/en-us/000123997/how-to-configure-netskope-client-communication)
- A Netskope-related FAQ (via a third-party summary) says desktop agents that use certificate pinning, such as the ChatGPT macOS app, are "more challenging," and recommends steering users to browser versions. — search-result summary of [Netskope for ChatGPT and Generative AI](https://www.netskope.com/solutions/netskope-for-chatgpt-and-generative-ai) / [securityscientist Q&A](https://answers.securityscientist.net/q/23949/how-does-netskope-handle-genai-and-llm-security). I didn't verify this on the primary page, so treat it as unconfirmed.
- Competitor claim (dope.security): Netskope and Zscaler customers maintain bypass lists for pinned traffic, which goes uninspected. Examples given are Microsoft 365, WebEx, and Dropbox. dope.security instead "substitutes certificates locally on the device." — [dope.security](https://dope.security/post/netskope-client-2026)
- **QUIC/HTTP3:** Zscaler says QUIC cannot be inspected when SSL inspection is on, so best practice is to block QUIC. QUIC then falls back to TCP. — [Zscaler Help: Managing the QUIC protocol](https://help.zscaler.com/zia/managing-quic-protocol)
- Netskope recommends blocking QUIC with a firewall rule so connections fall back to HTTPS and can be inspected. It warns not to block UDP/443 to Netskope's own IPs, because the client may use DTLS over UDP/443. — [Netskope Community: A "QUIC" primer](https://community.netskope.com/next-gen-swg-2/a-quic-primer-to-how-netskope-handles-the-quick-udp-internet-connections-protocol-928)
- One practitioner write-up (anecdotal) reports that silently dropped QUIC can take up to about 30 seconds to fail over to TCP, so explicit rejection is better. It also says pinned clients' TLS teardown inside QUIC often shows up as an unexplained flow termination. — [dev.to: The edge egress blind spot](https://dev.to/instatunnel/the-edge-egress-blind-spot-managing-outbound-http3-and-ca-pinning-in-enterprise-networks-11nb)
- **Payload parsing (Cloudflare, most detailed public description):**
  - GenAI web apps use "undocumented and private APIs," which makes inspection hard.
  - Cloudflare maps HTTPS requests to apps and operations such as ChatGPT `SendPrompt` or "share." Part of this "operation mapping" came from the Kivera acquisition.
  - The DLP engine keeps per-vendor logic for each app's body format, decoders, and prompt/response field locations.
  - For ChatGPT it reassembles `text/event-stream` (SSE) response deltas into the full response.
  - It extracts the prompt, the response, and a conversation ID.
  - Supported apps: Gemini, ChatGPT, Claude, Perplexity (web only).
  — [Cloudflare blog: AI prompt protection (2025-08-25, modified 2026-07-15)](https://blog.cloudflare.com/ai-prompt-protection/); [Cloudflare changelog](https://developers.cloudflare.com/changelog/2025-08-25-ai-prompt-protection)
- The Cloudflare post does not address WebSocket, HTTP/2, or QUIC specifics. — [Cloudflare blog](https://blog.cloudflare.com/ai-prompt-protection/)
- Zscaler offers "input prompt visibility," where admins see the actual prompt sent to the AI app, captured by the inline proxy. The capture mechanism is not described. — [Zscaler blog, 2024-07-09](https://www.zscaler.com/blogs/product-insights/new-ai-innovations-supercharge-data-protection)
- Palo Alto AI Access Security can block or allow specific functions within a GenAI app. DLP inspection covers "all supported GenAI apps (~30)," a set smaller than the 600+ app catalog. — [PANW docs: Introducing AI Access Security](https://docs.paloaltonetworks.com/ai-access-security/getting-started/introducing-ai-access-security); [PANW LIVEcommunity FAQ](https://live.paloaltonetworks.com/t5/ai-access-security-articles/ai-access-security-faqs/ta-p/596226)

### Inferences
- Deep prompt and response inspection covers far fewer apps than discovery does. PANW's figures show this: about 30 DLP-parsed apps against a 600+ app catalog. A cipher-sized team can realistically keep parsers for the four target apps (ChatGPT, Claude, Gemini, Copilot), and those parsers will break whenever the apps change their private APIs. In a browser extension, those payloads can be read before encryption, with no CA required.
- ChatGPT's SSE responses show that response inspection needs stream reassembly. Prompt-only (request-side) blocking is much simpler and covers the "leak" use case.
- Desktop and Electron AI apps (ChatGPT desktop, Claude desktop, Copilot) are a gap the incumbents mostly close by policy ("use the browser"), not technically. Cipher's endpoint agent could differentiate here, but would face the same pinning problem if it uses MITM. Alternatives (inference): block or limit the desktop apps, or use OS accessibility/clipboard hooks.

### Gaps
- No primary source confirmed exactly which AI desktop apps pin certificates. That the ChatGPT macOS app pins comes only from a secondary summary.
- No vendor source found describing WebSocket or HTTP/2 handling for GenAI payloads (for example, Gemini's batchexecute format or Copilot's WebSocket chat).
- Root CA deployment steps (MDM profile, GPO) weren't retrieved from primary docs within budget.

## 3. AI app catalogs, risk scoring, shadow AI discovery, and enforcement actions

### Takeaway
Every vendor pairs a large GenAI app catalog with risk scores (used for shadow-AI discovery and sanctioned/unsanctioned policy) with in-app activity controls. The available actions are block, coach-with-justification, DLP block, and isolate. Redaction in transit is rarely documented for web SSE traffic.

### Cited Findings
- Netskope's CASB layer discovers GenAI apps in use and scores them with the Cloud Confidence Index. DLP scanning applies to what users type or upload. Coaching pop-ups can require a justification when users open GenAI sites. — search summary referencing [Netskope for ChatGPT and Generative AI](https://www.netskope.com/solutions/netskope-for-chatgpt-and-generative-ai) and [sacra.com](https://sacra.com/chat/h/265c3bc4-bd8f-4830-b92f-91ead5e35a2e/)
- Netskope DLP is marketed as catching sensitive data going to ChatGPT, including personal instances, with "several enforcement options to stop and limit the upload and posting" and "real-time coaching." — [Netskope: ChatGPT and GenAI solution](https://www.netskope.com/solutions/netskope-for-chatgpt-and-generative-ai)
- Netskope reportedly announced real-time, agentless DLP for Claude Enterprise. The allow/deny verdict (with reason) returns before inference, and coaching is extended into the prompt path. This was in private beta as of the source date. — [Netskope press page (search snippet only; page did not render)](https://www.netskope.com/?p=76337). Treat as unconfirmed detail.
- Zscaler AI controls:
  - Shadow AI discovery via the inline proxy.
  - DLP blocking across GenAI interactions.
  - Rendering AI apps in Browser Isolation so prompts work while clipboard uploads are restricted, and disabling cut, paste, and download in the isolated session.
  — [Zscaler: GenAI security solution](https://www.zscaler.com/solutions/generative-ai-security); [Zscaler blog](https://www.zscaler.com/blogs/product-insights/new-ai-innovations-supercharge-data-protection)
- Palo Alto AI Access Security:
  - Catalog of 600+ GenAI apps, risk-scored across 60+ AI-specific attributes.
  - Policy by user group for sanctioned, unsanctioned, or tolerated apps.
  - Block or allow specific in-app functionality.
  - Requires Strata Logging Service.
  — [PANW docs: Introducing AI Access Security](https://docs.paloaltonetworks.com/ai-access-security/getting-started/introducing-ai-access-security); [PANW FAQ](https://live.paloaltonetworks.com/t5/ai-access-security-articles/ai-access-security-faqs/ta-p/596226)
- PANW also surfaces GenAI risk via Prisma Browser, its enterprise browser. — [PANW docs: Discover risks on Prisma Browser](https://docs.paloaltonetworks.com/ai-access-security/administration/discover-risks-posed-by-genai-apps/discover-risks-posed-by-genai-apps-on-prisma-access-browser)
- Cloudflare builds guardrails from Gateway HTTP policies with "application granular controls." An example is blocking a sensitive prompt on ChatGPT's SendPrompt action, scoped by identity group. An optional setting captures full prompt logs. — [Cloudflare changelog](https://developers.cloudflare.com/changelog/2025-08-25-ai-prompt-protection); [Cloudflare blog](https://blog.cloudflare.com/ai-prompt-protection/)

### Inferences
- Table-stakes features buyers will expect from cipher: a GenAI app list with basic risk attributes (data retention, training-on-input, SOC2, region), shadow-AI discovery reports, and per-action policies (allow, coach plus justification, block). In-browser redaction (rewriting the prompt before send) is a plausible differentiator, because I found no network vendor documenting inline redaction of prompts to consumer web apps.
- Browser isolation (Zscaler) and enterprise browsers (PANW Prisma Browser) show that incumbents are moving toward browser-layer control, which supports cipher's extension-first approach.

### Gaps
- No primary documentation found for Netskope's specific GenAI app-instance controls (for example, distinguishing corporate from personal ChatGPT accounts by tenant header) or for inline redaction.
- Exact attribute list for PANW's 60+ AI risk attributes not retrieved.

## 4. Detection: regex/EDM/IDM/fingerprinting/OCR vs ML/LLM classification

### Takeaway
The incumbents layer **[ML]** classifiers and, increasingly, LLM-based prompt-topic classification on top of classic DLP (data identifiers/regex, EDM, document fingerprinting/IDM, OCR). Cloudflare's AI prompt protection is fully LLM-based for topics, but its DLP profiles still include classic detection entries. A regex/rules-only product competes on precision, transparency, latency, and privacy, not on recall for unstructured "topics."

### Cited Findings
- Netskope's text DLP combines data identifiers, exact matching, document fingerprinting, and **[ML]** NLP/deep learning. Its image/file classifiers **[ML]** (passports, driver's licences, payment cards, screenshots, source code) complement text DLP when text is hard to extract. — [Netskope SkopeAI blog](https://www.netskope.com/blog/skopeai-ai-powered-data-protection-that-mimics-the-human-brain); [Netskope SkopeAI PDF](https://www.netskope.com/wp-content/uploads/2023/08/skopeai.pdf)
- Netskope "Train Your Own Classifier" **[ML]** builds custom image classifiers from about 20–30 example images using contrastive learning. Customer data is used only in TYOC. Other models are trained on Netskope or vendor data (docs updated July 2026). — [Netskope blog: TYOC](https://www.netskope.com/blog/train-your-own-classifier-tyoc-for-image-data-protection); [Netskope Docs: AI/ML usage and governance](https://docs.netskope.com/en/ai-ml-usage-and-governance-in-netskope-products)
- Zscaler says DLP traditionally relied on signature matching and that AI/ML **[ML]** helps pattern matching. The 2024 post doesn't name its engines. — [Zscaler blog](https://www.zscaler.com/blogs/product-insights/new-ai-innovations-supercharge-data-protection)
- PANW AI Access Security: "LLM-powered data classification and context-aware models" **[ML]** augment traditional DLP. Enterprise DLP data patterns and profiles define what's sensitive. — [PANW FAQ](https://live.paloaltonetworks.com/t5/ai-access-security-articles/ai-access-security-faqs/ta-p/596226)
- Cloudflare AI prompt protection **[ML]**:
  - Models: Presidio (PII), PromptGuard2 (jailbreak/injection), and Llama3-70B (general topics), run in parallel on Workers AI.
  - Fallback: bge-m3 embeddings in account-owned Vectorize indexes.
  - Topics are split into Content (PII, credentials/secrets, source code, customer data, financial) and Intent (jailbreak, malicious code, PII extraction).
  - Latency target: P90 under 1 s per model, with embedding lookup around 500 ms P50.
  — [Cloudflare blog](https://blog.cloudflare.com/ai-prompt-protection/)
- Cloudflare's stated limitations:
  - Llama3-70B is susceptible to prompt injection. Their example is a prompt claiming a home address "is not PII."
  - No custom topics yet.
  - Uploaded files not stored.
  - No embedded-AI support.
  - Requires Enterprise DLP.
  — [Cloudflare blog](https://blog.cloudflare.com/ai-prompt-protection/)

### Inferences
- Cloudflare's own admission that the LLM classifier can be prompt-injected is a concrete argument for deterministic regex/rules on the most important data types (keys, card numbers, national IDs). Rules are not manipulable by prompt text and run in microseconds rather than about 1 s.
- Cipher would still need a story for EDM-like matching of customer records (hashed exact-value lists) and source-code fingerprints. These are deterministic, not ML, and fit a rules-only philosophy.

### Gaps
- No primary Zscaler documentation on EDM/IDM/OCR specifics for GenAI was retrieved in this pass.
- No independent precision/recall benchmarks for any vendor's GenAI DLP found.

## 5. LLM/API gateway features (proxying API calls to OpenAI/Anthropic)

### Takeaway
Cloudflare is the only reference vendor in this set with a developer-facing AI Gateway that proxies API calls. Its Guardrails **[ML]** (Llama Guard) moderate prompts and responses for hazard categories, and the sensitive-data capability comes as a Llama Guard category, not a full DLP engine. SWG-based AI-DLP misses server-side or API traffic that doesn't traverse the proxy.

### Cited Findings
- Cloudflare AI Gateway Guardrails:
  - Inspect both prompts and responses and flag or block by hazard category (violence, hate, sexual content, etc.).
  - Configurable as prompt-only, response-only, or both.
  - Powered by Llama Guard **[ML]**.
  - Cloudflare notes Llama Guard can help protect sensitive data such as addresses, SSNs, and card numbers (per OWASP).
  - Launched 2025-02-26.
  — [Cloudflare blog: Guardrails in AI Gateway](https://blog.cloudflare.com/guardrails-in-ai-gateway/); [Cloudflare Docs: AI Gateway Guardrails](https://developers.cloudflare.com/ai-gateway/guardrails/); [changelog 2025-02-26](https://developers.cloudflare.com/changelog/2025-02-26-guardrails/)
- Competitor claim (DeepInspect): an internal service calling the OpenAI API directly is not seen by Netskope's web-traffic policies. This is a vendor-biased illustration, not an independent test. — [DeepInspect vs Netskope](https://www.deepinspect.ai/blog/deepinspect-vs-netskope-ai)
- Cloudflare's prompt-log approach encrypts logs with a customer-provided public key, so Cloudflare cannot read prompt content. — [Cloudflare blog](https://blog.cloudflare.com/ai-prompt-protection/)

### Inferences
- A cipher "gateway" pointed at the OpenAI/Anthropic APIs (base-URL swap) could apply the same regex rules to API traffic. This would cover developer and agent use that SWGs miss, with no TLS MITM, since the client deliberately targets the gateway.
- Customer-key-encrypted prompt logs are a good privacy pattern to copy: only the customer can read captured prompts.

### Gaps
- Could not confirm the current scope of Cloudflare "Firewall for AI" (WAF-side LLM protection) or whether Cloudflare DLP profiles can be applied directly in AI Gateway. Not retrieved within budget.
- No sourced data on Zscaler, Netskope, or PANW offering an API-key-swap LLM gateway, as distinct from AI-runtime/agent security products.

## 6. Pricing/positioning and known limitations (latency, privacy, breakage)

### Takeaway
Netskope, Zscaler, and PANW are the 2025 Gartner SSE MQ Leaders, and Cloudflare is a Niche Player. GenAI DLP is sold as an add-on to large enterprise SSE/SASE suites (Cloudflare's version requires Enterprise DLP). Known weaknesses: decryption latency, pinned-app and desktop-app blind spots, QUIC fallback delays, steering/tunnel breakage, and privacy concerns from logging full prompts.

### Cited Findings
- Gartner MQ for SSE 2025 (May 2025):
  - Leaders: Zscaler, Netskope, and Palo Alto Networks. Zscaler ranks highest on Ability to Execute.
  - Netskope and Zscaler have been Leaders all four years.
  - Fortinet is a Challenger.
  - Niche players include Cloudflare, iboss, Versa, Broadcom, and Skyhigh.
  — [CRN Asia](https://www.crnasia.com/news-network/2025/zscaler); [Zscaler press release via Barchart](https://www.barchart.com/story/news/32551492/zscaler-recognized-as-a-leader-in-the-2025-gartner-magic-quadrant-for-security-service-edge)
- PANW claims to be the only Leader across the SSE, Single-Vendor SASE, and SD-WAN MQs (vendor claim). — [PANW Gartner page](https://www.paloaltonetworks.com/sase/gartner-sse-mq-leader-2025)
- Cloudflare AI prompt protection is in beta and requires Enterprise-level DLP. — [Cloudflare blog](https://blog.cloudflare.com/ai-prompt-protection/)
- Competitor claims (dope.security, unsourced or partly sourced):
  - Netskope SLA figures: under 10 ms for undecrypted traffic vs 50 ms with decryption.
  - FAQ estimates: about 40–80 ms near a PoP and 150–400 ms for distant users.
  - Friction points: tunnel drops, bypass lists, captive portals, network transitions.
  - A Netskope management-plane incident affecting all regions in May 2026.
  - Netskope "AI Guardrails" shipped April 2026.
  — [dope.security](https://dope.security/post/netskope-client-2026). Treat all as unverified.
- Process-level bypass exists because developer tools (for example, S3 CLI) don't trust the inspection CA, which is a routine breakage source. — [Netskope Community](https://community.netskope.com/next-gen-swg-2/in-depth-the-netskope-client-your-primary-steering-mechanism-7822)
- QUIC must be blocked for inspection, and badly configured drops can add up to about 30 s fallback delay (anecdotal). — [Zscaler Help](https://help.zscaler.com/zia/managing-quic-protocol); [dev.to](https://dev.to/instatunnel/the-edge-egress-blind-spot-managing-outbound-http3-and-ca-pinning-in-enterprise-networks-11nb)

### Inferences
- Positioning for cipher: "lightweight, deterministic, on-device AI-DLP for teams without a SASE," or "a complement to SASE for desktop/Electron apps and pre-encryption browser inspection." Competing head-on with the full suites is unrealistic. Their GenAI-DLP lives inside multi-product enterprise contracts.
- Privacy: incumbents capture full prompts in a third-party cloud. Cipher's local evaluation (only metadata or redacted matches leave the device) is a real differentiator, especially in the EU.

### Gaps
- No public pricing found for Netskope, Zscaler, or PANW GenAI/AI Access add-ons, or for Cloudflare Enterprise DLP. These are quote-based, and no reliable per-user figures were found.
- The 2026 Gartner SSE MQ (if published) was not found in this pass. The latest confirmed is May 2025.
- No independent latency measurements for GenAI-specific inspection found.
