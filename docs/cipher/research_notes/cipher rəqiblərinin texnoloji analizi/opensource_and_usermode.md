# Open-source references and user-mode OS techniques for "cipher" (endpoint + browser AI-DLP, rule/regex-based, Rust core)

Research date: 2026-10-20. Method: official docs (learn.microsoft.com, developer.apple.com JSON doc endpoints, developer.chrome.com, MDN, man7, kernel.org), GitHub repo pages, crates.io / PyPI APIs (live version/licence data pulled 2026-10-20). The GitHub REST API was not reachable from this environment, so star counts/last-commit dates come from scraped repo pages where shown; GitHub "Releases" sections often rendered empty in scrapes, so release dates are taken from crates.io/PyPI where possible. Items labelled "prior knowledge" were NOT re-verified this session.

## Q1. Microsoft Presidio: what is it, and which recognizers are pure regex/checksum vs NLP/ML?

### Takeaway
Presidio (MIT, Python) is the best open catalogue of PII recognizers: almost every structured entity (credit card, IBAN, national IDs for ~20 countries) is regex + context words + checksum/validation and can be ported to Rust without ML; only PERSON / LOCATION / NRP and the medical entities depend on NER/custom NLP logic. The project has moved from Microsoft to a new "Data Privacy Stack" organisation and is still releasing (2.2.364, July 2026).

