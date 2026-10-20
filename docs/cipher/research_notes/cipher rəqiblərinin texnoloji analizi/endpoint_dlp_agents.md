# Endpoint DLP agents: how incumbents hook into the OS (Cyberhaven, Microsoft Purview, Forcepoint, Symantec/Broadcom, Digital Guardian/Fortra, Teramind, Netwrix Endpoint Protector, Trellix)

Research date: 2026-10-20. Scope: public vendor docs, KB articles, job postings, review aggregators. About 26 search/fetch calls. Vendors rarely publish driver-level internals, so a lot of the "how" below is marked as inference. Some Broadcom support pages returned HTTP 403, so they are quoted from search-result summaries only.

## 1. OS hooking mechanisms per product (Windows / macOS / Linux)

### Takeaway
The macOS picture is well documented and consistent across vendors: an Endpoint Security (ES) system extension for file/process events, a Network Extension (content filter or transparent proxy) for traffic, plus Full Disk Access (FDA) and often Accessibility, all pre-approved through MDM profiles. Windows internals are mostly undocumented. Public evidence shows a mix of kernel-level components (DG says "kernel level visibility"; Cyberhaven hires for kernel APIs) and user-mode API hooking/DLL injection into apps (Symantec "Application Monitoring", DG "application layer injection"). Browser monitoring has clearly moved from hooking the browser to browser extensions.

