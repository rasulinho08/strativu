# In-app onboarding, tutorials and guided setup for complex B2B / GRC SaaS (patterns, metrics, tooling for Next.js 16 / React 19)

Research date: 2026-10-14. About 22 search/fetch calls. Vendor benchmark figures come from vendors' own customer bases (Chameleon, Userpilot), so treat them as directional, not neutral industry statistics. Library facts (version, licence, peer deps, downloads) come from the live npm registry, queried 2026-10-14.

## 1. UX patterns: which ones work, when they fail

### Takeaway
The evidence argues against front-loaded "deck of cards" or forced auto-launched tours. In NN/g's study, tutorials did not improve task success and made tasks feel harder. In Chameleon's data, short (≤4–5 step), user-triggered tours launched from a launcher or checklist complete at about 2x the rate of blanket auto-triggered ones. For a complex GRC product the strongest pattern set is: role/goal-aware welcome, a persistent setup checklist (roadmap) tied to real actions, empty states with CTAs, contextual on-demand help, and short task-scoped interactive walkthroughs.

### Cited Findings
**Front-loaded tutorials (deck-of-cards / welcome carousels)**
- NN/g quantitative study (70 users, 4 iOS apps, between-subjects). Task success with tutorial was 91% vs 94% without (not significant, p=0.443). Task time was 93.5s vs 85.2s (not significant, excluding time spent reading the tutorial). Perceived ease (SEQ 1–7) was **worse** with the tutorial: 4.92 vs 5.49 (p=0.047) — [NN/g, Mobile-App Onboarding tutorials study](https://www.nngroup.com/articles/mobile-tutorials/)
- NN/g recommendations: "think twice" before building a tutorial, fix usability first, prefer contextual just-in-time help, and if onboarding is needed make it interactive rather than a manual to read — [NN/g](https://www.nngroup.com/articles/mobile-tutorials/)

**Product tours: length, triggering, progress**
- Chameleon Benchmark Report 2025 (550M+ interactions across tours, checklists, launchers, modals, microsurveys): 4-step tours have the highest completion; completion drops sharply beyond 5 steps, and tours of more than 5 steps lose more than half of users — [Chameleon Benchmark Report 2025](https://chameleon.io/benchmark-report)
- Click-triggered and "smart delay" tours outperform set-delay tours by 2–3x; self-triggered tours double engagement compared with automated, blanket-triggered tours — [Chameleon 2025](https://chameleon.io/benchmark-report)
- Progress indicators improve tour completion by about 12% — [Chameleon 2025](https://chameleon.io/benchmark-report)
- Tours launched from a launcher (resource-centre/checklist widget) complete at 67% vs 31% for non-launcher tours. Surveys show 54% vs 15% — [Chameleon 2025](https://chameleon.io/benchmark-report)
- Average time on tour rose from 132s to 154s (2024→2025). In 2024, all top-1% tours had ≤5 steps and were user-triggered — [Chameleon 2025](https://chameleon.io/benchmark-report)
- 2024 report: average tour completion was 33.5% across all tours vs 64% when the user chose to launch the tour — [Chameleon Benchmark 2024](https://www.chameleon.io/benchmark-report-24) (figure as reported via search snippet; full table is an image)
- A secondary write-up cites 72% completion for 3-step vs 16% for 7-step tours. I could not verify this in the primary report — [Chameleon blog: 550M data points](https://www.chameleon.io/blog/mastering-product-tours)

**Modals / welcome screens**
- Modal completion by trigger: custom/hover 51%, click 47%, immediate on page-load 39%. Average modal dismiss rate is 37.5% and average modal CTA click rate is 40% — [Chameleon 2025](https://chameleon.io/benchmark-report)

**Checklists / launchers / resource centre**
- 23% of users explore and click within a launcher, rising to 27% when the launcher has a welcome state. Users who interact complete an average of 5 checklist items per session — [Chameleon 2025](https://chameleon.io/benchmark-report)
- Userpilot 2025 benchmark: average onboarding-checklist completion is **19.2% (median 10.1%)** across 188 companies — [Userpilot SaaS Product Metrics Benchmark 2025](https://userpilot.com/saas-product-metrics/)

**Empty states and sample data**
- Recommended empty-state anatomy: a headline explaining the page's purpose, a description of what will appear, and a prominent CTA to create the first item. Link empty-state CTAs to checklist items so completing the action advances onboarding progress — [Produktly guide on empty states](https://produktly.com/guides/how-to-use-empty-states-for-onboarding)
- For complex features, provide sample data users can explore and let them delete or modify it rather than start from scratch, and test sample data vs guided creation — [Produktly](https://produktly.com/guides/how-to-use-empty-states-for-onboarding)
- CRM examples: HubSpot seeds default contacts that are real, editable records ("practice data" rather than decoration). Salesforce uses sandbox/demo data in trials, which matters for products with heavy setup and limited zero-state functionality — [Appcues: How 5 CRM tools onboard users past the empty state](https://appcues.com/blog/crm-software-user-onboarding); [InnerTrends blank-state examples](https://www.innertrends.com/blog/blank-state-examples)

**Enterprise in-app guidance precedents**
- Salesforce In-App Guidance: no-code floating and docked prompts, plus walkthroughs of up to 10 prompts that can span multiple pages, including pages reached only after an action. Admins can target guidance by profile and permission, and completion dashboards are available — [Salesforce Ben](https://www.salesforceben.com/salesforce-in-app-guidance/); [WalkMe on Salesforce in-app guidance](https://www.walkme.com/blog/salesforce-in-app-guidance/); [Salesforce Admins blog](https://admin.salesforce.com/blog/2019/drive-adoption-and-boost-productivity-with-in-app-guidance)
- Vanta (direct GRC competitor) uses an in-app **Compliance Roadmap** reached from the profile menu. It walks users through the product and the steps needed to use Vanta effectively, auto-hides 3 days after completion, and can still be reopened from the profile menu. A "?" icon gives access to the Help Center, Community, Product Feedback and Live Training. Vanta also maintains Getting Started Guides per area (Personnel, Policies, Workspaces, GRC implementation) — [Vanta Help: Getting started resources in Vanta](https://help.vanta.com/en/articles/11345375-getting-started-resources-in-vanta); [Vanta Getting Started Guides](https://help.vanta.com/en/collections/12575234-getting-started-guides)

### Inferences
- **Welcome screen / role-goal selection:** a short one-screen welcome that asks role and goal (e.g. "Prepare for ISO 27001 audit", "Run vendor risk reviews", "Track incidents"), then routes to a filtered checklist, is consistent with the evidence. A multi-slide product tour on first login is not. Avoid page-load modals because they have the lowest completion (39%).
- **Setup wizard vs checklist:** use a short, blocking wizard only for true prerequisites the tenant admin must decide once (organisation profile, language, frameworks in scope, invite colleagues). Everything else belongs in a non-blocking, persistent, resumable checklist/roadmap like Vanta's. Low average checklist completion (19%, median 10%) means the checklist must be short, role-specific and tied to real actions, and it must not be the only activation lever.
- **Tours/hotspots:** keep each tour ≤4–5 steps, scoped to one task ("create your first risk"), launched from the checklist, the help widget or an empty state rather than auto-run. Hotspots/beacons suit discovering secondary features (e.g. risk-control mapping, the trust-center publish toggle).
- **Interactive "do it" walkthroughs** (advance only when the user performs the action) suit GRC best because value comes from real records (the first control, the first risk assessment). This matches NN/g's "make it interactive" advice and Salesforce's action-spanning walkthroughs.
- **Sample data:** for a compliance product, in-tenant sample records can contaminate audit evidence and reports. Prefer either (a) a separate demo/sandbox tenant, or (b) clearly tagged sample records (an `is_sample` flag, a visual "Sample" badge, excluded from reports, exports and the trust center) with a one-click "remove sample data" action by the admin. Option (b) is an inference; no source covered the "clear sample data" mechanics.
- **In-app video:** no quantitative source found. Short (<2 min) task videos inside the help widget are a reasonable complement for the Azerbaijani/Russian/Turkish audience if subtitled, but they are expensive to localise and keep current.

### Gaps
- No independent (non-vendor) data on skip rates for B2B enterprise tours. NN/g's study is mobile and consumer-ish.
- No source on in-app video effectiveness, or on how products implement "clear sample data" safely.
- NN/g has further articles on contextual help, progressive disclosure and empty states that I did not fetch due to the call budget.

## 2. Role-based onboarding (tenant admin vs module owners vs contributors vs auditors; purchaser vs invited users)

### Takeaway
Mature platforms target guidance by role/profile/permission, with Salesforce In-App Guidance as the clearest precedent. In GRC360 the permission model should drive which checklist, tours and empty-state CTAs a user sees, so that no tutorial points to a module the user cannot access.

### Cited Findings
- Salesforce In-App Guidance can be restricted to specific profiles and permissions — [Salesforce Ben](https://www.salesforceben.com/salesforce-in-app-guidance/)
- Commercial DAPs segment by user attributes. Chameleon meters "Monthly Tracked Users", i.e. identified user profiles sent with attributes, which are used for targeting — [Chameleon Appcues alternatives page / pricing explanation](https://www.chameleon.io/alternative/appcues-alternatives)
- Vanta's roadmap is a per-user in-app onboarding surface and is separate from help-center role guides (Personnel Hub, Policies, etc.) — [Vanta Help](https://help.vanta.com/en/articles/11345375-getting-started-resources-in-vanta)

### Inferences
- Suggested role tracks for GRC360:
  - **Purchasing/tenant admin:** org profile → frameworks/scope → invite users and assign roles → assign module owners → connect integrations → branding/trust center → language.
  - **Module owner** (e.g. risk owner, third-party manager): a module-specific checklist ("import your vendor list", "run first assessment", "link controls").
  - **Contributor:** "your assigned tasks" inbox, how to submit evidence, and notification settings. Keep it to 2–3 steps.
  - **Auditor/read-only:** where to find evidence, reports and exports. Give no creation tours and hide CTAs they cannot act on.
- Invited users should skip the tenant-setup wizard entirely and land on a role-specific welcome that names who invited them and what they've been assigned. This is a "reason to be here" pattern rather than a product tour.
- Feature gating: compute tutorial eligibility from the same permission set as the navigation (server-side) so tours never target hidden DOM elements. This is also a robustness issue, since tour libraries fail when the target element is missing.

### Gaps
- I found no published case study from Drata/Vanta/OneTrust detailing role-differentiated in-app onboarding flows. Vanta's roadmap item list is not public.

## 3. Enterprise B2B specifics: human-led + in-product, multi-week setup, saving progress, delegating setup tasks

### Takeaway
Enterprise GRC onboarding runs for weeks and is partly human-led (kickoff, implementation). The in-product layer should act as the shared, persistent "implementation plan" (Vanta's Compliance Roadmap is the model). That means server-persisted progress, delegable tasks, and links to live training/help, rather than a one-session tour.

### Cited Findings
- Vanta pairs in-app onboarding tools (Compliance Roadmap) with Live Training, Community and Help Center access from the app, and with getting-started guides for GRC implementation — [Vanta Help](https://help.vanta.com/en/articles/11345375-getting-started-resources-in-vanta); [Vanta Getting Started Hub](https://help.vanta.com/en/collections/12575233-getting-started-hub)
- A third-party listing describes Vanta's setup as prompting through each step, such as adding admins and integrating systems — [BuiltFirst Vanta listing](https://marketplace.builtfirst.com/vanta-vanta) (marketing source; low weight)
- Userpilot 2025: sales-led (SLG) companies showed higher activation (41.6% vs 34.6%), slightly shorter TTV and higher checklist completion (22.1% vs 19%) than product-led companies — [Userpilot benchmark (via search summary)](https://userpilot.com/saas-product-metrics/)

### Inferences
- The checklist should be a backend entity per tenant (shared items, e.g. "Define risk methodology") **and** per user (personal items, e.g. "Complete profile"). Tenant items need assignee, due date, status and a link to the screen/action that completes them, with auto-completion when the underlying record exists.
- "Assign this setup task to a colleague" should create a normal GRC360 task/notification, reusing the existing task/assignment infrastructure, so customer success managers and admins can track it like any other work item.
- Expose a CSM/implementation view: per-tenant setup progress (percent complete per module) for internal success teams. This replaces the need for third-party DAP analytics.
- Allow dismiss/snooze and "show again" from the help menu, as Vanta auto-hides 3 days after completion with reopen.

### Gaps
- No quantitative source on multi-week enterprise onboarding durations for GRC tools, or on how human-led kickoffs integrate with in-app checklists (vendor CS playbooks are not public).

## 4. Metrics: activation, time-to-value, checklist completion, funnels, benchmarks

### Takeaway
Define activation as a product-specific "first real value" event per role (e.g. tenant admin: frameworks selected + ≥N controls/risks recorded + ≥1 colleague invited). Track TTV, checklist completion and per-step funnel drop-off. Vendor benchmarks (B2B SaaS average activation ~37.5%, TTV ~1.5 days, checklist completion ~19%) give only coarse reference points, and fintech/regulated categories differ strongly.

### Cited Findings
- Userpilot SaaS Product Metrics Benchmark 2025 (published 2025-09-12; 547 companies, 7 industries; data from Userpilot customers' dashboards) — [Userpilot](https://userpilot.com/saas-product-metrics/):
  - Activation rate: average 37.5%, median 37.04% (n=62)
  - Time to value: average 1 day 12h 23m, median 1 day 1h 54m (n=62)
  - Onboarding checklist completion: average 19.2%, median 10.1% (n=188)
  - Core feature adoption: average 24.5%, median 16.5% (n=181)
  - Month-1 retention: average 46.9%, median 45.25% (n=83)
  - FinTech & Insurance (closest to regulated/GRC buyers): activation 5%, TTV 1d 17h, checklist completion 24.5%, core-feature adoption 22.6%, M1 retention 57.6% (highest). HR: activation 8.3%, TTV 3d 19h (slowest). The page has some mislabelled industry captions, and per-industry sample sizes are not given.
- Chameleon 2025: average time on tour 154s; launcher-driven tour completion 67%; modal dismiss 37.5% — [Chameleon](https://chameleon.io/benchmark-report)
- Chameleon 2024: average tour completion 33.5%, or 64% when the user launched the tour — [Chameleon 2024](https://www.chameleon.io/benchmark-report-24)
- Salesforce offers engagement dashboards (AppExchange) reporting walkthrough completion, a precedent for measuring guidance itself — [Salesforce Admins blog](https://admin.salesforce.com/blog/2019/drive-adoption-and-boost-productivity-with-in-app-guidance)

### Inferences
- Recommended GRC360 metric set:
  - Activation: per role, measured within 14/30 days of first login.
  - TTV: tenant created → first "meaningful artefact", such as the first risk assessed, the first control with evidence, or the first vendor assessed.
  - Setup funnel: per checklist step, started vs completed, time per step, step owner.
  - Guidance metrics: tour start/complete/skip, checklist item completion, help-widget searches with no result.
  - Outcome: active users per module at week 4/8 and seats invited vs active.
- The low vendor activation numbers for regulated categories (fintech 5%) suggest benchmarks should come from GRC360's own baseline rather than external averages.

### Gaps
- No GRC/security-specific public benchmark exists. No independent (non-vendor) benchmark was found. Pendo's and Appcues' benchmark reports were not fetched.

## 5. Tooling: open-source libraries, commercial platforms, build-your-own

### Takeaway
For a closed-source commercial GRC product, **Shepherd.js and Intro.js are AGPL-3.0 and require a paid commercial licence** (cheap, one-off). **react-joyride (MIT, v3 supports React 19)** and **driver.js (MIT, framework-agnostic, the most downloaded)** are the safest open-source choices. Commercial DAPs (Appcues, Pendo, Userpilot, Userflow, Chameleon, UserGuiding) inject third-party JS and send user/tenant data to the vendor. That is a material data-privacy and supply-chain concern for a security product sold to regulated customers. Only Whatfix documents a true on-premise mode. The recommended route is build-your-own state and checklist in the GRC360 backend plus an MIT tour renderer.

### Cited Findings
**Open-source libraries (npm registry data, queried 2026-10-14; weekly downloads for 6–12 Oct 2026)**

| Package | Latest (date) | Licence | React peer range | Weekly downloads | Notes |
|---|---|---|---|---|---|
| react-joyride | 3.2.0 (2026-07-09) | MIT | 16.8 – 19 | ~1.39M | v3: hooks API (`useJoyride`), focus trapping, keyboard nav, ARIA, SSR-safe (Next.js named), ~30% smaller than v2 |
| driver.js | 1.9.0 (2026-10-03) | MIT | none (vanilla TS) | ~2.29M | No dependencies, keyboard-controllable; repo now under `nilbuild/driver.js` |
| shepherd.js | 15.3.0 (2026-08-24) | AGPL-3.0 (+ commercial) | n/a | ~347K | Commercial licence needed for commercial use |
| react-shepherd | 7.0.6 (2026-08-24) | AGPL-3.0 | ^18 \|\| ^19 | – | React wrapper for Shepherd |
| intro.js | 8.6.0 (2026-09-21) | AGPL-3.0 (+ commercial) | n/a | ~188K | Commercial licence needed |
| intro.js-react | 1.0.0 (2023-05-09) | MIT (wrapper) | react >=0.14 | – | Stale wrapper; core still AGPL |
| @reactour/tour | 3.8.0 (2025-05-07) | MIT | 16–19 | ~194K | No release in ~17 months |
| onborda | 1.2.5 (2024-12-22) | MIT | react >=18, next >=13, framer-motion | ~30K | Next.js-specific; inactive since Dec 2024 |
| nextstepjs | 2.3.0 (2026-07-20) | MIT | react >=18, next >=13, motion | ~70K | Onborda-style, actively maintained, supports Next/React Router/Remix |
| @onboardjs/react + core | 1.0.0-rc.5 / rc.4 (2026-05-18) | core MIT; react pkg has no licence field | ^18 \|\| ^19 | ~5K | Headless flow engine (steps, conditions, persistence), still release-candidate |

Sources: [npm react-joyride](https://www.npmjs.com/package/react-joyride), [react-joyride README](https://raw.githubusercontent.com/gilbarbara/react-joyride/HEAD/README.md), [npm driver.js](https://www.npmjs.com/package/driver.js), [npm shepherd.js](https://www.npmjs.com/package/shepherd.js), [npm react-shepherd](https://www.npmjs.com/package/react-shepherd), [npm intro.js](https://www.npmjs.com/package/intro.js), [npm intro.js-react](https://www.npmjs.com/package/intro.js-react), [npm @reactour/tour](https://www.npmjs.com/package/@reactour/tour), [npm onborda](https://www.npmjs.com/package/onborda), [npm nextstepjs](https://www.npmjs.com/package/nextstepjs), [npm @onboardjs/react](https://www.npmjs.com/package/@onboardjs/react), [npm registry API](https://registry.npmjs.org/react-joyride), [npm downloads API](https://api.npmjs.org/downloads/point/last-week/react-joyride)

- Shepherd.js is dual-licensed AGPL-3.0 / commercial. Commercial use (revenue-generating, closed source, white-label) requires a licence, even if the specific project is internal — [Shepherd LICENSE](https://unpkg.com/angular-shepherd@22.0.0/LICENSE.md); [Shepherd GitHub](https://github.com/shipshapecode/shepherd). Pricing: Business $50 lifetime (up to 5 projects), Enterprise $300 lifetime (unlimited projects, 6 months of support) — [shepherdjs.dev/pricing](https://www.shepherdjs.dev/pricing)
- Intro.js is AGPL, and commercial use needs a commercial licence that keeps your source proprietary. Lifetime tiers run roughly $9.99 (1 project), $49.99 (5 projects) and $299.99 (unlimited) — [Intro.js licence docs](https://introjs.com/docs/getting-started/license); [Intro.js checkout](https://introjs.com/checkout)
- A third-party comparison claims Shepherd is MIT. This **conflicts** with Shepherd's own licence file and with the npm registry ("AGPL-3.0") — [Produktly comparison](https://produktly.com/compare/intro-js-vs-shepherd-js) vs [npm registry](https://registry.npmjs.org/shepherd.js)
- OnboardJS is a headless engine (step sequencing, conditional skips, persistence), with `@onboardjs/react` providing provider and hooks. It is used in Next.js via an `OnboardingProvider` in client components — [DEV: OnboardJS Next.js guide](https://dev.to/somafet/building-dynamic-user-journeys-your-guide-to-nextjs-onboarding-with-onboardjs-549e)
- Onborda: Next.js + Framer Motion + Tailwind, targets by element id, custom card component, shadcn-compatible — [bestofjs Onborda](https://bestofjs.org/projects/onborda)
- React 19 peer-dep conflicts make npm fail with ERESOLVE unless `--legacy-peer-deps`/`--force` is used, while pnpm/bun only warn. Prefer libraries declaring React 19 — [shadcn/ui React 19 guide](https://ui.shadcn.com/react-19)

**Commercial digital-adoption platforms (DAPs)**
- Appcues: plans Start (≤3,000 MAU, 10 published experiences), Grow (from 3,000 MAU, 25 experiences) and Enterprise (custom, 100 experiences). Prices are not published (based on MAU, installations, experiences) — [Appcues pricing](https://www.appcues.com/pricing). Third-party sources cite about $300/mo (Start, 1K MAU) and $750/mo (Grow), annual billing — [toolradar Appcues](https://toolradar.com/tools/appcues/pricing) (unverified)
- Userpilot: from about $299/mo (Starter); Growth and Enterprise are custom — [Trupeer comparison](https://www.trupeer.ai/id/blog/userpilot-alternatives); [toolradar Userpilot](https://toolradar.com/tools/userpilot/pricing) (third-party)
- Userflow: third-party sources conflict ($299/mo for 10K MAU vs $400/mo for 1K MAU). The official pricing page returned 403 to my fetch — [koji Appcues alternatives](https://www.koji.so/blog/appcues-alternatives-2026); [dupple](https://dupple.com/learn/best-ai-customer-onboarding-tools)
- Chameleon meters Monthly Tracked Users (unique identified profiles in the prior 30 days). The entry tier is cited at about $279 for 2,000 MTU — [Chameleon alternatives page](https://www.chameleon.io/alternative/appcues-alternatives); [koji Chameleon alternatives](https://www.koji.so/blog/chameleon-alternatives-2026)
- Pendo: free up to 500 MAU. Paid Base/Core/Ultimate plans are quote-only, with third-party estimates of $20K+/year minimum — [costbench Pendo](https://www.costbench.com/software/digital-adoption-platform/pendo-dap/alternatives/); [UserGuiding on Pendo pricing](https://userguiding.com/blog/pendo-pricing). Pendo offers an EU environment (GCP), but one source notes its EU data-subject page still describes services as hosted/operated in the US, so confirm per contract — [europeanpurpose.com](https://europeanpurpose.com/alternative-to/pendo)
- UserGuiding: paid from about $174/mo (Starter) and $349/mo (Growth), yearly for about 2,000 MAU. The official pricing page lists "Optional EU Data Hosting" — [UserGuiding pricing](https://userguiding.com/pricing); [rfp.wiki comparison](https://www.rfp.wiki/hr-office/digital-adoption-platforms/userguiding/pendo)
- Whatfix: **Self-hosted** (author in Whatfix cloud, export content to your servers, all features) and **On-premise** (fully disconnected Studio and Dashboard, for high-security or strict data-residency orgs). In on-prem mode updates are delivered as packages the customer's IT installs manually, and integrations such as Amplitude, GA and Vimeo are not feasible — [Whatfix: self-hosted vs on-premise](https://support.whatfix.com/docs/what-is-the-difference-between-self-hosted-and-on-premise-deployment-models); [Whatfix: host content on-premise](https://support.whatfix.com/docs/host-whatfix-content-on-premise.md)
- WalkMe: the only claim found (from a competitor) is that it offers private-cloud options and "EncryptMe" encryption. Not verified — [Guidde comparison](https://www.guidde.com/tool-comparison/whatfix-vs-walkme-enterprise-readiness-comparison-2026)

### Inferences
- **Licence:** GRC360 is closed-source and commercial, so do not use Shepherd/Intro.js under AGPL. Either buy the commercial licence (≤$300 one-off) or use MIT react-joyride/driver.js/nextstepjs.
- **React 19 / Next 16:** react-joyride 3.x explicitly declares React 19 and SSR-safety; render it in a `'use client'` component. driver.js has no React peer dependency, so React-version risk is nil, but you wire it imperatively in `useEffect`. Onborda is stale; nextstepjs is the maintained alternative of that style but pulls `motion`.
- **Commercial DAPs for a security product:** each injects a third-party script into an app holding customers' risk, incident and vendor data. That creates (a) a new sub-processor to disclose in DPAs/trust center, (b) a supply-chain/XSS surface that conflicts with a strict CSP, (c) data-residency questions for Azerbaijani/Turkish/EU regulated buyers, and (d) cost scaling per MAU. Only Whatfix offers documented disconnected on-prem. For regulated customers, build-your-own is the defensible default.
- **Recommended build-your-own architecture** (inference): backend tables for `onboarding_flow` / `checklist_item` definitions (versioned, role-targeted, localised strings), `user_onboarding_state` (per user: seen/dismissed/completed tours, current step) and `tenant_setup_task` (per tenant: assignee, status, due, auto-complete rule). The frontend has a provider that fetches state once and exposes `useOnboarding()`, an MIT tour renderer, a checklist/launcher widget in the shell, and empty-state components bound to checklist items. Analytics events go to GRC360's own audit/analytics pipeline.

### Gaps
- Official current pricing pages for Userflow (403), Userpilot, Chameleon and Pendo were not retrieved. Prices above are third-party and may be stale.
- WalkMe's on-prem/self-host status is unconfirmed. Pendo/Userflow SOC 2 / ISO 27001 status was not checked (they usually publish trust pages).
- I could not confirm react-joyride v3 i18n props or the floating-ui dependency (the README does not mention them). Check https://react-joyride.com/docs.

## 6. Localisation (az/tr/ru/en) and accessibility (WCAG) of tours

### Takeaway
Tour, checklist and help content must be localised through the same i18n pipeline as the app. Libraries only provide button-label props, so step text should be translation keys, not hard-coded strings. Spotlight tours carry real accessibility risk (background focus leakage, purely visual pointing). Follow the WAI-ARIA dialog pattern: focus moves into the step, is trapped, Esc closes, focus returns to the trigger. Always allow skipping and re-launching tours from a help menu.

### Cited Findings
- Accessible modal/tour practice: the step takes focus immediately and keeps focus inside until the user progresses or dismisses. Focus stays in the active layer while the backdrop is visible and returns to the triggering element on close. Automated scanners usually miss return-focus and Escape behaviour, so manual testing is needed — [Appcues accessibility FAQ](https://testcompany-appcues.helpjuice.com/user-experiences-faq/faq-accessibility); [Toyota Europe design-system backdrop accessibility](https://dx-playbook-prev.toyota-europe.com/cds/components/backdrop-pages/accessibility/); [ADA Compliance Pros: accessible modal](https://www.adacompliancepros.com/blog/accessible-modal-dialog)
- Tooltips/hotspots: screen readers can announce the anchored element if it has an associated id (e.g. via aria-describedby) — [UserGuiding accessibility](https://help.userguiding.com/en/articles/8586724-accessibility-in-userguiding)
- Spotlight/coach-mark tours: dimmed background may remain focusable, and pointing relies on visual position that screen-reader users cannot perceive. A low-vision practitioner recommends reproducing the referenced element or its description inside the tooltip and always allowing skip — [WebAIM discussion list](https://webaim.org/discussion/mail_message?id=40942)
- WCAG 1.4.13 "Content on Hover or Focus" probably does not apply to tours opened and closed by explicit button press. The Drupal thread left this open and pointed to the WAI-ARIA tooltip/dialog patterns — [Drupal issue](https://www.drupal.org/node/2961001)
- react-joyride v3 claims focus trapping, keyboard navigation and ARIA support. driver.js claims full keyboard control (no WCAG audit published) — [react-joyride README](https://raw.githubusercontent.com/gilbarbara/react-joyride/HEAD/README.md); [npm driver.js](https://npmjs.com/package/driver.js)
- Commercial DAPs publish their own accessibility notes (Appcues, UserGuiding) — [UserGuiding accessibility](https://help.userguiding.com/en/articles/8586724-accessibility-in-userguiding)

### Inferences
- Localisation:
  - Store step titles/bodies as i18n keys in the existing GRC360 locale files, or as localised fields in the backend flow definitions.
  - Allow ~30–40% text expansion (Russian/Turkish/Azerbaijani are longer than English), so tooltip width and placement must handle it.
  - Format dates/numbers per locale.
  - Pass localised Back/Next/Skip/Done labels to the library (react-joyride and driver.js accept custom button text/components).
  - Videos need subtitles per language rather than re-recording.
  - Azerbaijani Latin script needs fonts that cover ə, ğ, ı, ş and similar characters.
- Accessibility checklist:
  - Each step is a non-modal or modal dialog with `role="dialog"`, `aria-labelledby` and `aria-describedby`, plus a "Step X of Y" text.
  - Visible focus indicator (WCAG 2.2 2.4.7 / 2.4.11 focus not obscured, which is relevant because overlays can hide focus).
  - Target sizes ≥24px (2.5.8), contrast ≥4.5:1, and support for `prefers-reduced-motion` for animated spotlights.
  - No timed auto-advance (2.2.1).
  - Tours must never be the only way to learn a task: the same content should also live in the help center.

### Gaps
- No authoritative source maps product-tour steps to WCAG 2.2 success criteria. The WAI-ARIA APG dialog and tooltip patterns were not fetched.
- No source on onboarding localisation specific to Azerbaijani/Turkish/Russian, and no data on text expansion for Azerbaijani.
- Library-level i18n/RTL support was not verified for each library.