### Cited Findings
- Repo now lives at github.com/data-privacy-stack/presidio; README says "Presidio has moved to a new home!" and links a transition document (details/date not shown on the page). Licence MIT; language Python; components: Analyzer, Anonymizer, Image-Redactor (incl. DICOM), Structured. The Analyzer detects PII using "Named Entity Recognition, regular expressions, rule based logic, and checksum." — [GitHub data-privacy-stack/presidio](https://github.com/data-privacy-stack/presidio)
- Old docs URL microsoft.github.io/presidio redirects to data-privacy-stack.github.io → presidio.dataprivacystack.org — [Presidio docs redirect](https://microsoft.github.io/presidio/supported_entities/)
- Latest PyPI release presidio-analyzer 2.2.364, uploaded 2026-07-22, licence MIT — [PyPI presidio-analyzer](https://pypi.org/project/presidio-analyzer/)
- Detection-method legend on the supported-entities page: P = pattern, C = context, K = checksum, V = validation, L = custom logic, N = NER model — [Presidio supported entities](https://presidio.dataprivacystack.org/supported_entities/)
- Global entities: CREDIT_CARD (P,K), CRYPTO (P,C,K; Bitcoin only), DATE_TIME (P,C), EMAIL_ADDRESS (P,C, RFC-822 validation), IBAN_CODE (P,C,K), IP_ADDRESS (P,C), MAC_ADDRESS (P,C), URL (P,C, TLD validation), MEDICAL_LICENSE (P,C,K), PHONE_NUMBER (L,P,C), NRP/LOCATION/PERSON (L,C) — [Presidio supported entities](https://presidio.dataprivacystack.org/supported_entities/)
- Country recognizers (all P+C, many +K): USA (US_BANK_NUMBER, US_DRIVER_LICENSE, US_ITIN, US_MBI, US_NPI[K], US_PASSPORT, US_SSN), UK (NHS[K], NINO, passport, postcode, driving licence[V], vehicle reg[V]), Spain (NIF[K], NIE[K], passport), Italy (fiscal code[K], VAT[K], driver licence, passport, ID card), Poland PESEL[K], Singapore (NRIC/FIN, UEN[K]), Australia (ABN, ACN, TFN, Medicare – all K), India (PAN, Aadhaar[K], vehicle reg[K], voter, passport, GSTIN[V]), Finland personal ID[L], Korea (driver licence, FRN, BRN, RRN [L], passport), Nigeria (NIN[K], vehicle reg), Philippines TIN[K], Canada SIN[K, Luhn], Sweden (organisationsnummer, personnummer [K]), South Africa ID[K], Thailand TNIN[L], Turkey (national ID[K], licence plate with province validation), Germany (tax ID[K, ISO 7064 Mod 11,10], social security[K], health insurance[K], tax number, passport, ID card, KFZ, Handelsregister, PLZ – PLZ flagged high-FP, base confidence 0.05) — [Presidio supported entities](https://presidio.dataprivacystack.org/supported_entities/)
- Medical/clinical entities (MEDICAL_DISEASE_DISORDER, MEDICAL_MEDICATION, … 8–9 types) are NER-only and require the `transformers` extra (default model blaze999/Medical-NER) — [Presidio supported entities](https://presidio.dataprivacystack.org/supported_entities/)

### Inferences
- For a no-ML product, cipher can port Presidio's pattern + context-word + checksum design (score boost when context words like "SSN", "IBAN" appear near a match; base confidence per pattern) directly to Rust. MIT licence permits commercial reuse with copyright notice retention.
- PERSON/LOCATION/NRP cannot be replicated faithfully without NER; a rule-only product should either drop them or use dictionaries (e.g., employee directory names) via Aho-Corasick.
- Presidio patterns are Python `re` syntax; some may use look-around, which Rust `regex` does not support (see Q6) — each pattern needs review/rewrite (e.g., move boundary checks into post-match validation code).

### Gaps
- Exact date/reason of the Microsoft → Data Privacy Stack transition was not visible (transition doc not fetched).
- Did not audit how many Presidio patterns use look-around/backreferences.

## Q2. Secret-detection rule sources (gitleaks, TruffleHog, detect-secrets): formats, licences, commercial reuse

### Takeaway
gitleaks (MIT) is the most reusable rule source: ~220 TOML rules with `regex` + `keywords` (pre-filter) + `entropy`, directly portable to a Rust/Aho-Corasick-prefilter engine; but gitleaks is now "feature complete" (security fixes only) and its author moved to a successor, Betterleaks. TruffleHog v3 is AGPL-3.0 (detectors are Go code with live verification) — copying its detector code into a closed product is legally risky. detect-secrets is Apache-2.0 but effectively dormant (last release May 2024).

### Cited Findings
- gitleaks: Go, MIT licence. Rule fields: `id`, `description`, `regex`, `secretGroup`, `entropy` (min Shannon entropy), `keywords` (pre-regex filtering), `path`, `tags`, `[[rules.allowlists]]` (commits/paths/regexes/stopwords with AND/OR `condition`), composite rules via `[[rules.required]]`; users can extend defaults with `useDefault = true` — [GitHub gitleaks](https://github.com/gitleaks/gitleaks)
- gitleaks README: "Gitleaks is feature complete. I'm not merging new features into Gitleaks"; future releases security patches only; author "shifting my focus" to Betterleaks (github.com/betterleaks/betterleaks) — [GitHub gitleaks](https://github.com/gitleaks/gitleaks)
- Default config has roughly 220 `[[rules]]` (estimate from scan); example rule `github-pat`: regex `ghp_[0-9a-zA-Z]{36}`, `entropy = 3`, `keywords = ["ghp_"]`, path allowlist — [gitleaks.toml](https://raw.githubusercontent.com/gitleaks/gitleaks/master/config/gitleaks.toml)
- TruffleHog: "Since v3.0, TruffleHog is released under a AGPL 3 license" (v2 was GPL-2.0); v3 rewritten in Go; detectors in `pkg/detectors` with active verification against provider APIs (e.g., AWS GetCallerIdentity); README cites "over 800 secret types" / "over 700 credential detectors"; custom detectors need ≥1 regex + keyword, optional webhook verification; ~28.6k stars, 4,662 commits — [GitHub trufflehog](https://github.com/trufflesecurity/trufflehog)
- detect-secrets: Apache-2.0, Python; plugin types = regex rules, entropy detector, keyword detector; filters (`--exclude-lines`, `--exclude-files`, `--word-list`); baseline file concept (`.secrets.baseline`) to accept existing secrets and block new ones; ~4.7k stars — [GitHub Yelp/detect-secrets](https://github.com/Yelp/detect-secrets)
- detect-secrets latest PyPI release 1.5.0, uploaded 2024-05-06 — [PyPI detect-secrets](https://pypi.org/project/detect-secrets/)

### Inferences
- gitleaks' `keywords` pre-filter maps exactly onto an Aho-Corasick prefilter → run only the regexes whose keyword hit (this is the core performance trick for a WASM/browser engine). Recommended: vendor gitleaks.toml (MIT notice retained), and track Betterleaks for rule updates (check its licence before use — not verified).
- TruffleHog regexes embedded in AGPL Go source: whether individual regex strings are copyrightable is a legal grey area; safest is to not copy from TruffleHog and use it only as a coverage checklist (consult counsel). Live verification (calling provider APIs) is out of scope for a privacy-focused DLP anyway.
- detect-secrets' "baseline" idea translates to cipher as an allowlist of known/approved tokens (hashes) to suppress repeat false positives.

### Gaps
- Betterleaks licence, rule format compatibility and activity not checked.
- Exact gitleaks default rule count and latest version/date not confirmed (Releases section empty in scrape).

## Q3. Legacy open-source DLP (MyDLP, OpenDLP): status and reusable ideas

### Takeaway
Both are abandoned (MyDLP open-source code frozen since early 2014 after Comodo acquisition; OpenDLP last release 0.5.1 in Aug 2012) and are only of historical/design interest.

### Cited Findings
- MyDLP was GPL-licensed, acquired by Comodo Group in May 2014; the free version was removed and Comodo markets an Enterprise version; open-source code not updated since early 2014 — [DBpedia: MyDLP (from Wikipedia)](https://dbpedia.org/page/MyDLP); [Open Hub: MyDLP](https://openhub.net/p/mydlp)
- OpenDLP: free/open-source centralized DLP focused on scanning data-at-rest; not updated since 0.5.1 (August 2012), described as effectively abandoned — [AIMultiple: open-source DLP software](https://research.aimultiple.com/open-source-dlp-software/) (secondary aggregator)

### Inferences
- No code reuse recommended (GPL + dead codebases, pre-dates GenAI channels). The "agent pushes policy-evaluated events to a central server" pattern is generic and better studied in osquery/Wazuh/Fleet.

### Gaps
- Did not verify OpenDLP licence/repo location from a primary source (Google Code archive) — mark as uncertain.

## Q4. Agent/fleet architectures to learn from: osquery, Fleet, Wazuh agent, Velociraptor

### Takeaway
osquery (Apache-2.0/GPL-2.0 dual) is the most permissive and cross-platform reference for a user-mode agent with an extension mechanism; Fleet (MIT core + commercial features) shows how to wrap osquery with an updater (orbit/fleetd) and desktop tray app; Wazuh (GPLv2/AGPLv3) and Velociraptor (AGPL-3.0, Go) are architecture references only for a closed-source product.

### Cited Findings
- osquery: dual-licensed Apache-2.0 and GPL-2.0; Linux, macOS, Windows; "exposes an operating system as a high-performance relational database"; tables via plugin/extensions API; runs as `osqueryi` (shell), `osqueryd` (scheduler/daemon), or via Thrift APIs for custom applications; minor releases "roughly every two months" — [GitHub osquery](https://github.com/osquery/osquery)
- Fleet: "The free version of Fleet is available under the MIT license", with a separate commercial licence for paid features (LICENSE.md); built on osquery, nanoMDM, Nudge, swiftDialog; supports Linux, macOS, Windows, Chromebooks, iOS, Android; managed via GitOps YAML, GUI, REST API, webhooks, `fleetctl`; repo contains `orbit/`, `server/`, `frontend/`, `apps/fleet-desktop-macos` — [GitHub fleetdm/fleet](https://github.com/fleetdm/fleet)
- Wazuh: mostly GPLv2; the Wazuh engine (`src/engine/`, `wazuh-manager-analysisd`) is AGPLv3+; some shared libs dual GPLv2/AGPLv3; agent capabilities: FIM (content/permissions/ownership/attributes), log collection, SCA (config vs hardening policies), software inventory for vulnerability correlation, active response; server integrates with Wazuh Indexer + dashboard — [GitHub wazuh/wazuh](https://github.com/wazuh/wazuh)
- Wazuh enrollment: manager enrolls agent and generates a unique client key per agent; that key encrypts agent↔manager communication and validates agent identity; optional password auth, manager identity verification and agent identity (certificate) verification; enrollment via agent config or server API — [Wazuh docs: agent enrollment](https://documentation.wazuh.com/current/user-manual/agent/agent-enrollment/index.html)
- Velociraptor: Go ("available for all the platforms supported by Go"), client/server with VQL and artifacts; `velociraptor gui` starts GUI, frontend and a local client — [GitHub Velocidex/velociraptor](https://github.com/Velocidex/velociraptor); licence is GNU AGPL v3 — [Velociraptor LICENSE](https://raw.githubusercontent.com/Velocidex/velociraptor/master/LICENSE)

### Inferences
- Design ideas worth copying: (a) osquery's "daemon + extension over local socket" split → cipher core service + per-user helper processes speaking a local IPC protocol; (b) Wazuh's per-agent enrollment key/secret, then encrypted channel → cipher enrollment token → per-device credential (mTLS cert) issued by gateway; (c) Fleet/orbit's separation of updater, agent, and desktop UI (maps to cipher service, sensor, Tauri tray); (d) Velociraptor's single static binary with embedded config simplifies MSI/PKG/DEB packaging.
- Prior knowledge (not verified this session): Wazuh agent is C, enrollment on TCP 1515 (authd) and events on 1514; Velocidex was acquired by Rapid7 (2021); Wazuh is at 4.x with 5.0 in development.

### Gaps
- Latest release versions/dates for osquery, Wazuh, Velociraptor, Fleet not confirmed (Releases sections empty in scrape; GitHub API unreachable).

## Q5. Chrome Enterprise Content Analysis (local agent) SDK: how a local DLP agent receives paste/upload/print content from Chrome

### Takeaway
Chrome has an official, open-source (BSD-3) C++ SDK that lets a local agent receive bulk-text/paste, file attach/upload, download and print content from Chrome via protobuf messages and return BLOCK/WARN/REPORT_ONLY verdicts — no extension needed — but it requires Chrome Enterprise Core enrollment and admin-console configuration, and Google only lists Broadcom Symantec and Trellix as vendors.

### Cited Findings
- SDK repo chromium/content_analysis_sdk: BSD-3-Clause; lets DLP agents become service providers for Chrome's Content Analysis Connector, "an official mechanism" for deeper DLP integration; C++ with CMake ≥3.23, Protocol Buffers ≥3.18, vcpkg; build instructions for Linux, macOS, Windows; 144 commits, 54 stars — [GitHub chromium/content_analysis_sdk](https://github.com/chromium/content_analysis_sdk)
- Protocol (analysis.proto): connectors FILE_DOWNLOADED, FILE_ATTACHED, BULK_DATA_ENTRY, PRINT (FILE_TRANSFER, DATA_COPIED defined but "not implemented in the SDK"); request includes `request_token`, `request_data` (url, filename, SHA-256 digest, tab_title, signed-in email, print metadata), content oneof `text_content` | `file_path` | `print_data` (handle,size), `tags`, `client_metadata.browser.machine_user`, `expires_at`, `user_action_id`, `reason` (CLIPBOARD_PASTE, DRAG_AND_DROP, FILE_PICKER_DIALOG, PRINT_PREVIEW_PRINT, SYSTEM_DIALOG_PRINT, NORMAL_DOWNLOAD, SAVE_AS_DOWNLOAD, CLIPBOARD_COPY); response returns per-tag triggered rules with action REPORT_ONLY / WARN / BLOCK; Chrome sends acknowledgement with final_action (ALLOW/REPORT_ONLY/WARN/BLOCK, status TOO_LATE etc.) and cancel requests per user_action_id — [analysis.proto](https://raw.githubusercontent.com/chromium/content_analysis_sdk/main/proto/content_analysis/sdk/analysis.proto)
- Admin setup: devices must be enrolled in Chrome Enterprise Core; admin selects a "local content analysis" vendor for Upload (OnFileAttachedEnterpriseConnector), Bulk text/clipboard paste (OnBulkDataEntryEnterpriseConnector) and Print (OnPrintEnterpriseConnector); `chrome://policy` shows provider `local_system_agent`; per-policy setting "When the analysis verdict is not received in time" = allow or block; removes need to deploy the partner's extension; listed vendors: Broadcom Symantec, Trellix — [Google: Manage Chrome Enterprise DLP connectors](https://support.google.com/chrome/a/answer/13876556?hl=en)

### Inferences
- This is the highest-fidelity, tamper-resistant browser path for Chrome: Chrome itself gates paste/upload/print and waits for the agent's verdict; cipher's Rust agent could implement the protocol (protobuf via `prost`) over the SDK's IPC transport. The IPC transport (prior knowledge: Windows named pipe, POSIX Unix domain socket) was not confirmed on the scraped page — verify in SDK source.
- Constraint: customer must have Chrome Enterprise Core enrollment (free tier, but admin-console setup) and set the local agent as provider; Edge/Firefox do not use this SDK (Edge has its own Purview integration — not researched). So the MV3 extension remains needed for non-enrolled Chrome, Edge, Firefox, and for in-page UX (inline warnings, redaction).
- Whether Google requires partnership/allow-listing for a new vendor's agent to be selectable in the admin console is unclear (admin console shows a vendor picker) — high-priority question for cipher.

### Gaps
- Unconfirmed: whether arbitrary (non-partner) agents can be configured as `local_system_agent` provider; whether Chrome verifies agent binary identity; Chrome version requirements; IPC transport names.

## Q6. Rust ecosystem: crates for the engine, OS integration, UI and WASM; existing Rust DLP/PII projects

### Takeaway
All core building blocks exist with permissive MIT/Apache licences and are actively maintained in 2026: `regex` (linear-time, no look-around) + `aho-corasick` for the portable/WASM engine; `vectorscan-rs` only for native high-throughput (not WASM); `windows`/`windows-service`/`objc2`/`notify`/`arboard`/`x11rb` for OS hooks; Tauri 2.12 for UI. Several young Rust PII crates (cloakrs, redact-core, pii) exist but are tiny-adoption; best treated as references, not dependencies.

### Cited Findings
- `regex`: "all regex searches in this crate have worst case O(m * n) time complexity" (iterating all matches can be O(m·n²)); lacks "look-around and backreferences"; `RegexSet` matches many patterns in one pass but "only reports which patterns match and not the byte offsets"; use `RegexBuilder::size_limit` for untrusted patterns; near-full UTS#18 Level 1 Unicode; `regex-automata` offers no-std use — [docs.rs regex](https://docs.rs/regex/latest/regex/)
- crates.io data (pulled 2026-10-20; name, latest version, licence, last update, total downloads):
  - regex 1.13.1, MIT OR Apache-2.0, 2026-07-15, ~1.28B — [crates.io regex](https://crates.io/crates/regex)
  - aho-corasick 1.1.5, Unlicense OR MIT, 2026-08-03, ~1.26B — [crates.io aho-corasick](https://crates.io/crates/aho-corasick)
  - vectorscan-rs 0.0.6, Apache-2.0 OR MIT, 2026-03-13, ~731k ("Ergonomic bindings to the Vectorscan high-performance regex library", repo bradlarsen/vectorscan-rs) — [crates.io vectorscan-rs](https://crates.io/crates/vectorscan-rs)
  - hyperscan (flier/rust-hyperscan) 0.3.2, MIT OR Apache-2.0, last update 2022-12-27 (stale) — [crates.io hyperscan](https://crates.io/crates/hyperscan)
  - windows (microsoft/windows-rs) 0.62.2, MIT OR Apache-2.0, 2025-10-06 — [crates.io windows](https://crates.io/crates/windows)
  - windows-service (mullvad) 0.8.1, MIT OR Apache-2.0, 2026-05-08 — [crates.io windows-service](https://crates.io/crates/windows-service)
  - objc2 0.6.5, MIT, 2026-10-05; objc2-app-kit 0.3.2, Zlib OR Apache-2.0 OR MIT — [crates.io objc2](https://crates.io/crates/objc2)
  - notify 8.2.0, CC0-1.0, 2026-10-17 — [crates.io notify](https://crates.io/crates/notify)
  - tauri 2.12.4, Apache-2.0 OR MIT, 2026-10-14 — [crates.io tauri](https://crates.io/crates/tauri)
  - wasm-bindgen 0.2.129, MIT OR Apache-2.0, 2026-09-25 (repo moved to github.com/wasm-bindgen/wasm-bindgen) — [crates.io wasm-bindgen](https://crates.io/crates/wasm-bindgen)
  - arboard (1Password) 3.7.0, MIT OR Apache-2.0, 2026-10-15 (clipboard text/image read/write) — [crates.io arboard](https://crates.io/crates/arboard)
  - clipboard-master 4.0.0, MIT (clipboard change monitoring) — [crates.io clipboard-master](https://crates.io/crates/clipboard-master)
  - uiautomation 0.25.1, Apache-2.0, 2026-09-04 (Windows UIA wrapper) — [crates.io uiautomation](https://crates.io/crates/uiautomation)
  - ferrisetw 1.2.0, MIT OR Apache-2.0, last update 2024-06-27 (ETW consumer, "KrabsETW rip-off") — [crates.io ferrisetw](https://crates.io/crates/ferrisetw)
  - wayland-clipboard-listener 0.6.1, **GPL-3.0** (implements wlr-data-control) — [crates.io wayland-clipboard-listener](https://crates.io/crates/wayland-clipboard-listener)
  - x11rb 0.14.0, MIT OR Apache-2.0, 2026-07-16 — [crates.io x11rb](https://crates.io/crates/x11rb)
  - keyring 4.2.0, MIT OR Apache-2.0 (OS credential stores, for device credentials) — [crates.io keyring](https://crates.io/crates/keyring)
- Rust PII projects: cloakrs (kadir/cloakrs; library+CLI for detecting/masking PII in text, logs, JSON, CSV, SQL; 0.3.0 added name/address recognizers, allow/deny lists, JSONL audit) — [Rust forum: Cloakrs 0.3.0](https://users.rust-lang.org/t/cloakrs-0-3-0-a-blazing-fast-rust-pii-scanner-and-redaction-toolkit/140244); cloakrs-core 0.4.0, MIT, ~955 downloads — [crates.io cloakrs-core](https://crates.io/crates/cloakrs-core)
- redact (censgate/redact; redact-core 0.12.5, Apache-2.0, ~7k downloads) positions itself as a Presidio replacement: regex recognizers for 36+ entity types, optional ONNX NER, REST API/CLI/WebAssembly builds — [docs.rs redact-core](https://docs.rs/redact-core); [crates.io redact-core](https://crates.io/crates/redact-core)
- pii (worka-ai/pii 0.1.0, MIT OR Apache-2.0): regex, validator, dictionary and optional Candle-based NER recognizers — [docs.rs pii](https://docs.rs/crate/pii/latest)
- maskprompt-core: small pure-Rust crate, few regex rules, Luhn validation, Aho-Corasick keywords — [docs.rs maskprompt-core](https://docs.rs/maskprompt-core)

### Inferences
- Engine architecture recommendation: Aho-Corasick keyword prefilter (gitleaks `keywords`, Presidio context words) → `RegexSet` to find which rules fire → per-rule `Regex` for offsets → Rust validator functions (Luhn, IBAN mod-97, ISO 7064, entropy) → context scoring. All of `regex`/`aho-corasick` are pure Rust and compile to `wasm32-unknown-unknown` (prior knowledge; `regex` docs don't mention wasm explicitly).
- Vectorscan (C++ Hyperscan fork) is attractive for native gateway/agent throughput but not usable in the browser WASM build and doesn't support every PCRE construct — use it only behind the same rule IR, with `regex` as the canonical semantics. Prefer `vectorscan-rs` over the stale `hyperscan` crate.
- Avoid GPL-3.0 `wayland-clipboard-listener` in a proprietary agent; implement ext/wlr data-control directly with `wayland-client`/`wayland-protocols` (licences not checked).
- redact-core (Apache-2.0, WASM build) is the closest existing analogue to cipher's planned engine and worth reading for design, though adoption is very small.

### Gaps
- No mature, widely-adopted Rust DLP project found; GitHub stars/activity for cloakrs/redact not verified.
- Vectorscan licence (BSD-3 upstream, prior knowledge) and platform support for Windows not verified.

## Q7. Windows: what is feasible from user mode without kernel drivers?

### Takeaway
Most observation needs are achievable in user mode: clipboard change events (AddClipboardFormatListener), foreground-window tracking (SetWinEventHook out-of-context), reading text in other apps (UI Automation), per-user helper processes from a SYSTEM service (WTSQueryUserToken + CreateProcessAsUser), directory monitoring (ReadDirectoryChangesW), WFP permit/block filters. Not achievable without drivers/special programs: content inspection/modification of network traffic (WFP callouts are kernel drivers), synchronous file-access blocking (minifilter), and true tamper-proof service protection (PPL requires an ELAM driver and Microsoft antimalware certification).

### Cited Findings
- AddClipboardFormatListener: places a window in the system clipboard format listener list; the window "is posted a WM_CLIPBOARDUPDATE message whenever the contents of the clipboard have changed"; desktop apps only, Vista+ — [MS Learn: AddClipboardFormatListener](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-addclipboardformatlistener)
- SetWinEventHook: WINEVENT_OUTOFCONTEXT means the callback "is not mapped into the address space of the process that generates the event… the system must queue events… asynchronous, events are guaranteed to be in sequential order"; idProcess=0 receives events from all processes "on the current desktop"; "The client thread that calls SetWinEventHook must have a message loop"; INCONTEXT requires the hook in a DLL injected into target processes; INCONTEXT hooks aren't loaded into Store app processes unless installed by UIAccess processes — [MS Learn: SetWinEventHook](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwineventhook)
- WTSQueryUserToken: obtains the primary token of the logged-on user for a session; caller "must be running within the context of the LocalSystem account and have the SE_TCB_NAME privilege"; "Any program running in the context of a service will have a session identifier of zero (0)"; intended for highly trusted services; must CloseHandle the token — [MS Learn: WTSQueryUserToken](https://learn.microsoft.com/en-us/windows/win32/api/wtsapi32/nf-wtsapi32-wtsqueryusertoken)
- UI Automation: accessibility framework providing "programmatic access to most UI elements on the desktop", used by screen readers and automated test scripts — [MS Learn: UI Automation](https://learn.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32)
- WFP: filter engine "hosted in both kernel-mode and user-mode"; BFE accepts filters and "a local administrator can add filters but other users can only view them"; callouts are "functions exposed by a driver"; "Besides the basic actions of 'Permit' and 'Block', callouts can modify and secure inbound and outbound network traffic"; filtering can be per application, per user, per connection; third-party callouts register at kernel-mode layers — [MS Learn: About WFP](https://learn.microsoft.com/en-us/windows/win32/fwp/about-windows-filtering-platform)
- ReadDirectoryChangesW: does not report changes to the watched directory itself; needs FILE_LIST_DIRECTORY; on buffer overflow it "will still return true, but the entire contents of the buffer are discarded and lpBytesReturned will be zero"; fails with ERROR_INVALID_PARAMETER if buffer >64 KB when monitoring over the network; ERROR_NOTIFY_ENUM_DIR when system can't record all changes → must re-enumerate; size/last-write changes detected only when written to disk/cache flushed; for volume-wide tracking use change journals (USN) — [MS Learn: ReadDirectoryChangesW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesw)
- AMSI: vendor-agnostic interface for apps to request scans from the installed antimalware product; integrated into UAC, PowerShell, Windows Script Host, JavaScript/VBScript, Office VBA macros; from Windows 10 1903 an AMSI provider DLL that is not Authenticode-signed may not be loaded — [MS Learn: AMSI](https://learn.microsoft.com/en-us/windows/win32/amsi/antimalware-scan-interface-portal)
- Protected (PPL) anti-malware services: require "an ELAM driver installed" with an embedded resource listing signing-cert hashes, plus SERVICE_LAUNCH_PROTECTED_ANTIMALWARE_LIGHT via ChangeServiceConfig2; once protected, "other non-protected processes (and even admins) aren't able to stop the service"; processes with UI/GUI cannot be protected — [MS Learn: Protecting anti-malware services](https://learn.microsoft.com/en-us/windows/win32/services/protecting-anti-malware-services-)

### Inferences
- Session-0 architecture: cipher SYSTEM service (windows-service crate) enumerates sessions, uses WTSQueryUserToken + CreateProcessAsUser to spawn a per-user sensor in each interactive session; the sensor (needs a message loop/hidden window) does clipboard listening, foreground tracking, UIA reads, and talks to the service over a named pipe with an ACL. Clipboard/WinEvent hooks are per-desktop, so they can't run in session 0.
- AMSI is not a DLP vector: it only sees content that hosts choose to submit (scripts/macros), not clipboard or browser text; registering a provider also positions cipher as an AV component. Not recommended.
- Tamper resistance without ELAM: restrict service DACL via SDDL so non-admins can't stop/reconfigure it (prior knowledge: `sc sdset` / SetServiceObjectSecurity — SetServiceObjectSecurity is referenced on the PPL page), set recovery actions, run a watchdog. Local admins can always defeat a non-PPL service; PPL requires ELAM (i.e., a kernel driver + Microsoft Virus Initiative membership — membership requirement is prior knowledge).
- WFP user-mode filters can enforce domain/IP/app block lists (e.g., block chatgpt.com except via gateway) but cannot inspect HTTPS payloads; content inspection must happen in the browser extension, the Chrome content-analysis connector, or the gateway proxy.
- Clipboard: on WM_CLIPBOARDUPDATE the sensor can read CF_UNICODETEXT and scan; "blocking" a paste is not natively possible — options are to replace/clear clipboard content after copy (post-hoc) or warn; true paste-time blocking needs app-level hooks (browser extension) or Chrome connector.
- Prior knowledge (not verified): ETW user-mode consumers can read many providers (e.g., Microsoft-Windows-Kernel-Process/File/Network via admin real-time sessions) without a driver, but Microsoft-Windows-Threat-Intelligence requires a PPL antimalware consumer; ETW is observation-only (no blocking). Print interception in user mode is limited to spooler events/print processor or port-monitor DLLs; screenshot prevention per window via SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE) only for own windows.

### Gaps
- Not fetched this session: service SDDL docs, ETW provider access rules, UIA security (UIPI/integrity level restrictions), print spooler/screenshot interception docs, CreateProcessAsUser specifics. These should be verified before design sign-off.

## Q8. macOS: what is feasible from user mode, and the impact of new pasteboard privacy

### Takeaway
The biggest 2025–2026 risk for a macOS agent is pasteboard privacy: since macOS 15.4 an `NSPasteboard.accessBehavior` API exists and the General pasteboard defaults to "ask upon programmatic access"; Apple planned enforcement for macOS 26, and as of macOS 26 beta 4 there was no documented MDM/PPPC key to pre-approve a DLP agent. Endpoint Security and Network Extension content filters are user-space but require Apple-granted entitlements, system-extension activation and user/MDM approval; Accessibility (AX) reading of text fields requires user trust in System Settings.

### Cited Findings
- `NSPasteboard.AccessBehavior` (macOS 15.4+): cases `alwaysAllow` (no notification; app listed in System Settings), `alwaysDeny` (deny silently, except access that is "both user-originated and paste-related"), `ask` (prompt), `default` ("The default behavior for the General pasteboard is to ask upon programmatic access. All other pasteboards default to always allow access"); after first alert, state becomes `.ask` and the user can change it per app in System Settings — [Apple: NSPasteboard.AccessBehavior](https://developer.apple.com/documentation/appkit/nspasteboard/accessbehavior-swift.enum)
- Preview announced in macOS 15.4 release notes: alert when an app reads the general pasteboard programmatically without paste-related user interaction; new `detect` methods on NSPasteboard/NSPasteboardItem let apps check which types are present without reading contents (no alert); opt-in testing via `defaults write … EnablePasteboardPrivacyDeveloperPreview` — [Michael Tsai: Pasteboard Privacy Preview in macOS 15.4](https://mjtsai.com/blog/2025/05/12/pasteboard-privacy-preview-in-macos-15-4); [9to5Mac](https://9to5mac.com/2025/05/12/macos-16-clipboard-privacy-protection/)
- A DLP vendor reported on Apple forums (July 2025) that reading the General pasteboard under the preview "triggered an immediate prompt"; as of macOS 26 beta 4 (25A5316i) no "Paste from Other Apps" key existed in Device Management, including PrivacyPreferencesPolicyControl.Services; Apple DTS advised filing an enhancement request (FB19085787); no MDM solution in the thread — [Apple Developer Forums 794560](https://developer.apple.com/forums/thread/794560)
- Endpoint Security entitlement `com.apple.developer.endpoint-security.client` (macOS 10.15+) must be requested from Apple; without it `es_new_client` fails with ES_NEW_CLIENT_RESULT_ERR_NOT_ENTITLED — [Apple: ES client entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.endpoint-security.client)
- Network Extension content filters: NEFilterDataProvider decides allow/block on user network content and "runs in a very restrictive sandbox that prevents user network content from escaping that provider"; NEFilterControlProvider supplies rules (no content access); data provider has read-only access to the app group; NEFilterBrowserFlow represents flows from WebKit-based browsers; requires the Network Extensions entitlement — [Apple: Content filter providers](https://developer.apple.com/documentation/networkextension/content-filter-providers)
- AXIsProcessTrustedWithOptions: returns whether the current process is a trusted accessibility client; `kAXTrustedCheckOptionPrompt` triggers an asynchronous prompt that "does not affect the return value" — [Apple: AXIsProcessTrustedWithOptions](https://developer.apple.com/documentation/applicationservices/1459186-axisprocesstrustedwithoptions)
- Notarization: Developer ID signing (application/kernel extension/system extension/installer certs), Hardened Runtime, secure timestamp, no `get-task-allow`; required for all Developer ID software built after June 1, 2019 on macOS 10.15+; use `notarytool` (altool/Xcode ≤13 not accepted since Nov 1, 2023); staple tickets for offline Gatekeeper — [Apple: Notarizing macOS software](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)
- macOS Tahoe also added a Spotlight clipboard history (opt-in) — [MacMost: Spotlight clipboard history](https://macmost.com/how-to-use-the-spotlight-clipboard-history-in-macos-tahoe.html)

### Inferences
- A changeCount-polling clipboard scanner (prior knowledge: NSPasteboard has no change notification; `changeCount` must be polled) will hit the privacy prompt on every read once enforced, unless the user picks "Always Allow". `detect` APIs can tell whether text/URL-like types exist without an alert but give no content, so regex scanning of clipboard contents on macOS 26 is likely only possible with user consent per device — a major deployment friction unless Apple has since added an MDM key (unverified; re-check macOS 26.x Device Management release notes).
- Shift macOS enforcement to channels Apple doesn't gate: browser extension paste interception (the paste is user-originated inside the browser), Chrome content-analysis connector, and the gateway.
- Endpoint Security has no pasteboard events (prior knowledge, matches assistant summary; verify event list). Its value for cipher is file/process telemetry (e.g., which app opened a sensitive file) — likely not worth the entitlement process for an MVP.
- Network Extension content filter could see per-flow metadata and (for WebKit flows) URLs, but cannot decrypt TLS of Chrome traffic (prior knowledge) — useful for domain allow/deny, not content DLP.
- Deployment: LaunchDaemon (root, system-wide, no GUI session) for the core + LaunchAgent (per-user GUI session) for pasteboard/AX/tray (prior knowledge; analogous to Windows session-0 split). MDM can pre-approve system extensions and PPPC for Accessibility (prior knowledge), but apparently not pasteboard (per forum thread).

### Gaps
- Could not confirm whether macOS 26.0 final shipped the pasteboard prompt enforcement as previewed, nor whether a later 26.x added an MDM/PPPC key — no Apple primary source found. Mark as UNCERTAIN; high priority to test on a current macOS 26 build.
- LaunchDaemon/LaunchAgent, system extension MDM approval, and Endpoint Security event list docs were not fetched (Apple pages are JS-rendered).

## Q9. Linux: clipboard and file monitoring feasibility

### Takeaway
On X11, XFixes gives clipboard ownership-change events (then the agent requests contents) — straightforward. On Wayland, clipboard monitoring requires the privileged data-control protocol (ext-data-control-v1 / wlr-data-control) which KDE KWin, wlroots compositors, Hyprland, Niri, Wayfire support but GNOME Mutter does not (GNOME needs a Shell extension). fanotify can block file access but needs privileges; eBPF requires CAP_BPF/CAP_SYS_ADMIN on most distros.

### Cited Findings
- XFixes SelectSelectionInput (Version 1+): SelectionNotify subtypes SetSelectionOwner, SelectionWindowDestroy, SelectionClientClose; event carries window, owner, selection atom, timestamps — ownership changes only, no data — [X.Org fixesproto spec](https://xorg.freedesktop.org/archive/current/doc/fixesproto/fixesproto.txt)
- ext-data-control was added to wayland-protocols as a port of wlr-data-control, allowing "a privileged client to control data devices" and act as a clipboard manager; the MR lists implementations from Jay, KWin and wlroots — [wayland-protocols MR 336](https://gitlab.freedesktop.org/wayland/wayland-protocols/-/merge_requests/336)
- Vim's Wayland docs list compositors supporting one or both data-control protocols: KWin, wlroots-based (Sway, Labwc), Niri, Hyprland, Wayfire; protocol "may not be available in all situations, e.g., in sandboxes" — [Vim wayland.txt](https://vim-jp.org/vimdoc-en/wayland.html)
- GNOME Mutter: open issue "Support wlr-data-control" — [GNOME Mutter issue 524](https://gitlab.gnome.org/GNOME/mutter/-/issues/524); third-party commit states Mutter exposes neither ext-data-control-v1 nor zwlr-data-control-v1 and uses a GNOME Shell extension via Meta.Selection instead (secondary source) — [Strata commit](https://git.edu4rdshl.dev/edu4rdshl/Strata/commit/8a7091755bce03435c79009882fea2e9f8815a38)
- fanotify: permission events FAN_OPEN_PERM, FAN_ACCESS_PERM, FAN_OPEN_EXEC_PERM require the listener to write FAN_ALLOW/FAN_DENY (deny → EPERM); event `pid` field (or TID / pidfd); limitations: no events for network-FS remote changes, mmap/msync/munmap not reported, non-recursive directory marks, queue overflow loses events; man page warns about giving CAP_SYS_ADMIN to unprivileged programs — [man7 fanotify(7)](https://man7.org/linux/man-pages/man7/fanotify.7.html)
- eBPF: `kernel.unprivileged_bpf_disabled` 0 = unprivileged allowed, 1 = blocked permanently, 2 = blocked but admin-changeable; default 0, or 2 with BPF_UNPRIV_DEFAULT_OFF; when 1/2, bpf() without CAP_SYS_ADMIN or CAP_BPF fails with EPERM — [kernel.org sysctl/kernel](https://www.kernel.org/doc/html/latest/admin-guide/sysctl/kernel.html)

### Inferences
- Linux agent: root systemd service (fanotify/eBPF optional) + per-user systemd user service for clipboard (x11rb XFixes on X11; data-control on KDE/wlroots; GNOME Shell extension or no clipboard coverage on GNOME Wayland). Given Ubuntu/RHEL default to GNOME Wayland, Linux clipboard coverage will be partial; rely on browser extension there.
- inotify (prior knowledge) is unprivileged but per-watch, non-recursive, and gives no PID; fanotify with FAN_MARK_FILESYSTEM gives PID but needs CAP_SYS_ADMIN. Both run in user space (no custom kernel module).
- Most major distros ship with unprivileged BPF disabled (prior knowledge), so eBPF is "user-mode program, privileged loader" — acceptable for a root daemon but adds kernel-version compatibility burden; skip for MVP.

### Gaps
- Exact current list of compositors with ext-data-control-v1 (vs only wlr) not verified; COSMIC/Weston status unknown.
- fanotify unprivileged-mode details (Linux 5.13+) not confirmed from the fetched page.

## Q10. Browser extension (Manifest V3 + Firefox): interception, managed config, native messaging, WASM

### Takeaway
An MV3 extension can run a Rust→WASM engine (requires `'wasm-unsafe-eval'` in extension_pages CSP; remote WASM banned), read admin policy from `chrome.storage.managed`, be force-installed and made non-removable via enterprise policy, and talk to the local agent via native messaging (host→extension messages capped at 1 MB; extension→host 64 MiB). Native messaging is unavailable in content scripts — paste/drop interception happens in the content script, scanning in-page (WASM) or via the service worker.

### Cited Findings
- Native messaging: host→extension max 1 MB per message ("mainly to protect Chrome from misbehaving native applications"); extension→host max 64 MiB; JSON, UTF-8, 32-bit native-order length prefix; `type` must be `stdio`; `allowed_origins` lists `chrome-extension://<ID>/` (no wildcards); `connectNative()` keeps host alive while port open, `sendNativeMessage()` spawns a new host per message; both require `nativeMessaging` permission and are "unavailable in content scripts" (content scripts must message the service worker, which must validate sender); host gets caller origin as first arg, on Windows also `--parent-window=` (0 from a service worker) — [Chrome: Native messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging)
- Chrome host registration: Windows registry default value under `HKLM\SOFTWARE\Google\Chrome\NativeMessagingHosts\<name>` or `HKCU\…` (32-bit view checked first, then 64-bit); macOS system `/Library/Google/Chrome/NativeMessagingHosts/<name>.json`, user `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/`; Chromium `/Library/Application Support/Chromium/NativeMessagingHosts/`; Linux system `/etc/opt/chrome/native-messaging-hosts/`, Chromium `/etc/chromium/native-messaging-hosts/`, user `~/.config/google-chrome/NativeMessagingHosts/` and `~/.config/chromium/NativeMessagingHosts/` — [Chrome: Native messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging)
- Firefox: manifests use `allowed_extensions` (add-on IDs) instead of `allowed_origins`; Windows `HKLM\SOFTWARE\Mozilla\NativeMessagingHosts\<name>` / HKCU (Wow6432Node checked first since Firefox 64); macOS `/Library/Application Support/Mozilla/NativeMessagingHosts/` and `~/Library/Application Support/Mozilla/NativeMessagingHosts/`; Linux `/usr/lib/mozilla/native-messaging-hosts/` or `/usr/lib64/…`, user `~/.mozilla/native-messaging-hosts/` — [MDN: Native manifests](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests)
- Firefox `storage.managed` comes from a managed-storage manifest (`type: "storage"`, `data`) at `HKLM/HKCU\SOFTWARE\Mozilla\ManagedStorage\<id>`, `/Library/Application Support/Mozilla/ManagedStorage/`, `/usr/lib/mozilla/managed-storage/`, etc. — [MDN: Native manifests](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests)
- Chrome `storage.managed`: read-only, populated by administrators via enterprise policy using a developer-defined schema; accessible to content scripts by default; quotas local 10 MB, sync ~100 KB, session 10 MB (session not exposed to content scripts by default) — [Chrome: storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- MV3 CSP: default extension_pages `script-src 'self'; object-src 'self';` (WebAssembly disabled by default); minimum allowed `script-src 'self' 'wasm-unsafe-eval'; object-src 'self';`; `'unsafe-eval'` causes install error — [Chrome: manifest content_security_policy](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy); Chrome guidance: move all external code (JS, Wasm) into the bundle — [Chrome: Improving security in MV3](https://developer.chrome.com/docs/extensions/migrating/improve-security)
- MDN: from version 103 extensions can use WebAssembly if they include `'wasm-unsafe-eval'` in `content_security_policy` (101 and earlier could not); a Mozilla bug discusses MV3 default CSP omitting it — [MDN: CSP for WebExtensions](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Content_Security_Policy); [Bugzilla 1766027](https://bugzil.la/1766027)
- Offscreen API (Chrome 109+, MV3): reasons include CLIPBOARD, WORKERS, DOM_PARSER, BLOBS, LOCAL_STORAGE, etc.; one offscreen document per extension at a time; only `runtime` extension API available; non-audio offscreen documents have no lifetime limit — [Chrome: offscreen API](https://developer.chrome.com/docs/extensions/reference/api/offscreen)
- Force install: ExtensionSettings with `installation_mode: force_installed` + `update_url` (Web Store: `https://clients2.google.com/service/update2/crx`); force-installed extensions can't be removed by users — [Google: Chrome extension policies](https://support.google.com/chrome/a/answer/9867568?hl=en)

### Inferences
- Content-script interception (prior knowledge, standard DOM): listen in capture phase on `paste`, `drop`, `beforeinput` (inputType `insertFromPaste`/`insertFromDrop`), and file `<input>` `change`; read `event.clipboardData.getData('text/plain')` / `dataTransfer.files` synchronously, run WASM scan in the content script (WASM in content scripts is governed by the page's isolated world — CSP behaviour for content-script WASM should be tested), and `preventDefault()` + re-insert redacted text. Caveat: the decision must be synchronous to block a paste, so the WASM engine should run in the content script itself, not round-trip to the service worker.
- Native-messaging 1 MB host→extension cap is fine for verdicts/policy but large policy bundles should be chunked. Content scripts cannot call native messaging directly — route via the service worker.
- MV3 service workers are terminated when idle (prior knowledge, ~30 s) — keep state in storage.session and treat native port as reconnectable.
- Chrome content-analysis connector (Q5) and the extension are complementary: connector = browser-enforced, tamper-resistant; extension = cross-browser + in-page UX.

### Gaps
- ExtensionInstallForcelist exact rules for self-hosted (off-Web-Store) CRX on non-domain-joined Windows/macOS not verified (pages rendered without content).
- Whether WebAssembly compile is allowed in content scripts under strict page CSPs (e.g., chatgpt.com) not verified — test required.
- Edge-specific host registry path (prior knowledge: `HKLM\SOFTWARE\Microsoft\Edge\NativeMessagingHosts`) and Edge/Firefox enterprise policy names not fetched.

## Q11. Consolidated user-mode feasibility matrix (synthesis)

### Takeaway
Without kernel drivers, cipher can observe and warn on all major channels and can *block* reliably only where an application cooperates (browser extension, Chrome connector) or at the network gateway; OS-level hard blocking of clipboard, files and network content is largely kernel/entitlement territory.

### Cited Findings
- See per-OS findings above: Windows clipboard/WinEvent/UIA/WTS/WFP/ReadDirectoryChangesW/PPL ([MS Learn pages cited in Q7](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-addclipboardformatlistener)); macOS pasteboard privacy/ES/NE/AX/notarization ([Apple docs cited in Q8](https://developer.apple.com/documentation/appkit/nspasteboard/accessbehavior-swift.enum)); Linux XFixes/data-control/fanotify/eBPF ([sources in Q9](https://man7.org/linux/man-pages/man7/fanotify.7.html)); browser ([Chrome/MDN docs in Q10](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging)).

### Inferences
| Capability | Windows (user mode) | macOS (user mode) | Linux (user mode) | Browser |
|---|---|---|---|---|
| Clipboard change detect | Yes – WM_CLIPBOARDUPDATE (per-session helper) | Poll changeCount; reading content prompts under pasteboard privacy (macOS 26, no MDM key found) | X11 XFixes yes; Wayland only KDE/wlroots via data-control; GNOME needs Shell ext | `paste` event in content script |
| Clipboard block at paste time | No (post-hoc clear/replace only) | No | No | Yes (preventDefault), Chrome connector BULK_DATA_ENTRY |
| Foreground app/window | SetWinEventHook OUTOFCONTEXT | NSWorkspace notifications (prior knowledge) | X11 _NET_ACTIVE_WINDOW; Wayland generally no (prior knowledge) | tabs API |
| Read text in other apps | UIA (TextPattern/ValuePattern) | AX API, needs user/MDM trust | AT-SPI (prior knowledge, not verified) | DOM |
| Per-user process from service | WTSQueryUserToken + CreateProcessAsUser (LocalSystem + SE_TCB) | LaunchAgent (prior knowledge) | systemd --user (prior knowledge) | n/a |
| File monitoring | ReadDirectoryChangesW / USN (no PID, no block) | FSEvents (prior knowledge); ES needs Apple entitlement | inotify (unpriv), fanotify perm events (root) | file input/drop |
| Network block | WFP filters permit/block (admin) | NE content filter (entitlement + sysext) | nftables (root, prior knowledge) | declarativeNetRequest (prior knowledge) |
| Network content inspection | Kernel WFP callout only → use gateway | NEFilterDataProvider (no TLS decrypt for Chrome, prior knowledge) | eBPF (CAP_BPF) / proxy | Content script / Chrome connector |
| Tamper resistance | Service DACL/SDDL; PPL needs ELAM driver | MDM-managed sysext/profiles (prior knowledge) | root + systemd hardening | Force-install policy (non-removable) |

- Priority recommendation: (1) MV3 extension + WASM engine for paste/drop/upload on ChatGPT/Claude/Gemini/Copilot web; (2) Chrome content-analysis connector agent for enrolled Chrome; (3) desktop clipboard/foreground sensors as "warn + audit" signal (Windows strong, Linux X11/KDE OK, macOS constrained by pasteboard privacy); (4) gateway for network enforcement and native desktop apps (ChatGPT/Claude desktop) that the extension can't see.

### Gaps
- Several matrix cells rely on prior knowledge (marked) and should be verified: NSWorkspace activation notifications, AT-SPI, nftables, declarativeNetRequest, MDM approval of system extensions, Edge native messaging paths.
- Native desktop AI apps (ChatGPT desktop, Claude desktop, Copilot app) paste paths: only observable via OS clipboard/UIA/AX sensors or gateway; no in-app hook exists — not researched further.