### Cited Findings
**Microsoft Purview Endpoint DLP**
- Windows: Endpoint DLP is built into Windows 10/11 and Windows Server 2019+ through the Defender for Endpoint stack. "Onboarding devices to Defender also onboards them to DLP." Onboarding is done with scripts (local script, Group Policy, SCCM, Intune/MDM, VDI), not a separate DLP agent install — [Microsoft Learn: Learn about Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- macOS: DLP runs inside Microsoft Defender for Endpoint for Mac and needs Defender Antimalware client 101.25012.0005 or newer. DLP is turned on with a feature key in the `com.microsoft.wdav` preference domain — [Microsoft Learn: macOS onboarding, any MDM](https://learn.microsoft.com/en-us/purview/device-onboarding-offboarding-macos-any-mdm)
- macOS needs a bundled `mdatp.mobileconfig` containing accessibility.mobileconfig, fulldisk.mobileconfig, netfilter.mobileconfig and sysext.mobileconfig. After a restart the expected profiles are: Accessibility, MAU, MDATP Onboarding, MDE Preferences, Management profile, Network filter, Notifications, System extension profile — [Microsoft Learn: macOS onboarding, any MDM](https://learn.microsoft.com/en-us/purview/device-onboarding-offboarding-macos-any-mdm)
- On Intune, DLP needs its own FDA entry for a separate DLP daemon. The network filter is needed because Defender inspects socket traffic, and the user must approve the network filter prompt — [Microsoft Learn: Intune onboarding (summary via search)](https://learn.microsoft.com/sv-se/purview/device-onboarding-offboarding-macos-intune-mde); [Defender for Endpoint macOS manual install](https://learn.microsoft.com/en-us/defender-endpoint/mac-install-manually)
- Browser: Edge has native ("built-in") Endpoint DLP support on Windows and on macOS (Edge v95+). Chrome needs the Microsoft Purview extension, which works only on Windows. Microsoft says no extension is needed to enforce DLP on macOS — [Microsoft Learn: macOS onboarding](https://learn.microsoft.com/en-us/purview/device-onboarding-offboarding-macos-any-mdm); [Microsoft Learn: Purview Chrome extension](https://learn.microsoft.com/en-us/purview/dlp-chrome-get-started)
- The Chrome extension uses native messaging. If an admin sets a Chrome NativeMessageBlocklist, they must also allowlist the extension's ID. The extension was upgraded to Manifest V3 (version 3.0.0.239+) — [Microsoft Learn: Purview Chrome extension](https://learn.microsoft.com/en-us/purview/dlp-chrome-get-started)

**Forcepoint DLP Endpoint / Forcepoint ONE Endpoint (F1E)**
- macOS installer: `WebsenseEndpoint.pkg` inside `FORCEPOINT-ONE-ENDPOINT-Mac.zip`. DLP packages also need `key.pem`/`server.pem`. Install shows "System Extension Blocked" and then a "Proxy Configurations" prompt, both of which the user must Allow — [Forcepoint: Manually deploying F1E on Mac (v23)](https://help.forcepoint.com/F1E/en-us/v23/ep_install/0805C597-1017-405E-868C-B7D7AEC58285.html)
- FDA is required (v21.12+, macOS 11 onward, and on 13/14/15) for four processes: `ESDaemonBundle.app` (the name suggests the Endpoint Security client), `Websense Endpoint Helper.app`, `wsdlpd` (DLP daemon) and `EndPointClassifier` (classifier), all under `Library/Application Support/Websense Endpoint/` — [Forcepoint: Enabling FDA on macOS (v26)](https://help.forcepoint.com/F1E/en-us/v26/ep_install/D19DA675-72CD-49BD-A5E6-529795064E80.html)
- On Sequoia, the install guide has admins approve an Endpoint Security Extension and then a Network Extension (search-result summary of the Forcepoint Sequoia install guide) — [Forcepoint: Enabling FDA on macOS (v26)](https://help.forcepoint.com/F1E/en-us/v26/ep_install/D19DA675-72CD-49BD-A5E6-529795064E80.html)
- Browser extensions exist for Chrome, Firefox, Edge Chromium and Safari. On Windows the extension requires domain-joined endpoints. Package Builder can skip extension install so the extensions are deployed through MDM — [Forcepoint DLP Endpoint (v23)](https://help.forcepoint.com/F1E/en-us/v23/ep_install/FB163984-2E44-41A9-BFEC-53A7A4567BE5.html); [Forcepoint Safari extension](https://help.forcepoint.com/F1E/en-us/v20/ep_end_user/7F8599F3-DBB2-4432-A0B9-3B9838BBFC47.html); [Forcepoint package builder](https://help.forcepoint.com/F1E/en-us/v22/ep_install/69F38260-4A44-4016-B179-C626CA6E455B.html)
- The v26 release notes fix the F1E `wepsvc` service binding to 0.0.0.0:55299 instead of 127.0.0.1. This suggests the browser extension talks to a local agent service over a localhost socket. The same notes list Manifest V3 extension fixes for Mac and Windows — [Forcepoint F1E v26 resolved/known issues](https://help.forcepoint.com/F1E/en-us/v26/ep_release_notes/7F272842-E89A-4202-8CA9-2E8ED83B4581.html)

**Symantec (Broadcom) DLP Endpoint**
- Windows "Application Monitoring": when it is enabled, the agent "attempts to hook in and monitor any application", some apps may run poorly, and admins may need to exclude them. This is user-mode API hooking/injection — [Broadcom KB 170410 (via search summary)](https://knowledge.broadcom.com/external/article/170410/)
- Chrome: before 15.8 the agent hooked into Chrome to watch HTTPS. From 15.8, Chrome file uploads are watched through a browser extension instead, and Broadcom acknowledged this hurt the paste experience — [Broadcom advisory: Chrome with DLP 15.8.x agents (403 on fetch; search summary)](https://support.broadcom.com/external/content/product-advisories/Resolving-user-experience-issues-when-monitoring-the-Chrome-browser-with-DLP-15.8.x-Agents/19755)
- For agents 15.7+, Chrome and Edge do not catch typed inline text over HTTPS (they cover file uploads and clipboard). IE and Firefox cover all three. Broadcom now recommends "Monitoring Browsers Using Content Analysis Connectors on Windows Endpoints" and notes that incognito/InPrivate windows don't load extensions by default — [Broadcom KB 162676](https://knowledge.broadcom.com/external/article/162676/incidents-generated-by-endpoint-prevent.html)
- A Broadcom employee said Firefox monitoring on Windows needs no extension (consistent with continued hooking of Firefox), and a hotfix was needed for Firefox 130 — [Broadcom community thread](https://community.broadcom.com/symantecenterprise/question/firefox-https-traffic-monitoring)
- macOS: the `edpa` process and `SEHA.app` (System Extension Host App) need FDA through MDM. The Firefox extension needs MDM config (Firefox 74+). Mac Outlook monitoring moved from a deprecated hooking method to an "agave" Outlook add-in loaded through an MDM profile. Broadcom Team ID is Y2CCP3S9W7 — [Broadcom KB 198350: Install Requirements for DLP Mac Agent](https://knowledge.broadcom.com/external/article/198350/install-requirements-for-dlp-mac-agent.html)
- Fresh 15.8/16.0 installs failed on Apple Silicon macOS 13 because of sandboxing changes. The workaround was giving Terminal FDA or running the installer from /tmp — [Broadcom advisory](https://support.broadcom.com/web/ecx/support-content-notification/-/external/content/ProductAdvisories/DLP-Agent-fresh-installations-fail-on-macOS-13-endpoints-with-Apple-Silicon-hardware/21101)

**Digital Guardian (Fortra DLP)**
- Vendor material: "kernel level visibility of system, application and data events as well as user and malware behavior". The Windows agent uses both kernel-level and user-mode visibility — [DG Windows Agent page](https://digitalguardian.com/products/digital-guardian-agents/windows); [Fortra DG for Windows datasheet](https://static.fortra.com/digital-guardian/pdfs/datasheets/fta-dg-dg-for-windows-ds.pdf)
- A DG blog describes endpoint detection as "at the kernel and file level coupled with the application layer injection" — [Digital Guardian blog](https://www.digitalguardian.com/blog/expanding-digital-guardians-best-class-data-visibility-information-security-professionals)
- Platforms: Windows, macOS, Linux, VMware/Citrix VDI — [Fortra one-pager (Bakotech)](https://bakotech.com/wp-content/uploads/2025/05/eng_one-pagers-fortra-dizajn-digital-guardian-new.pdf)
- Linux agent 12.2.0 (April 2026) release notes list newly certified RHEL/Ubuntu kernels. A per-kernel certification list implies a kernel module or kernel-version-sensitive component — [DG Agent for Linux release notes](https://hstechdocs.helpsystems.com/releasenotes/Content/_ProductPages/Digital%20Guardian/Digital%20Guardian_linux.htm)
- macOS web inspection: explicit proxy from Jan 2021, then a transparent proxy added in v9.0 (March 2025), which intercepts only supported browsers and legacy Outlook (competitor article citing Fortra release notes) — [dope.security: Digital Guardian DLP in 2026](https://dope.security/post/digital-guardian-dlp-2026)
- An interop KB from SonicWall/SentinelOne tells admins to exclude the SentinelOne kernel driver (SentinelMonitor.sys), service and DLLs when running alongside DG. This points to conflicts between co-resident kernel agents — [SonicWall KB](https://www.sonicwall.com/support/knowledge-base/interoperability-with-digital-guardian-dlp/200616060635800/)

**Cyberhaven**
- Job postings describe a "system sensor that traces all data movement across applications and files" on Windows. They ask for "low-level system APIs on Windows" across kernel, security, file system, network and process APIs, monitoring "hundreds of thousands of events" with minimal impact — [Cyberhaven Windows Endpoint Software Engineer (Built In)](https://builtinbengaluru.in/job/windows-endpoint-software-engineer/4453685)
- The Linux endpoint posting asks for eBPF, kernel modules and audit frameworks across distributions — [Cyberhaven Linux Endpoint Engineer (Wellfound)](https://wellfound.com/jobs/2991697-linux-endpoint-engineer); [Redpoint careers](https://careers.redpoint.com/companies/cyberhaven/jobs/64338616-senior-software-engineer-linux-endpoint)
- A macOS system sensor role exists — [Cyberhaven macOS Endpoint Engineer](https://builtindublin.ie/job/macos-endpoint-engineer/8113164)
- Cyberhaven also has a dedicated browser-extension team ("visibility and control at the point where users interact with web applications"), working alongside the endpoint agent and backend — [Cyberhaven Principal SWE Browser Extension](https://www.workingnomads.com/jobs/principal-software-engineer-browser-extension-cyberhaven); [4dayweek posting](https://4dayweek.io/job/senior-software-engineer-browser-extension-at-cyberhaven-006b8a29)
- A competitor blog says Cyberhaven started endpoint-centric and now combines endpoint agents, browser extensions and cloud API connectors, and that no public OS-by-feature matrix exists — [Nightfall blog (competitor)](https://www.nightfall.ai/blog/cyberhaven-reviews)

**Teramind**
- The Mac agent needs Accessibility (hidden agent bundle `com.teramind.tmagent`, shown as "System Monitoring") and Screen Recording. Missing grants break screen capture. Web traffic monitoring on Mac uses a system extension that "requires specific authorizations to intercept and report web traffic" — [Teramind: Mac stealth agent permissions](https://knowledge.teramind.co/en/articles/16128236-how-to-enable-permissions-for-the-mac-stealth-agent); [Teramind: Mac screen recordings not captured](https://knowledge.teramind.co/en/articles/13460415-mac-video-screen-recordings-aren-t-captured); [Teramind: Mac websites aren't monitored](https://knowledge.teramind.co/en/articles/13518299-mac-websites-aren-t-monitored)
- Revealed and Hidden/Stealth agents exist on Windows and macOS. Offline recording is available on the hidden agent — [Teramind: features supported on Mac](https://kb.teramind.co/en/articles/8790993-what-features-are-supported-on-mac)

**Netwrix Endpoint Protector (CoSoSys)**
- macOS Deep Packet Inspection relies on a server-issued CA certificate that the admin adds to the System keychain as "Always Trust". macOS 11+ needed a new root cert. "Intercept VPN Traffic" uses a network extension instead of Packet Filter (pf). The client needs FDA — [Endpoint Protector KB: DPI on Big Sur](https://endpointprotector.com/support/endpoint-protector/how-to-set-deep-packet-inspection-on-macos-big-sur); [Netwrix KB: DPI and VPN interception on macOS](https://docs.netwrix.com/docs/kb/endpointprotector/content-aware-protection-and-dpi/enabling-deep-packet-inspection-and-intercepting-vpn-traffic-on-macos-clients); [Netwrix docs: DPI](https://docs.netwrix.com/docs/endpointprotector/admin/cap_module/deeppacket)

**Trellix DLP Endpoint**
- DLP Endpoint Complete (Windows 11.12, macOS 11.11, 2025) added Clipboard Protection and AirDrop monitoring on macOS, plus Windows-only "text upload blocking" aimed at web chat and GenAI prompts — [Trellix blog](https://www.trellix.com/blogs/platform/new-trellix-dlp-endpoint-release-enhances-data-security-on-windows-and-macos/); [Help Net Security](https://www.helpnetsecurity.com/2025/04/30/trellix-dlp-endpoint-complete/); [Business Wire](https://secure.businesswire.com/news/home/20250429087685/en/Trellix-Advances-Intelligent-Data-Security-to-Combat-Insider-Threats-and-Enable-Compliance)

### Inferences
- From the documented component names (ESDaemonBundle, SEHA.app, sysext and netfilter profiles, "Proxy Configurations" prompts), the standard macOS architecture in 2026 is: an ES-framework system extension (file open/write/rename/exec auth events), a NEFilterDataProvider content filter or NETransparentProxyProvider (Forcepoint, DG and Teramind call theirs a "proxy"), FDA for daemons, and Accessibility for UI and keystroke context. No vendor documented using legacy kexts in current versions. Endpoint Protector's mention of pf and later a network extension shows the kext/pf-to-sysext migration.
- On Windows, the "kernel level" wording from DG and Cyberhaven's hiring for kernel/file-system/network APIs strongly suggest file-system minifilters plus WFP callouts or kernel callbacks (process/image-load notifications). No vendor named its specific driver files in sources found this pass. Treat this as inference, not fact.
- User-mode DLL injection/API hooking is confirmed for Symantec (Application Monitoring, pre-15.8 Chrome, Firefox) and DG ("application layer injection"). The industry trend is away from hooking browsers (stability and Chrome hardening) toward MV3 extensions plus a local agent channel (native messaging for Purview, a localhost socket for Forcepoint `wepsvc`).
- Microsoft's advantage is structural: DLP rides on Defender/OS components that ship with Windows. No third party can copy this.

### Gaps
- No vendor names its Windows minifilter, WFP callout or kernel-callback driver files in public docs found (for example, nothing confirmed a Forcepoint `fppsflt`-style driver or DG `dgmaster.sys`).
- Cyberhaven's production Linux mechanism (eBPF vs fanotify vs audit) and its exact macOS extension types are unconfirmed.
- Trellix macOS system-extension and FDA requirements were not found.
- No public source gave ETW usage by any vendor.

## 2. Channel coverage: clipboard, screen capture, print, USB, browser upload, desktop AI apps

### Takeaway
Every incumbent covers USB, print, clipboard and browser upload. Coverage of paste and typed text into web apps is the weakest, most browser-dependent area. It is usually extension-based and was historically broken in Chrome and Edge. Desktop AI apps (ChatGPT/Claude desktop) are generally not covered as a first-class channel. Microsoft pushes them to network-level DLP via SASE, Fortra has no documented desktop-AI inspection, and Trellix's text-blocking is Windows-and-browser only.

### Cited Findings
- **Purview** activity matrix (Windows / macOS): upload to restricted cloud domain or unallowed browser (both, with redirect to Edge); paste to supported browsers (Windows, macOS preview; evaluates the pasted content itself); copy to clipboard (both); USB (both); network share (both); print (both, some print parameters Windows-only); Bluetooth (both); RDP (Windows only); Windows Recall snapshots (preview, Windows) — [Microsoft Learn: Learn about Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- Purview's clipboard block is file-sourced. Copy is blocked if the source file matches. Copy within the same Office file is allowed, and when a blocked file is open the app restricts copying from any other file. Data never saved locally can't be scanned ("If data is never saved to a file on the local device, Endpoint DLP cannot scan or classify it") — [Microsoft Learn: Learn about Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- Purview USB device control proper is handled by Defender for Endpoint Device Control — [Microsoft Learn: Learn about Endpoint DLP](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- Purview network data security covers GenAI "through browsers, apps, and add-ins, such as ChatGPT, Gemini, and Claude" through Entra Global Secure Access or third-party SASE/secure browser integrations. Status varies by page: GSA file filtering is preview, third-party SASE (text and files) is GA. There is a DSPM-for-AI one-click policy — [Microsoft Learn: network data security](https://learn.microsoft.com/purview/dlp-network-data-security-learn); [Petri](https://petri.com/microsoft-purview-data-security-browser-network/)
- **Symantec**: Chrome/Edge (15.7+) miss typed inline text over HTTPS. They cover file uploads and clipboard — [Broadcom KB 162676](https://knowledge.broadcom.com/external/article/162676/incidents-generated-by-endpoint-prevent.html)
- **Forcepoint**: the Endpoint HTTP/HTTPS destination "intercepts HTTP(S) posts as they are being uploaded within the browser". Downloads are not monitored — [Forcepoint DLP Endpoint docs (search summary)](https://help.forcepoint.com/F1E/en-us/v23/ep_install/FB163984-2E44-41A9-BFEC-53A7A4567BE5.html)
- **Digital Guardian (macOS)**: copy/paste/screen-capture control arrived Apr 2022, AirDrop Nov 2023, Bluetooth Jan 2026, Messages Jun 2026. The GenAI Content Pack claims to stop classified data via paste, file upload or form submission. No Fortra docs were found for desktop AI apps, IDEs or CLIs — [dope.security (competitor, citing Fortra)](https://dope.security/post/digital-guardian-dlp-2026)
- **Trellix**: macOS clipboard plus AirDrop. Windows text-upload blocking for GenAI prompts — [Trellix blog](https://www.trellix.com/blogs/platform/new-trellix-dlp-endpoint-release-enhances-data-security-on-windows-and-macos/)
- **Teramind**: screen recording, apps, web pages, keystrokes. OCR-based content inspection reads text inside screenshots (third-party description) — [Teramind Mac features](https://kb.teramind.co/en/articles/8790993-what-features-are-supported-on-mac); [rfp.wiki comparison](https://www.rfp.wiki/it-security/security-information-and-event-management/insider-risk-management-solutions/proofpoint/teramind)

### Inferences
- The "paste into a web prompt" channel, which is cipher's core use case, is where incumbents are weakest: browser-dependent, extension-based, missing for typed text in some cases, and Windows-first. This is a credible gap for a focused product.
- Desktop AI apps (Electron apps that pin TLS or use their own network stacks) can't be inspected by browser extensions. Incumbents cover them via clipboard controls or network/SASE. A user-mode cipher could rely on clipboard inspection at copy time plus Accessibility/UI Automation-based monitoring of the focused app, or route traffic through the cipher gateway.

### Gaps
- No vendor documentation was found that explicitly describes inspecting prompts in the ChatGPT or Claude desktop apps or the Copilot app at the endpoint.
- Cyberhaven's per-channel matrix (screen capture, print, AI desktop) is not public, as the competitor blog notes.

## 3. Local TLS interception vs browser extension for upload visibility

### Takeaway
Two models coexist. (a) Local TLS MITM via a trusted root CA plus a proxy or network extension (Endpoint Protector DPI explicitly; DG and Forcepoint transparent/explicit proxy on macOS; Teramind web-traffic sysext). (b) A browser extension with native messaging or a localhost channel to the agent (Purview Chrome, Symantec 15.8+, Forcepoint, Cyberhaven). Microsoft avoids local MITM entirely by using Edge-native enforcement and moving network inspection to SASE.

### Cited Findings
- Endpoint Protector DPI requires installing its CA cert as Always Trust in the System keychain, which confirms local TLS interception — [Netwrix KB](https://docs.netwrix.com/docs/kb/endpointprotector/content-aware-protection-and-dpi/enabling-deep-packet-inspection-and-intercepting-vpn-traffic-on-macos-clients)
- DG macOS moved from an explicit proxy (2021) to a transparent proxy (2025) limited to supported browsers — [dope.security](https://dope.security/post/digital-guardian-dlp-2026)
- Forcepoint macOS install triggers a "Proxy Configurations" approval — [Forcepoint v23 Mac deploy](https://help.forcepoint.com/F1E/en-us/v23/ep_install/0805C597-1017-405E-868C-B7D7AEC58285.html)
- Purview Chrome extension plus native messaging allowlist (Windows only). On macOS no extension is needed — [Microsoft Learn: Chrome extension](https://learn.microsoft.com/en-us/purview/dlp-chrome-get-started)
- Symantec replaced Chrome hooking with an extension in 15.8. Incognito/InPrivate doesn't load extensions by default, so blocking unmanaged modes is a known requirement — [Broadcom KB 162676](https://knowledge.broadcom.com/external/article/162676/incidents-generated-by-endpoint-prevent.html)

### Inferences
- The extension approach is user-mode and doesn't break pinned apps, but needs MDM force-install policies, incognito blocking and a handshake with the local agent (native messaging host). The local-MITM approach sees all apps but needs root-CA trust, conflicts with cert pinning, and on macOS requires a Network Extension. A Network Extension is a user-space system extension, not a kext, so it is still within a "no kernel driver" constraint, but it needs Apple entitlements and MDM approval.

### Gaps
- No public source confirmed whether Symantec, Forcepoint or Cyberhaven do local TLS MITM on Windows.

## 4. Implementation tech stack (languages, installers, open-source components)

### Takeaway
Public data is thin. Postings stress native low-level systems work (Windows kernel/security APIs, Linux eBPF/kernel modules, macOS system sensor) and browser-extension engineering. Installers are PKG on macOS and script/MSI-style packages on Windows, deployed via Intune, Jamf, GPO or SCCM.

### Cited Findings
- Cyberhaven Windows posting asks for low-level Windows APIs and experience with a "large native application deployed to tens of thousands of users". No language is named — [Built In posting](https://builtinbengaluru.in/job/windows-endpoint-software-engineer/4453685)
- Cyberhaven Linux posting asks for eBPF, kernel modules and audit frameworks — [Wellfound](https://wellfound.com/jobs/2991697-linux-endpoint-engineer)
- Forcepoint macOS ships `WebsenseEndpoint.pkg` (legacy Websense naming persists in paths) — [Forcepoint v23](https://help.forcepoint.com/F1E/en-us/v23/ep_install/0805C597-1017-405E-868C-B7D7AEC58285.html)
- Purview profiles are open source on GitHub (microsoft/mdatp-xplat mobileconfig and schema.json) — [Microsoft Learn: macOS onboarding](https://learn.microsoft.com/en-us/purview/device-onboarding-offboarding-macos-any-mdm)
- Purview Windows onboarding uses script, GPO, SCCM, Intune and VDI packages — [Microsoft Learn](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)

### Inferences
- Windows drivers and agents in this category are typically C/C++, and macOS sysexts Swift/ObjC (industry norm, not confirmed per vendor here).

### Gaps
- No job posting fetched named C/C++/Rust/Go explicitly. I did not find vendor open-source components besides Microsoft's mdatp-xplat profiles.

## 5. Detection techniques (regex/keyword vs EDM/IDM/OCR/ML/lineage)

### Takeaway
Incumbents layer regex/keyword sensitive information types (SITs) with EDM, document fingerprinting, OCR and trainable (ML) classifiers. Cyberhaven differentiates on data lineage (origin-based classification). A regex-only cipher matches the baseline but not the "advanced classification" tier.

### Cited Findings
- Purview: SITs and labels are scanned on file create/modify. "Advanced classification" enables Document Fingerprinting, EDM-based SITs, trainable classifiers [ML] and named entities on macOS. OCR covers jpg/png/tif/bmp. Activity is detected by MIME type even when the extension is changed. Evaluation happens centrally, with roughly 1h policy sync. Just-in-time protection blocks egress of unevaluated files — [Microsoft Learn](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- Forcepoint ships a local `EndPointClassifier` process — [Forcepoint FDA v26](https://help.forcepoint.com/F1E/en-us/v26/ep_install/D19DA675-72CD-49BD-A5E6-529795064E80.html)
- DG: context/content/user classification, tags travel with files, 300+ file types, 90 languages, database record matching (EDM-like). Fortra's ChatGPT guidance flags or blocks prompts matching SSN/card/ITAR patterns — [dope.security citing Fortra](https://dope.security/post/digital-guardian-dlp-2026)
- Cyberhaven: lineage "tracing data from its origin to improve classification and protection"; marketing says "AI-enabled data lineage" [ML] — [Cyberhaven posting](https://builtinbengaluru.in/job/windows-endpoint-software-engineer/4453685)
- Teramind: OCR on screenshots — [rfp.wiki](https://www.rfp.wiki/it-security/security-information-and-event-management/insider-risk-management-solutions/proofpoint/teramind)

### Inferences
- Lineage needs high-fidelity file and process event streams (which file a clipboard copy came from, and that file's download origin). That is why Cyberhaven invests in kernel/eBPF sensors. In user mode this is approximable on macOS via ES (ES clients run in user space) and on Windows via ETW/USN journal, but at lower fidelity.

### Gaps
- No public detail on Symantec's or Trellix's endpoint-side fingerprinting implementation in this pass.

## 6. Tamper protection, performance/stability, deployment and macOS permissions

### Takeaway
Deployment converges on MDM-pushed PKG plus mobileconfig bundles (FDA, Accessibility, sysext, netfilter, notifications) on macOS, and Intune/GPO/SCCM on Windows. Performance and stability complaints are common for the legacy kernel-and-hook agents (Symantec, DG, Forcepoint) and are tied to policy complexity, app hooking and AV conflicts.

### Cited Findings
- Symantec: Broadcom documents CPU, memory and disk spikes tied to large data volumes and poorly written policies, and recommends disabling Local Drive Monitoring to isolate issues. A user reported slowness and agent hangs even after exclusions — [Broadcom KB 160326](https://knowledge.broadcom.com/external/article/160326/agent-performance-spikes.html); [Broadcom KB 160301](https://knowledge.broadcom.com/external/article/160301/diagnosing-endpoint-performance-issues.html); [Symantec Connect forum](https://www.symantec.com/connect/forums/dlpdlo-dlp-agent-and-dlo-agent-slow-performance-laptops-and-pc)
- Symantec Application Monitoring hooking makes some apps "run poorly", which leads to exclusions — [Broadcom KB 170410](https://knowledge.broadcom.com/external/article/170410/)
- DG: a PeerSpot reviewer called it "not stable, it's resource-consuming". Others report CPU concerns, complex policies and a hard first setup — [PeerSpot review](https://www.peerspot.com/product_reviews/digital-guardian-review-10378205-by-syed-mubeen); [dope.security summary](https://dope.security/post/digital-guardian-dlp-2026)
- DG claims tamper resistance, offline enforcement and optional Stealth Mode — [dope.security citing Fortra](https://dope.security/post/digital-guardian-dlp-2026)
- Forcepoint: Gartner/aggregator reviewers cite bugs and OS-compatibility problems (secondary source by a competitor) — [Nightfall: Forcepoint alternatives](https://nightfall.ai/blog/top-forcepoint-alternatives-and-competitors)
- Purview offline: Windows enforces cached policies offline. macOS does not support the offline/JIT functionality — [Microsoft Learn](https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about)
- macOS permission sets: Purview (FDA, Accessibility, sysext, network filter, notifications); Forcepoint (FDA for 4 processes, sysext, proxy); Symantec (FDA for edpa and SEHA.app, Firefox/Outlook MDM profiles); Teramind (Accessibility, Screen Recording, sysext); Endpoint Protector (FDA, network extension, trusted CA) — sources as cited in section 1
- FortiDLP (reference point): without MDM pre-approval, sysext and network extension prompts reappear on every boot — [Fortinet community](https://community.fortinet.com/fortidlp-66/technical-tip-deploying-macos-fortidlp-agents-via-jamf-187496)

### Inferences
- On Windows, tamper protection for kernel-based agents usually relies on protected services or driver self-protection. A user-mode cipher v1 can only use service recovery, ACLs and watchdogs. Admin users will be able to kill it, so this has to be framed as "deterrence plus telemetry on stop" rather than prevention.

### Gaps
- No vendor-specific tamper-protection internals were found (for example, PPL/ELAM usage). No Reddit threads surfaced in searches.

## 7. Pricing and positioning

### Takeaway
List pricing is mostly unpublished. Purview is bundled into Microsoft 365 E5/compliance SKUs (not verified this pass). Teramind is the only one with semi-public per-seat figures.

### Cited Findings
- Teramind: Starter ~$14, UAM ~$28, DLP ~$32 per seat per month (annual), Enterprise custom; another source says UAM $30 with a 5-seat minimum; CostBench says all tiers are custom. Sources conflict — [rfp.wiki](https://www.rfp.wiki/it-security/security-information-and-event-management/insider-risk-management-solutions/proofpoint/teramind); [Worktime review](https://www.worktime.com/blog/employee-monitoring/teramind-review-features-pricing-pros-and-cons); [CostBench](https://costbench.com/software/data-loss-prevention/teramind/)
- Cyberhaven: reported $250M raised (Khosla, Redpoint); positioned as AI-enabled data lineage — [search summary of Cyberhaven job listings](https://builtincharlotte.com/company/cyberhaven/jobs)
- DG/Fortra: SaaS on AWS, on-prem or managed service; claims full production in 90 days; no public price — [dope.security citing Fortra](https://dope.security/post/digital-guardian-dlp-2026)

### Gaps
- No public list prices for Cyberhaven, Forcepoint, Symantec, DG, Trellix or Endpoint Protector. Purview licensing SKUs were not verified in this pass.

## 8. Which incumbent techniques are reachable from user mode (for cipher v1)

### Takeaway
Most of what matters for "paste or upload into AI chat" is reachable without kernel drivers. That covers browser extensions with native messaging, clipboard inspection, macOS ES and Network Extension (both user-space system extensions), and gateway/SASE-style network inspection. The kernel-only capabilities are high-fidelity Windows file and network interception (minifilter/WFP), robust tamper resistance and complete lineage. The incumbents themselves are moving browser coverage out of hooks and into extensions.

### Cited Findings
- Symantec moved Chrome from hooking to an extension (15.8) and recommends Content Analysis Connectors — [Broadcom KB 162676](https://knowledge.broadcom.com/external/article/162676/incidents-generated-by-endpoint-prevent.html)
- Purview on Chrome is extension plus native messaging (MV3) — [Microsoft Learn](https://learn.microsoft.com/en-us/purview/dlp-chrome-get-started)
- Microsoft pushes GenAI traffic from apps and add-ins to network-level DLP via SASE, not the endpoint — [Microsoft Learn: network data security](https://learn.microsoft.com/purview/dlp-network-data-security-learn)
- Endpoint Protector's VPN interception moved from pf to a network extension — [Netwrix KB](https://docs.netwrix.com/docs/kb/endpointprotector/content-aware-protection-and-dpi/enabling-deep-packet-inspection-and-intercepting-vpn-traffic-on-macos-clients)

### Inferences
- **Reachable in user mode:** MV3 extension (paste, drop, input and file-input events, fetch/XHR body hooks in page context) plus a native messaging host to the local agent (Purview pattern); Windows clipboard listeners (AddClipboardFormatListener) and macOS NSPasteboard polling; macOS ES client and NE content filter/transparent proxy (user-space sysexts needing Apple entitlements and MDM approval); Windows ETW for process and network telemetry; UI Automation/Accessibility for the focused app; local or gateway TLS proxy with an MDM-pushed root CA (EPP pattern); MDM force-install and incognito-disable policies.
- **Kernel-only (on Windows):** blocking file writes to USB or shares in real time (minifilter); per-process blocking of arbitrary network flows (a WFP callout; user-mode WFP filters can block by app/port but not inspect payload); strong self-protection. Defer these or rely on OS features (Defender Device Control, Intune USB policies).
- **Risk to avoid:** user-mode DLL injection or API hooking into browsers and Office. This is the source of Symantec's documented stability problems and exclusion lists.

### Gaps
- No incumbent publicly documents a pure user-mode architecture. The feasibility statements above are engineering inference from platform knowledge, not vendor-sourced facts.
