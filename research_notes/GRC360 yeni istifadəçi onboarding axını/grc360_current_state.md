# GRC360 current state for new-customer onboarding (code and documentation audit, read-only)

Scope and method. Read-only review of:
- **Frontend (FE):** `/home/user/grc_frontend_code`, branch `claude/elegant-bardeen-f4g0o0` at `43b67d0`. Its `src/` is identical to `origin/main` at `7344935` (2026-10-08). The branch adds only `doc/guide/`. The local `main` ref is stale at `7aa073c`, so `origin/main` is the reference.
- **Backend (BE):** `/home/user/grc_backend_code`, branch `develop` at `0ebdab0` (2026-10-08).
- **Guide:** `/home/user/grc_frontend_code/doc/guide/`, written from the code in October 2026.

Path conventions:
- `FE/` means `/home/user/grc_frontend_code/src/`.
- `BE/` means `/home/user/grc_backend_code/src/main/java/com/strativu/grc360/`.
- `BE-res/` means `/home/user/grc_backend_code/src/main/resources/`.
- `GUIDE/` means `/home/user/grc_frontend_code/doc/guide/`.

"Verified" means the claim was checked in the source by this audit. Claims without that label are taken from the guide; their sources are the guide pages, which themselves cite code lines.

## 1. Tenant creation, provisioning and default seed data

### Takeaway
GRC360 has no tenant-provisioning flow that produces a usable organisation. `POST /api/v1/tenants` inserts only a tenant row: no admin user, groups, permissions or lookup data. The only code that creates a tenant together with sign-in accounts is a dev-profile initializer that creates a hard-coded "Test Tenant" with demo accounts. Several per-tenant defaults (risk scales, some value lists) are created lazily on first read, and the built-in groups are created only at application startup for tenants that already have users.

### Cited Findings
- **Tenant creation.** `TenantApplicationService.createTenant()` validates name, plan and subdomain, calls `tenantDomainService.createTenant`, optionally applies branding, saves the tenant and returns. Nothing else is created: no user, roles or seed data. — [BE/application/tenant/TenantApplicationService.java:53-79](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/application/tenant/TenantApplicationService.java) (verified)
- **Tenant API.** `TenantController` exposes 9 operations under `/api/v1/tenants`: create, get, list active, upgrade plan, update branding, health, can-upgrade, suspend and activate. — [BE/presentation/web/tenant/TenantController.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/presentation/web/tenant/TenantController.java) (verified)
- **Tenant API access.** All `/api/v1/tenants/**` methods only require `hasRole(ADMIN)`, which is the ADMIN of any tenant, so the endpoint is not restricted to a platform operator. — [BE/config/SecurityConfig.java:169-172](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/config/SecurityConfig.java) (verified)
- **The web client never calls the tenant API.** — [GUIDE/05-technical/01-architecture.md, Multi-tenancy table](/home/user/grc_frontend_code/doc/guide/05-technical/01-architecture.md); listed as known issue PD-01 (High) in [GUIDE/appendices/known-issues.md](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Plans and limits.** `TenantPlan` defines BASIC (10 users, 1 GB), PROFESSIONAL (50 users, 10 GB), ENTERPRISE (200 users, 100 GB) and CUSTOM. `CreateTenantRequest` requires name, plan and subdomain. — [BE/domain/tenant/TenantPlan.java:15-33](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/domain/tenant/TenantPlan.java); [BE/application/tenant/dto/CreateTenantRequest.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/application/tenant/dto/CreateTenantRequest.java) (verified)
- **Limits are not enforced.** `validateTenantLimits` is never called outside the tenant package. — grep over `BE/` (verified)
- **No provisioning event.** There is no `TenantCreated` event or listener that seeds a new tenant. — grep over `BE/` (verified)
- **Built-in groups and permissions.** `DefaultRoleSeedService.sync()` upserts the permission catalogue and the built-in groups Admin, Read Only and Third Party. — [BE/modules/organization/seed/DefaultRoleSeedService.java:45-58](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/organization/seed/DefaultRoleSeedService.java) (verified)
- **When that seeding runs.** It runs in three places:
  - At startup, through `PermissionCatalogSyncRunner`, only for tenant ids found by `userRepository.findDistinctTenantIds()`, which means only tenants that already have organisation users. — [BE/modules/organization/seed/PermissionCatalogSyncRunner.java:37-55](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/organization/seed/PermissionCatalogSyncRunner.java) (verified)
  - Through the manual endpoint `POST .../permissions/seed` ("Force seed default roles and permissions"). — [BE/modules/organization/api/RoleController.java:117-121](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/organization/api/RoleController.java) (verified)
  - In `DevDataInitializer`. — [BE/config/DevDataInitializer.java:104](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/config/DevDataInitializer.java) (verified)
- **Bootstrap tenant and accounts.** `DevDataInitializer` is the only code that creates a tenant plus accounts. It is annotated `@Profile("dev")`, uses tenant `550e8400-e29b-41d4-a716-446655440000` ("Test Tenant", plan BASIC) and creates `test@example.com` with password `password123`. — [BE/config/DevDataInitializer.java:33, 77-78, 368](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/config/DevDataInitializer.java) (verified)
- **What a fresh dev database also gets.** The guide says `DevDataInitializer` additionally creates:
  - the departments IT, HR, Finance, Risk & Compliance, Security, Marketing, Operations and Legal;
  - the organisations "Strativu Tech" and "Strativu Legal";
  - four accounts: `test@example.com`, `alex.meian@`, `sara.j@` and `mike.b@`. — [GUIDE/05-technical/02-installation-and-deployment.md, "First start and seeding"](/home/user/grc_frontend_code/doc/guide/05-technical/02-installation-and-deployment.md)
- **Lazy risk defaults.** On first read, `RiskSettingsServiceImpl.ensureDefaults()` creates:
  - the THRESHOLD calculation method ("Threshold Matrix Method", enabled);
  - LIKELIHOOD and IMPACT classification types, each with 5 values (Rare … Almost certain; Negligible … Critical) and colours;
  - an appetite setting with `numericalAppetite=50.0` and `residualThreshold=30.0`. — [BE/modules/risk/service/impl/RiskSettingsServiceImpl.java:56-125](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/risk/service/impl/RiskSettingsServiceImpl.java) (verified)
- **Defaults that create a known problem.** With these defaults, "Above Appetite" can never occur: the maximum score on a 5×5 scale is 25, below the appetite of 50. — [GUIDE/appendices/known-issues.md RM-02](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Other lazy value lists.**
  - Objective audit result options: `ObjectiveAuditResultOptionServiceImpl.seedDefaults()` runs when the list is empty. — [BE/modules/governance/service/impl/ObjectiveAuditResultOptionServiceImpl.java:36-37, 114](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/governance/service/impl/ObjectiveAuditResultOptionServiceImpl.java) (verified)
  - Control Center catalogues: `ControlCatalogOptionServiceImpl` saves `defaultsFor(kind)` when a catalogue is empty. — [BE/modules/control/service/impl/ControlCatalogOptionServiceImpl.java:39](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/control/service/impl/ControlCatalogOptionServiceImpl.java) (verified)
- **No default incident stages.** `DefaultIncidentStageCleanupRunner` removes previously seeded default stages, and the guide's setup step 13 asks the customer to define stages themselves. — [GUIDE/05-technical/02-installation-and-deployment.md](/home/user/grc_frontend_code/doc/guide/05-technical/02-installation-and-deployment.md); [GUIDE/01-getting-started/03-first-time-setup.md §13](/home/user/grc_frontend_code/doc/guide/01-getting-started/03-first-time-setup.md)
- **No framework content.** "GRC360 does not include framework texts." Each framework is created as an empty compliance package and its items are entered by hand or loaded from CSV. — [GUIDE/01-getting-started/03-first-time-setup.md §9](/home/user/grc_frontend_code/doc/guide/01-getting-started/03-first-time-setup.md)
- **No framework content in the code either.** The package form's only framework reference is the placeholder text "ISO 27001, PCI, Etc." — [FE/domain/compliance-hub/FrameworksPage.tsx:192](/home/user/grc_frontend_code/src/domain/compliance-hub/FrameworksPage.tsx) (verified)
- **Email templates.** No tenant-seeded email templates are in use. The only mail body is the invitation, built inline in Java by `inviteEmailBody()`. The `NotificationTemplate` entity and repository exist but no tenant seeding was found. — [BE/modules/auth/service/impl/AuthServiceImpl.java:542-600](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/service/impl/AuthServiceImpl.java); [BE/modules/notification/entity/NotificationTemplate.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/notification/entity/NotificationTemplate.java) (verified)
- **Fresh installs start empty.** Outside the dev profile, a fresh installation has no tenant and no user, and creating a tenant needs an existing ADMIN. The guide documents two workarounds:
  1. Start once with `SPRING_PROFILES_ACTIVE=docker,dev`.
  2. Insert the tenant, `user_accounts` and role rows with hand-written SQL.

  It flags this as PD-12. — [GUIDE/05-technical/02-installation-and-deployment.md, "Bootstrapping a new installation"](/home/user/grc_frontend_code/doc/guide/05-technical/02-installation-and-deployment.md); [GUIDE/appendices/known-issues.md PD-12](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Other seed sources do not help.**
  - `DummyDataSeeder` (`@Profile("dev")` plus `grc.seed.dummy-data=true`) writes into tenant `00000000-0000-0000-0000-000000000001`, for which no tenant row is created. — [BE/seed/DummyDataSeeder.java:35-42](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/seed/DummyDataSeeder.java) (verified)
  - `db/seed-data.sql` is outdated and does not match the schema. — [GUIDE/05-technical/02-installation-and-deployment.md](/home/user/grc_frontend_code/doc/guide/05-technical/02-installation-and-deployment.md)
- **Tenant isolation is application-level only.** Isolation is by `tenant_id` in queries. The RLS migration V13 is not applied because Flyway is disabled. — [GUIDE/05-technical/01-architecture.md, Multi-tenancy](/home/user/grc_frontend_code/doc/guide/05-technical/01-architecture.md); [BE-res/db/migration/V13__tenant_rls_policies.sql](/home/user/grc_backend_code/src/main/resources/db/migration/V13__tenant_rls_policies.sql)

### Inferences
- A real customer onboarding today needs engineering or SQL work, or the risky dev profile, before the first admin can sign in. "Create the organisation plus first admin plus default content" in one operation is the most basic missing piece.
- Because built-in groups are synced only at startup for tenants with users, a tenant created through `POST /tenants` will have no Admin group until someone calls `/permissions/seed` or restarts the server after adding a user.
- The lazy-default pattern (`ensureDefaults` when empty) already exists. It is a natural place to hang "starter content" packs, such as default incident stages, risk scales with a sensible appetite, or framework templates.

### Gaps
- `TenantDomainService.createTenant` was not read in full, so no side effects inside the domain service were confirmed or ruled out; the application service shows none.
- Whether production (grc360.strativu.com) runs one tenant per customer or one deployment per customer cannot be determined from code alone.

## 2. Existing onboarding, first-login, help and sample-data features

### Takeaway
There is no onboarding UI of any kind. No setup wizard, welcome screen, checklist, product tour, contextual help, in-app documentation link or sample-data switch exists. After sign-in every user goes straight to the Command Center. The only "getting started" content is the new Markdown guide on the documentation branch, which is not linked from the app.

### Cited Findings
- **No onboarding code in the frontend.** A case-insensitive search of `FE/` for onboard, wizard, joyride, shepherd, welcome, getting started, first login and checklist found only two matches, neither an onboarding feature:
  - an i18n dictionary entry in [FE/shared/i18n/az.ts:1155](/home/user/grc_frontend_code/src/shared/i18n/az.ts);
  - the word "checklist" in the incident-stage card text, [FE/app/(app)/integrations-automation/page.tsx:72](/home/user/grc_frontend_code/src/app/(app)/integrations-automation/page.tsx). (verified)
- **No tour or onboarding library.** The FE dependencies are limited to next 16.2.6, react 19.2.4, @radix-ui/react-slot, class-variance-authority, clsx, lucide-react and tailwind-merge. There is no tour, onboarding, form-wizard or analytics library. — [/home/user/grc_frontend_code/package.json](/home/user/grc_frontend_code/package.json) (verified)
- **Routes.** The app's only pages are:
  - account, asset-management, command-center, compliance-hub, control-center, governance;
  - integrations-automation, notifications, operations-center, organization, profile;
  - risk-management, settings, support, third-parties, trust-center;
  - public `/login`; `/` redirects to `/command-center`.

  There is no `/onboarding`, `/setup`, `/welcome`, `/invite` or `/register` page. — `find FE/app -name page.tsx`; [FE/app/page.tsx](/home/user/grc_frontend_code/src/app/page.tsx) (verified)
- **Backend reserved paths with no implementation.**
  - `TenantContextFilter` exempts `/onboarding`, `/register`, `/api/v1/auth/register`, `/api/v1/auth/forgot-password` and `/api/v1/auth/reset-password` from tenant resolution, but no controllers exist for them. — [BE/infrastructure/tenancy/TenantContextFilter.java:85-111](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/infrastructure/tenancy/TenantContextFilter.java) (verified)
  - `AuthController` maps only `/login`, `/me` and `/me/permissions` (plus refresh and logout elsewhere). — [BE/modules/auth/api/AuthController.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/api/AuthController.java) (verified)
- **No first-login branching.** After sign-in, `safeNextPath` sends the user to the `next` parameter or `/command-center`. — [FE/app/(public)/login/page.tsx:37-43, 109-110](/home/user/grc_frontend_code/src/app/(public)/login/page.tsx) (verified)
- **No first-login or onboarding marker on users.** The organisation `User` entity has firstName, lastName, email, status, `ssoEnabled`, `mfaEnabled`, department, userGroup, `apiAccessEnabled` and roles. There is no first-login flag, onboarding status or "must change password" field. — [BE/modules/organization/entity/User.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/organization/entity/User.java) (verified)
- **Last sign-in time is exposed.** `UserAccountResponse` has `lastLoginAt`, which could be used to detect a first login. — [BE/modules/auth/dto/response/UserAccountResponse.java:20](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/dto/response/UserAccountResponse.java) (verified)
- **Empty states are generic.** Most grids show "No records found." Only a few are contextual:
  - "No incidents yet. Use Add Item to record the first one." and "No incident stages yet. Add an incident, or define stages under Settings." — [FE/domain/operations-center/IncidentsPage.tsx:949, 984](/home/user/grc_frontend_code/src/domain/operations-center/IncidentsPage.tsx) (verified)
  - "No departments defined yet." in Add User. — [FE/shared/ui/CreateUserModal.tsx:300](/home/user/grc_frontend_code/src/shared/ui/CreateUserModal.tsx) (verified)
  - Compliance Analysis says "Import one via CSV." although that import cannot create rows. — [GUIDE/appendices/known-issues.md CH-05](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Help and support.**
  - There is no help widget or in-app documentation link; searching `FE/` for HelpCircle, LifeBuoy, /docs and guide found only Trust Center text. (verified)
  - The Support page offers a pre-filled `mailto:contact@strativu.com`. — [FE/shared/config/contact.ts:2-7](/home/user/grc_frontend_code/src/shared/config/contact.ts) (verified)
  - "Send to Support" in System Health sends nothing. — [GUIDE/appendices/known-issues.md ST-11](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Existing "getting started" content is documentation only.**
  - `GUIDE/01-getting-started/03-first-time-setup.md` defines a 13-step dependency-ordered setup: (1) platform settings, (2) departments, (3) groups and permissions, (4) users, (5) coverage and objectives, (6) vendors and agreements, (7) assets and data flows, (8) risk scales and appetite, (9) compliance packages and obligations, (10) policies, controls and continuity plans, (11) risks and exceptions, (12) compliance analysis, (13) projects and incident stages. Each step names the page to use. — [GUIDE/01-getting-started/03-first-time-setup.md](/home/user/grc_frontend_code/doc/guide/01-getting-started/03-first-time-setup.md)
  - The Integrations page has a static "Tenant provisioning" card claiming a new tenant is seeded with roles "on first run". — [FE/app/(app)/integrations-automation/page.tsx:79-84](/home/user/grc_frontend_code/src/app/(app)/integrations-automation/page.tsx) (verified)
- **Sample data.**
  - Demo data exists only through the dev profile (section 1).
  - A guide tooling script, `doc/guide/tools/seed_demo.py`, signs in and posts a linked demo record set through the API: asset → risk → control → policy → compliance item → project. It is idempotent by record name and lives only on the documentation branch. — [GUIDE/tools/seed_demo.py](/home/user/grc_frontend_code/doc/guide/tools/seed_demo.py) (verified)
  - There is no in-app "load sample data" or "sandbox" feature. Settings › Clear Data (`TenantDataResetServiceImpl.reset`, groups PEOPLE, SETTINGS and REGISTERS) can wipe a tenant's data after trial use. — [BE/modules/settings/service/impl/TenantDataResetServiceImpl.java:86-153](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/settings/service/impl/TenantDataResetServiceImpl.java) (verified)

### Inferences
- The 13-step order in `03-first-time-setup.md` is a ready-made, code-verified blueprint for a setup checklist or wizard. Each step maps to an existing page route and permission key.
- `seed_demo.py` plus Clear Data gives the raw parts of a "try with sample data, then reset" experience. Both would have to be productised: run server-side, scoped to a tenant, and triggered from the UI.

### Gaps
- No analytics or telemetry exists in the FE, so there is no evidence of where real users get stuck. Usage data would have to be collected anew.

## 3. Data import (CSV) and bulk loading

### Takeaway
Import is fragmented and mostly unusable for onboarding:
- **The UI works for 11 imports.** These are Users, Projects, Project Tasks, Project Expenses, Security Incidents, incident stage definitions, Compliance Package Items, Compliance Analysis strategies, Obligations, Compliance Exceptions and External Audit Findings.
- **The core registers' buttons fail.** On Assets, Vendors, Departments, Controls, Policies and Risks, the button opens a demo dialog that always fails.
- **Some backend imports are not wired.** Imports exist for controls, policies, policy exceptions, continuity plans, the three risk registers and auth connectors, but the UI does not use them.
- **The format is weak.** There are no downloadable templates, no column mapping, no upsert, and almost no support for relationships: links require internal UUIDs or are stored as plain text.

### Cited Findings
- **The demo dialog.** The shared grid shows the toast "CSV Import (<title>): the import structure is not ready yet." on every Import click. When the page supplies no `onImportCsv`, it opens `CsvImportModal` with `endpoint="/api/v1/import-csv-demo"`. — [FE/shared/ui/DataTable.tsx:363-376, 829-835](/home/user/grc_frontend_code/src/shared/ui/DataTable.tsx) (verified)
- **Why the demo dialog always fails.** `resolveUrl()` prefixes `API_BASE` (default `/api/v1`), so the request goes to `/api/v1/api/v1/import-csv-demo`. No such endpoint exists. — [FE/shared/api/apiClient.ts:345-347](/home/user/grc_frontend_code/src/shared/api/apiClient.ts) (verified); [GUIDE/appendices/known-issues.md PW-01, PW-02](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Where real import endpoints are wired.**
  - Operations: projects, tasks, expenses, security incidents and incident stages. — [FE/shared/api/operations.ts:274-311](/home/user/grc_frontend_code/src/shared/api/operations.ts)
  - Compliance Hub: findings, obligations, assessments and exceptions. — [FE/domain/compliance-hub/AuditFindingsPage.tsx:762](/home/user/grc_frontend_code/src/domain/compliance-hub/AuditFindingsPage.tsx), [FE/domain/compliance-hub/ObligationsPage.tsx:567](/home/user/grc_frontend_code/src/domain/compliance-hub/ObligationsPage.tsx), [FE/domain/compliance-hub/AssessmentsPage.tsx:965](/home/user/grc_frontend_code/src/domain/compliance-hub/AssessmentsPage.tsx), [FE/domain/compliance-hub/ComplianceExceptionsPage.tsx:551](/home/user/grc_frontend_code/src/domain/compliance-hub/ComplianceExceptionsPage.tsx)
  - Users. — [FE/domain/organization/UsersPage.tsx:483](/home/user/grc_frontend_code/src/domain/organization/UsersPage.tsx) (verified)
- **Backend import and export endpoints (complete grep).**
  - Compliance: `/assessments/import-csv`, `/exceptions/import-csv` and `/export-csv`, `/packages/{id}/import` and `/export`, `/audit-findings/import-csv` and `/export-csv`, `/obligations/import-csv` and `/export-csv`.
  - Control: `/import-csv` for internal-controls, policies-standards, exceptions and continuity-plans.
  - Operations: projects, tasks, expenses, security-incidents and security-incident-stages, each with import and export.
  - Organisation: `/organization/users/import-csv` (import only).
  - Risk: asset-risks, third-party-risks and operational-risks, each with import and export.
  - Settings: ldap-, oauth- and saml-connectors, each with import and export; system-log export.
  - **No import exists** for assets, data assets and flows, vendors, service agreements, departments, groups, coverage, objectives, issues or risk exceptions. — grep `@PostMapping/@GetMapping` with import/export over [BE/modules](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules) (verified)
- **Dry run.** A `dryRun` request parameter exists on the compliance (packages, exceptions, findings) and risk imports. — e.g. [BE/modules/compliance/api/CompliancePackageController.java:123-124](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/compliance/api/CompliancePackageController.java), [BE/modules/risk/api/AssetRiskController.java:100-101](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/risk/api/AssetRiskController.java) (verified)
- **Control Center imports have no dry run.** `ControlCsvImportServiceImpl` uses Apache commons-csv with a header map.
  - Required headers: `name` for controls, policies and exceptions; `name`, `plantype` and `effectivedate` for continuity plans.
  - Relations are given as UUIDs, for example `controloperatorcontactuserid` and `securitypolicyids`.
  - It returns a `Map<String,Object>`. — [BE/modules/control/service/impl/ControlCsvImportServiceImpl.java:32-94, 210-306](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/control/service/impl/ControlCsvImportServiceImpl.java); [/home/user/grc_backend_code/pom.xml:124](/home/user/grc_backend_code/pom.xml) (verified)
- **The dialog's result contract does not match every backend.** `CsvImportModal` expects `{dryRun, totalRows, successRows, failedRows, errors[]}`. The risk import returns `successCount`/`errorCount`, so wiring it as-is would show blank counts. — [FE/shared/ui/CsvImportModal.tsx:8-25](/home/user/grc_frontend_code/src/shared/ui/CsvImportModal.tsx) (verified); [GUIDE/appendices/known-issues.md RM-23](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Users import.**
  - Mechanics: the server splits each line with `line.split(",", -1)`, so there is no quote handling. — [BE/modules/organization/service/impl/UserServiceImpl.java:388-401, 493](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/organization/service/impl/UserServiceImpl.java) (verified)
  - Feedback: the FE uploads the file directly, with no dialog, dry run or preview, and always toasts "Users imported." on HTTP success, even if rows failed. — [FE/domain/organization/UsersPage.tsx:480-488](/home/user/grc_frontend_code/src/domain/organization/UsersPage.tsx) (verified)
  - Columns: firstname, lastname, email, password, department and role (one group, matched by exact name).
  - A blank password becomes an unknown random password, so the admin must then set one. — [GUIDE/appendices/csv-import-export.md "Users"](/home/user/grc_frontend_code/doc/guide/appendices/csv-import-export.md); [GUIDE/appendices/known-issues.md OH-04](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Compliance package (framework) item import format.** The file is read by column position, with the first line skipped. The columns are:
  1. chapterId
  2. chapterName
  3. chapterDescription
  4. itemNumber (required, unique in the package)
  5. itemName (required)
  6. itemDescription
  7. itemAdditionalInfo
  8. category

  Quoted values are supported, a dry run is available, and every item gets a Compliance Analysis row. The package itself must be created by hand first; the package list's own Import is the demo dialog. — [GUIDE/appendices/csv-import-export.md "Compliance Package Items"](/home/user/grc_frontend_code/doc/guide/appendices/csv-import-export.md)
- **Compliance Analysis strategy import is impractical.** It needs internal assessment-row UUIDs that no screen shows. — [GUIDE/appendices/known-issues.md CH-06](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Operations imports.** They match by header name with no quote handling. Task and expense imports need `project_id` UUIDs, while the exports give project names, so an export cannot be re-imported. — [GUIDE/appendices/known-issues.md OC-02](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Export.** Export CSV is present only on Projects, Tasks, Expenses, Incidents, incident stage definitions, Package Items, Obligations, Compliance Exceptions, Findings and the System Log. Exports ignore the grid's filters. — [GUIDE/appendices/csv-import-export.md "Summary"](/home/user/grc_frontend_code/doc/guide/appendices/csv-import-export.md)
- **What the guide recommends for onboarding.** It tells customers to use the forms, or to "ask your Strativu contact about a bulk load through the API", for every other register. — [GUIDE/01-getting-started/03-first-time-setup.md "Bringing in existing data"](/home/user/grc_frontend_code/doc/guide/01-getting-started/03-first-time-setup.md)

### Inferences
- Migrating a customer's existing risk register, asset inventory, vendor list or control library through the UI is not possible today. The highest-value import targets for onboarding have no working path: departments, users with groups, assets, vendors, risks, controls, policies, and framework packages with items.
- A unified import framework is needed: per-register template download, header mapping, name-based relation resolution (department, owner and asset by name or email instead of UUIDs), dry-run preview, upsert by natural key, and per-row error report. Commons-csv is already on the classpath, and the dry-run pattern already exists in the compliance and risk services to build on.
- Fixing the demo-dialog endpoint (`DataTable.tsx:832`) and wiring the 10 existing unwired backend imports would be quick wins. The result DTOs would need to be aligned to `CsvImportResult` first.

### Gaps
- No Excel (.xlsx) import exists (no POI in `pom.xml`). Whether customers' source data is typically Excel was not established from the code.
- The quality of the unwired risk and control imports (field coverage, relation handling) was only partly read.

## 4. Integrations: connectors, SSO, SCIM, API, webhooks, email and scheduling

### Takeaway
The integration surface is small:
- **Working:** LDAP/AD password verification, but only for accounts that already exist in GRC360; outbound HMAC-signed webhooks (admin-only, few events); and an SMTP relay used only for invitations and a test email.
- **Stored but not functional:** OAuth and SAML connectors. No sign-in flow uses them.
- **Absent:** SCIM, HRIS, cloud or Jira connectors, and customer API tokens. REST access is JWT-only from interactive sign-in.
- **Scheduling:** Spring scheduling is off, so 7 `@Scheduled` jobs are dormant. Only a custom-built daily notification sweep runs.

### Cited Findings
- **Integrations page.** It shows connector cards for LDAP, OAuth and SAML; static cards for CSV import ("20 registers") and REST API ("OpenAPI"); six "built-in automation" cards; an SMTP card; a webhooks section; and a "Planned" list containing only "Scheduled e-mail digests" and "Jira". — [FE/app/(app)/integrations-automation/page.tsx:55-97](/home/user/grc_frontend_code/src/app/(app)/integrations-automation/page.tsx) (verified); [GUIDE/02-modules/integrations-automation.md](/home/user/grc_frontend_code/doc/guide/02-modules/integrations-automation.md)
- **Some card claims overstate the product.** The cards claim WebSocket live refresh (actually a 10–12 s poll), "system events" notifications and a 20-register CSV dry run. — [GUIDE/appendices/known-issues.md TI-06, PD-18](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Security chain is JWT-only.** It adds only `tenantContextFilter` and `jwtAuthenticationFilter`; there is no `oauth2Login`, `saml2Login`, HTTP Basic or API-key filter. — [BE/config/SecurityConfig.java:106, 189-190](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/config/SecurityConfig.java) (verified)
- **OAuth success endpoint is a stub.** It returns `"mock-jwt-token-for-e2e-testing"` when there is no OAuth2 user, and falls back to `test@example.com` when the email attribute is missing. — [BE/modules/auth/api/OAuthController.java:28-40](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/api/OAuthController.java) (verified)
- **LDAP/AD.** Sign-in checks the local password first and then the directory. The person must already have an Active GRC360 account with the same email; there is no just-in-time provisioning and no group sync. — [BE/modules/auth/service/impl/AuthServiceImpl.java:57, 124-125](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/service/impl/AuthServiceImpl.java); [BE/modules/settings/service/impl/DirectoryAuthenticatorImpl.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/settings/service/impl/DirectoryAuthenticatorImpl.java); [GUIDE/04-administration/02-authentication-and-sso.md](/home/user/grc_frontend_code/doc/guide/04-administration/02-authentication-and-sso.md)
- **LDAP configuration and testing.** The UI has connector fields, a Test-connection button and mail-domain routing for multiple directories. — [GUIDE/04-administration/02-authentication-and-sso.md "Step by step"](/home/user/grc_frontend_code/doc/guide/04-administration/02-authentication-and-sso.md)
- **Local test directory.** `docker/local-ldap` is provided for testing. — [/home/user/grc_backend_code/docker](/home/user/grc_backend_code/docker) (verified, directory listing)
- **SAML/OAuth connector problems.** SAML certificate fields are not saved, and OAuth and SAML connectors cannot be edited or deleted on screen. — [GUIDE/appendices/known-issues.md ST-03, ST-04, ST-05](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **No SCIM, API keys, feature flags or licence code.** A search of `BE/` for scim, personal access token, api key, feature flag, licence key and activation found nothing. — grep (verified)
- **Per-user REST API switch is not enforced.** `User.apiAccessEnabled` exists, but nothing reads it. — [BE/modules/organization/entity/User.java:39-40](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/organization/entity/User.java) (verified); [GUIDE/appendices/known-issues.md OH-05](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **OpenAPI.** `/v3/api-docs` and Swagger UI are available in non-prod profiles and disabled in `prod`. — [GUIDE/05-technical/02-installation-and-deployment.md "Spring profiles"](/home/user/grc_frontend_code/doc/guide/05-technical/02-installation-and-deployment.md)
- **Webhooks: API.** The endpoints live at `/api/v1/settings/integrations/webhooks` and require `settings.auth.view`/`settings.auth.edit` or the ADMIN role. Dispatch goes through `WebhookServiceImpl.dispatch(tenantId, event, message)`. — [BE/modules/settings/api/WebhookController.java:32-58](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/settings/api/WebhookController.java); [BE/modules/settings/service/impl/WebhookServiceImpl.java:99](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/settings/service/impl/WebhookServiceImpl.java) (verified)
- **Webhooks: behaviour.**
  - Deliveries carry an HMAC-SHA256 `X-GRC360-Signature` header, use generic JSON or Slack/Teams format, and time out after 5 s.
  - There is no retry, no edit form and no delivery history.
  - Events come only from System Log actions (Settings and Compliance Hub) and audit-trail events (risk, objective audit, legacy incident). — [GUIDE/02-modules/integrations-automation.md](/home/user/grc_frontend_code/doc/guide/02-modules/integrations-automation.md); [GUIDE/appendices/known-issues.md TI-04, TI-05](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **SMTP.**
  - Configured only through server environment variables (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`, `MAIL_FROM_NAME`, `MAIL_STARTTLS`, `MAIL_SSL`); there is no per-tenant SMTP UI.
  - Only invitations and a test message are emailed. — [GUIDE/04-administration/03-email-webhooks-and-notifications.md](/home/user/grc_frontend_code/doc/guide/04-administration/03-email-webhooks-and-notifications.md); [FE/app/(app)/integrations-automation/page.tsx:213-214](/home/user/grc_frontend_code/src/app/(app)/integrations-automation/page.tsx) (verified)
- **Scheduling is not enabled.** `Grc360Application` has only `@SpringBootApplication`; there is no `@EnableScheduling` anywhere. — [BE/Grc360Application.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/Grc360Application.java) (verified)
- **Seven dormant `@Scheduled` methods.** (verified)
  - `ObjectiveAlertScheduler:29` (daily 09:00) — [BE/modules/governance/scheduler/ObjectiveAlertScheduler.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/governance/scheduler/ObjectiveAlertScheduler.java)
  - `RiskExceptionScheduler:20` (hourly)
  - `ComplianceExceptionHubServiceImpl:231` (hourly)
  - `DashboardCacheScheduler:27` (hourly)
  - `DataArchivingService:51` (daily)
  - `ExceptionExpirationJob:26` (daily)
  - `ServiceAgreementScheduler:23` (daily 01:00)
- **The one running scheduled job.** `NotificationSweepScheduler` builds its own `ThreadPoolTaskScheduler`. Its Javadoc explains this was done deliberately, so as not to switch on `@EnableScheduling` and wake the unvetted jobs. — [BE/modules/notification/service/NotificationSweepScheduler.java:12-34, 110-134](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/notification/service/NotificationSweepScheduler.java) (verified)
- **Async execution is enabled.** `@EnableAsync` is set in [BE/async/AsyncConfiguration.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/async/AsyncConfiguration.java). (verified)
- **Other external connectors.** There are no connectors for HRIS, cloud providers (AWS, Azure, GCP), Jira, ticketing or databases. The backend module list is activity, asset, audit, auth, commandcenter, comments, compliance, control, evidence, governance, incident, issue, notification, operations, organization, policy, realtime, risk, search, settings, sync, task, thirdparty and visibility. — `ls BE/modules` (verified)

### Inferences
- For "connect customer systems" during onboarding, the only realistic step today is LDAP password verification, and even that requires users to be pre-created through the form or CSV. Real SSO (OIDC/SAML login), JIT or SCIM user provisioning, and directory group-to-role mapping are all missing, and these are typical enterprise onboarding expectations.
- A generic "connect your systems" step in a wizard could truthfully offer only three things: LDAP, an SMTP check, and webhooks. Anything else would have to be marked "planned", as the Integrations page already does.
- Reminder emails and scheduled digests depend on enabling scheduling safely. A future onboarding feature such as "nudge admins with incomplete setup" would need the same custom-scheduler approach as `NotificationSweepScheduler`, or a vetted enabling of `@EnableScheduling`.

### Gaps
- Whether the production deployment sets `MAIL_*` (that is, whether invitations actually send in production) is not visible in the repos.

## 5. User invitation and first login of invited users

### Takeaway
An invitation backend exists, but the flow is broken end to end:
- There is no UI to send an invitation.
- The invite carries only an email address: no name, group or department.
- The emailed link `/invite/{token}` has no page.
- No endpoint accepts a token. `validateInviteToken` exists but is called by nothing.

Beyond invitations, there is no forgot-password, self-registration, self-service password change, enforced MFA, profile completion or policy acknowledgement. Admins create users with a password through the form or CSV and pass it on out of band.

### Cited Findings
- **Creating an invitation.** `POST /api/v1/users/invite` calls `authService.inviteUser`. `UserInviteRequest` has only `email` (`@NotBlank @Email`). — [BE/modules/auth/api/UserAccountController.java:86-95](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/api/UserAccountController.java); [BE/modules/auth/dto/request/UserInviteRequest.java:8-10](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/dto/request/UserInviteRequest.java) (verified)
- **What `inviteUser` does.**
  - Saves a `UserInvite` (email, token, `expiresAt`, `used=false`, `invitedBy`).
  - Builds `frontendBaseUrl() + "/invite/" + token`.
  - Emails "You have been invited to GRC360" asynchronously as best effort.
  - Returns the link to the caller. — [BE/modules/auth/service/impl/AuthServiceImpl.java:542-590](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/service/impl/AuthServiceImpl.java); [BE/modules/auth/entity/UserInvite.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/entity/UserInvite.java) (verified)
- **The 7-day validity.** The guide states it; the code was not read at that line. — [GUIDE/04-administration/01-users-groups-and-permissions.md "Invitations"](/home/user/grc_frontend_code/doc/guide/04-administration/01-users-groups-and-permissions.md)
- **Validating the token.** `validateInviteToken(token)` checks `findByTokenAndUsedFalse` and expiry, but no controller calls it, and nothing ever sets `used=true`. — [BE/modules/auth/service/impl/AuthServiceImpl.java:622-635](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/service/impl/AuthServiceImpl.java); grep for `validateInviteToken` (verified)
- **No invite page in the FE.** There is no `/invite` route and the FE never calls `/users/invite`. — `find FE/app` and grep (verified); [GUIDE/appendices/known-issues.md PD-06](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Creating a user through Organization Hub › Users** creates the login `UserAccount` with a BCrypt hash of the password the admin typed. — [BE/modules/organization/service/impl/UserServiceImpl.java:462](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/organization/service/impl/UserServiceImpl.java) (verified)
- **Two user models.** The organisation `users` table and the auth `user_accounts` table are linked by email. — [BE/modules/organization/service/impl/UserServiceImpl.java:285, 351, 368](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/organization/service/impl/UserServiceImpl.java) (verified)
- **No password change or reset.**
  - There is no self-service password-change endpoint: grep for `changePassword`, `/password` and `me/password` in `BE/` returned nothing. (verified)
  - The profile page is read-only. — [GUIDE/01-getting-started/02-your-profile.md "Profile"](/home/user/grc_frontend_code/doc/guide/01-getting-started/02-your-profile.md); [FE/domain/account/ProfilePage.tsx](/home/user/grc_frontend_code/src/domain/account/ProfilePage.tsx)
  - The login page has no "Forgot password" link and no self-registration. — [GUIDE/01-getting-started/01-signing-in.md](/home/user/grc_frontend_code/doc/guide/01-getting-started/01-signing-in.md); [GUIDE/appendices/known-issues.md PD-05](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **MFA is broken.**
  - `/mfa/setup` takes the email as a request parameter.
  - `/mfa/enable` uses the submitted TOTP code as the secret (`String secret = request.getTotpCode()`).
  - `/mfa/verify` returns `isMfaEnabled()` and ignores the code.
  - The FE never calls `/mfa`, and sign-in does not ask for a second factor. — [BE/modules/settings/api/MfaController.java:30-66](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/settings/api/MfaController.java) (verified); [GUIDE/appendices/known-issues.md PD-04](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **No policy acknowledgement or attestation.** A search of `BE/` and `FE/` for acknowledg and attest found only fields in notification entities. — grep (verified)
- **A portal was anticipated but not built.** The OAuth connector dialog lists redirect `{site}/portal/policy/login`, which suggests a planned policy portal; no such page exists. — [GUIDE/04-administration/02-authentication-and-sso.md "OAuth connectors"](/home/user/grc_frontend_code/doc/guide/04-administration/02-authentication-and-sso.md)
- **Invited users see the same landing as everyone else.**
  - Every user lands on Command Center; a user without dashboard access gets Access Denied. — [GUIDE/appendices/known-issues.md PW-11](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
  - The FE treats any role containing "ADMIN" as admin for UI unlocking, for example a group named "IT Admins". — [FE/shared/auth/AuthContext.tsx:243-245](/home/user/grc_frontend_code/src/shared/auth/AuthContext.tsx) (verified)
- **Assignment notifications are missing.** Being named owner or assignee on registers sends no notification, except on Continuity Plan task Awareness Role. — [GUIDE/appendices/notifications-and-jobs.md](/home/user/grc_frontend_code/doc/guide/appendices/notifications-and-jobs.md)

### Inferences
- An onboarding flow for invited users needs four new parts: an accept-invite page and endpoint (set password, mark the invite used, create or activate the account with a pre-assigned group and department); a forgot/reset-password flow; a working MFA enrolment; and a first-login "welcome / your role / your tasks" step.
- The invitation entity would need to carry `fullName`, `groupIds`, `departmentId` and probably `tenantId`-scoped acceptance, so that admins can pre-assign access during setup. Today it carries only email.

### Gaps
- Not verified whether `UserInvite` rows are tenant-scoped in the unique-token lookup; the token is globally unique by constraint.

## 6. Existing preference and state storage usable for onboarding progress

### Takeaway
There is no per-user or per-tenant settings store that could hold onboarding progress. Per-browser `localStorage` holds only theme, locale, session flags, cached user and tenant id. A `NotificationPreference` entity exists but is unused. Tenant-level settings tables exist only for specific features.

### Cited Findings
- **`localStorage` keys in use.** `grc-locale`, the theme key, `grc_user`, `tenant_id`, `grc_session_persistent`, the last-activity timestamp and the session-channel lock. — [FE/shared/i18n/LocaleContext.tsx:19, 53](/home/user/grc_frontend_code/src/shared/i18n/LocaleContext.tsx), [FE/shared/theme/ThemeContext.tsx:38, 77](/home/user/grc_frontend_code/src/shared/theme/ThemeContext.tsx), [FE/shared/auth/AuthContext.tsx:139, 233](/home/user/grc_frontend_code/src/shared/auth/AuthContext.tsx), [FE/shared/api/apiClient.ts:111, 123](/home/user/grc_frontend_code/src/shared/api/apiClient.ts), [FE/shared/auth/useIdleTimer.ts](/home/user/grc_frontend_code/src/shared/auth/useIdleTimer.ts), [FE/shared/api/sessionChannel.ts](/home/user/grc_frontend_code/src/shared/api/sessionChannel.ts) (verified)
- **Grid layout is not persisted.** Column visibility, sidebar collapse and group expansion reset on reload. — [GUIDE/appendices/known-issues.md PW-19](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Settings entities are feature-specific.** `BE/modules/settings/entity/` contains AuthSettings, LdapConnector, OauthConnector, SamlConnector, SsoProviderConfig, SystemInfo, SystemLog, SystemUpdate, TenantDataBackup, TrustCenterSettings and WebhookEndpoint. There is no generic TenantSettings or UserSettings and no onboarding-state entity. — [BE/modules/settings/entity](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/settings/entity) (verified)
- **Unused notification preferences.** `NotificationPreference` (per tenant and user: channel, enabled, quiet hours, timezone, category filters and more) is referenced only by its own repository. — [BE/modules/notification/entity/NotificationPreference.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/notification/entity/NotificationPreference.java) (verified)
- **Tenant domain model.** It has branding (`TenantBranding`), plan, status and limits. A branding update endpoint exists (`PUT /tenants/{id}/branding`), but the FE does not use it. — [BE/domain/tenant/](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/domain/tenant); [BE/presentation/web/tenant/TenantController.java:116-124](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/presentation/web/tenant/TenantController.java) (verified)
- **Usable signals for completion.** `lastLoginAt` on the user account response, and record counts per register (the Command Center and grids already query these). — [BE/modules/auth/dto/response/UserAccountResponse.java:20](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/dto/response/UserAccountResponse.java) (verified)

### Inferences
- Onboarding progress needs a new server-side store. Two options:
  - A `tenant_onboarding` table (per tenant: step states, completedAt, dismissed) plus `user_onboarding` (per user: tour seen, welcome dismissed).
  - A generic JSON `tenant_settings`/`user_preferences` table.

  Many checklist items could instead be derived live: departments > 0, users > 1, groups beyond the built-ins, SMTP configured, LDAP enabled, packages > 0, risk settings reviewed. That reduces the stored state to "dismissed/acknowledged" flags.
- `localStorage` alone is unsuitable for onboarding state. It is per browser, and the team's preference for durable state points to server storage.

### Gaps
- None material.

## 7. i18n (UI languages)

### Takeaway
The UI supports two languages: English (source) and Azerbaijani. Azerbaijani is applied by a DOM-rewriting dictionary, not by keyed `t()` calls. Server texts stay English. Any new onboarding copy would need AZ dictionary entries, and server-generated text (emails, notifications) would not be translated.

### Cited Findings
- **Locales.** The `Locale` type is `"en" | "az"`. The toggle offers EN and AZ ("Azərbaycan dili"), and the choice is stored in `localStorage` under `grc-locale`. — [FE/shared/i18n/LocaleContext.tsx:8, 19](/home/user/grc_frontend_code/src/shared/i18n/LocaleContext.tsx); [FE/shared/i18n/LanguageToggle.tsx:8](/home/user/grc_frontend_code/src/shared/i18n/LanguageToggle.tsx); [FE/shared/i18n/constants.ts](/home/user/grc_frontend_code/src/shared/i18n/constants.ts) (verified)
- **Mechanism.** A MutationObserver rewrites visible text and the placeholder, title and aria-label attributes through a dictionary keyed by the English text. The dictionary `az.ts` is 3,225 lines. — [FE/shared/i18n/translator.ts:1-20](/home/user/grc_frontend_code/src/shared/i18n/translator.ts); [FE/shared/i18n/az.ts](/home/user/grc_frontend_code/src/shared/i18n/az.ts) (verified)
- **Coverage is partial.** In AZ mode, server texts (notifications, errors, Activity Log values) stay English, dates follow the browser locale, and the import toast is not translated. — [GUIDE/appendices/known-issues.md PW-28](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Language is not saved per user.** Locale is per browser only; there is no server-side user language. — inferred from the `localStorage`-only storage (verified)
- **Language switch before sign-in.** The EN/AZ switch is available on the login page. — [GUIDE/01-getting-started/01-signing-in.md](/home/user/grc_frontend_code/doc/guide/01-getting-started/01-signing-in.md)
- **The invitation email is English-only, inline HTML.** — [BE/modules/auth/service/impl/AuthServiceImpl.java:593+](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/service/impl/AuthServiceImpl.java) (verified)

### Inferences
- Onboarding UI copy written in English will be auto-translated only if matching AZ entries are added to `az.ts`.
- Invitation, welcome and reminder emails need a server-side locale. The user's language would have to be stored, for example on the user or in the invitation.

### Gaps
- Commit messages are in Azerbaijani, which suggests an Azerbaijani market; Russian or Turkish UI demand could not be determined.

## 8. Deployment model, installation, configuration and licensing

### Takeaway
GRC360 is built as a multi-tenant SaaS: one shared database and schema, tenants resolved from JWT, subdomain or header, and production CORS and base URL set to `grc360.strativu.com`. A single-tenant mode exists for dedicated or on-prem installs.

Installation is manual and incomplete:
- There are separate FE and BE Dockerfiles, but `docker-compose.yml` has no frontend service and references config files that are missing.
- Flyway is disabled and the schema comes from `ddl-auto=update`.
- The first admin can only be bootstrapped through the dev profile or SQL.
- There is no licensing or activation mechanism beyond the unenforced tenant plan limits.

### Cited Findings
- **Production targets SaaS.** The `prod` profile defaults `APP_PUBLIC_BASE_URL` to `https://grc360.strativu.com`, and the prod CORS list allows `https://*.strativu.com`. — [GUIDE/05-technical/02-installation-and-deployment.md "Backend environment variables"](/home/user/grc_frontend_code/doc/guide/05-technical/02-installation-and-deployment.md)
- **Tenant resolution.** Resolvers run in this order: SingleTenant (only when `app.tenancy.mode=single-tenant`), JWT claim, CustomDomain, Subdomain (`<sub>.strativu.com`), then the `X-Tenant-Id` header. — [GUIDE/05-technical/01-architecture.md "Multi-tenancy"](/home/user/grc_frontend_code/doc/guide/05-technical/01-architecture.md)
- **Sign-in needs a tenant id in the browser.** Login requires the `X-Tenant-Id` header. The FE takes it from `localStorage` `tenant_id` or from the build-time `NEXT_PUBLIC_TENANT_ID`. — [FE/shared/api/apiClient.ts:111](/home/user/grc_frontend_code/src/shared/api/apiClient.ts) (verified); [GUIDE/05-technical/02-installation-and-deployment.md "Frontend environment variables"](/home/user/grc_frontend_code/doc/guide/05-technical/02-installation-and-deployment.md)
- **Consequence for multi-tenant sign-in.** There is no tenant picker or organisation-slug sign-in. A multi-tenant deployment cannot let users of a second tenant sign in from a fresh browser without a per-tenant FE build or a subdomain. Subdomain resolution is also defeated behind the BFF, because the proxy strips `Host`. — [GUIDE/05-technical/01-architecture.md](/home/user/grc_frontend_code/doc/guide/05-technical/01-architecture.md); [GUIDE/appendices/known-issues.md PD-13](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Backend image.** Multi-stage `eclipse-temurin:21` build, healthcheck on `/actuator/health`. — [/home/user/grc_backend_code/Dockerfile](/home/user/grc_backend_code/Dockerfile) (verified)
- **Frontend image.** Multi-stage `node:20-alpine` build, `npm start` on port 3000. — [/home/user/grc_frontend_code/Dockerfile](/home/user/grc_frontend_code/Dockerfile) (verified)
- **Compose stack.** Services are nginx, app (`SPRING_PROFILES_ACTIVE=docker`), postgres:16, redis, minio, prometheus and grafana. There is no frontend service. — [/home/user/grc_backend_code/docker-compose.yml](/home/user/grc_backend_code/docker-compose.yml) (verified)
- **Compose stack problems.** The nginx, SSL, Prometheus and Grafana config files are missing; the default secrets are accepted (`JWT`, DB password `123456`); and the health check reports DOWN without LDAP or SMTP. — [GUIDE/appendices/known-issues.md PD-03, PD-09, PD-11](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Schema management.** Flyway is disabled in every profile, migration versions are duplicated (two V2 and two V3 files), and the schema is created by `ddl-auto=update` plus `SchemaRepairRunner`. — [BE-res/db/migration](/home/user/grc_backend_code/src/main/resources/db/migration) (verified, listing); [GUIDE/appendices/known-issues.md PD-10](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)
- **Configuration.** Done entirely through environment variables:
  - DB, `JWT_SECRET`, `SESSION_*`, `RATE_LIMIT_*` and MinIO or local storage;
  - `MAIL_*`;
  - `SUPER_ADMIN_EMAILS` (break-glass admins);
  - `APP_PUBLIC_BASE_URL`, `CORS_ALLOWED_ORIGINS` and `JASYPT_ENCRYPTOR_PASSWORD`.

  There is no in-app configuration UI for these. — [GUIDE/05-technical/02-installation-and-deployment.md](/home/user/grc_frontend_code/doc/guide/05-technical/02-installation-and-deployment.md)
- **On-prem and air-gapped.** The guide's section on this lists PostgreSQL and MinIO (or local storage) as required, and SMTP as optional. — [GUIDE/05-technical/02-installation-and-deployment.md "On-premise and air-gapped installation"](/home/user/grc_frontend_code/doc/guide/05-technical/02-installation-and-deployment.md)
- **Licensing.**
  - Both repos carry proprietary LICENSE files: "Copyright (c) 2026 Strativuco / CaspianLexGRC" (BE) and "Strativu" (FE).
  - There is no licence-key, activation or seat-check code; a grep of `BE/` for licence terms found only `DummyDataSeeder` and `OpenApiConfig` metadata.
  - Plan limits (`TenantPlan.maxUsers`) are defined but `validateTenantLimits` is never called. — [/home/user/grc_backend_code/LICENSE](/home/user/grc_backend_code/LICENSE); [/home/user/grc_frontend_code/LICENSE](/home/user/grc_frontend_code/LICENSE); [BE/application/tenant/TenantApplicationService.java:200-213](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/application/tenant/TenantApplicationService.java) (verified)
- **Branding assets.** `branding/` contains the GRC360 logo and mark. `TenantBranding` supports per-tenant branding in the domain model, but no FE uses it. — [/home/user/grc_backend_code/branding](/home/user/grc_backend_code/branding) (verified)
- **No CI checks.** The CI pipeline runs no tests, lint or type check. — [GUIDE/appendices/known-issues.md PD-22](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)

### Inferences
- "Onboarding a new customer" today has two halves, neither productised:
  - **Ops onboarding:** create the tenant, first admin and base URL, give the tenant id to the FE, and set SMTP.
  - **In-app onboarding:** the 13 setup steps.

  A platform-operator "provision tenant" action, which creates the tenant plus the first admin invitation plus seeding, is a prerequisite for any self-serve or semi-assisted onboarding.
- For a multi-tenant SaaS, tenant discovery at sign-in is a blocker for onboarding a second customer on the same FE: an organisation slug or subdomain, or tenant lookup by email domain.

### Gaps
- The actual production topology (one shared instance or one instance per customer) and the existing deployment scripts are not in the repos; the guide says they live only on the servers (PD-22).

## 9. Gap list: what a guided onboarding flow needs, and where it would plug in

### Takeaway
GRC360 has a sound domain model and a code-verified setup order, but none of the scaffolding for guided onboarding exists. The prerequisites, in order:
1. A tenant plus first-admin provisioning path.
2. A working invite and password lifecycle.
3. A server-side onboarding state store.
4. A setup-checklist UI driven by live counts.
5. Working, templated imports for the core registers.
6. Starter content: framework packages, incident stages, sensible risk appetite.
7. Honest "connect your systems" steps: LDAP, SMTP and webhooks now; SSO and SCIM later.

### Cited Findings
Each gap below names its evidence and the plug-in point(s). Where evidence was given in sections 1–8, the section is referenced instead of repeating the link.

1. **Tenant provisioning with first admin and seeding (missing).**
   - Evidence: section 1.
   - Plug in at:
     - `TenantApplicationService.createTenant` — [BE/application/tenant/TenantApplicationService.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/application/tenant/TenantApplicationService.java)
     - `DefaultRoleSeedService.seedDefaultRolesAndPermissions` — [BE/modules/organization/seed/DefaultRoleSeedService.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/organization/seed/DefaultRoleSeedService.java)
     - `RiskSettingsServiceImpl.ensureDefaults` and the other lazy defaults.
   - Restrict `/api/v1/tenants` to a platform-operator role, per PD-01. — [BE/config/SecurityConfig.java:169-172](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/config/SecurityConfig.java)
2. **Invite acceptance and set-password page (missing).**
   - Add a public FE route `app/(public)/invite/[token]/page.tsx`.
   - Add BE endpoints for GET validate (reuse `validateInviteToken`) and POST accept.
   - Extend `UserInviteRequest` and `UserInvite` with name, group(s) and department.
   - Add an "Invite user" action in Organization Hub › Users. — [BE/modules/auth/service/impl/AuthServiceImpl.java:542-635](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/auth/service/impl/AuthServiceImpl.java); [FE/domain/organization/UsersPage.tsx](/home/user/grc_frontend_code/src/domain/organization/UsersPage.tsx)
3. **Forgot/reset password and self-service password change (missing).**
   - Implement the paths already exempted in `TenantContextFilter`: `/api/v1/auth/forgot-password` and `/reset-password`. — [BE/infrastructure/tenancy/TenantContextFilter.java:96-98](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/infrastructure/tenancy/TenantContextFilter.java)
   - Add a password section to the Account page. — [FE/domain/account/AccountPage.tsx](/home/user/grc_frontend_code/src/domain/account/AccountPage.tsx)
4. **MFA enrolment and enforcement (broken).**
   - Fix `MfaController` and add an enrolment step to first login. — [BE/modules/settings/api/MfaController.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/settings/api/MfaController.java)
5. **Onboarding state store (missing).**
   - Add new BE entities (tenant-level checklist state, user-level tour/welcome flags), or a generic tenant/user settings table.
   - There is no existing table to reuse (section 6). — [BE/modules/settings/entity](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/settings/entity)
6. **Setup checklist and wizard UI (missing).**
   - Content source: the 13 steps of `GUIDE/01-getting-started/03-first-time-setup.md`.
   - Entry point: a first-login redirect in `safeNextPath` and `app/page.tsx` (currently `/command-center`), or a checklist panel on the Command Center. — [FE/app/(public)/login/page.tsx:37-43](/home/user/grc_frontend_code/src/app/(public)/login/page.tsx); [FE/app/page.tsx](/home/user/grc_frontend_code/src/app/page.tsx); [FE/domain/command-center/pages/CommandCenterPage.tsx](/home/user/grc_frontend_code/src/domain/command-center/pages/CommandCenterPage.tsx)
   - Navigation config for deep links into each step's page. — [FE/shared/config/navigation.ts](/home/user/grc_frontend_code/src/shared/config/navigation.ts)
7. **Product tour and contextual help (missing).**
   - There is no tour library and no help links (section 2).
   - Candidate anchor points are the shared layout and grid components. — [FE/shared/layouts/AppTopbar.tsx](/home/user/grc_frontend_code/src/shared/layouts/AppTopbar.tsx); [FE/shared/layouts/AppSidebar.tsx](/home/user/grc_frontend_code/src/shared/layouts/AppSidebar.tsx); [FE/shared/ui/DataTable.tsx](/home/user/grc_frontend_code/src/shared/ui/DataTable.tsx)
   - The new Markdown guide could be served in-app or linked from those components.
8. **Contextual empty states with a "first record" call to action (mostly missing).**
   - The generic "No records found." in `DataTable` could carry per-register guidance, following the pattern already used in IncidentsPage. — [FE/shared/ui/DataTable.tsx](/home/user/grc_frontend_code/src/shared/ui/DataTable.tsx); [FE/domain/operations-center/IncidentsPage.tsx:949](/home/user/grc_frontend_code/src/domain/operations-center/IncidentsPage.tsx)
9. **Import framework for onboarding data (largely missing or broken).**
   - Fix or remove the demo dialog. — [FE/shared/ui/DataTable.tsx:829-835](/home/user/grc_frontend_code/src/shared/ui/DataTable.tsx)
   - Wire the existing BE imports and align their result DTOs to `CsvImportResult`. — [FE/shared/ui/CsvImportModal.tsx:8-14](/home/user/grc_frontend_code/src/shared/ui/CsvImportModal.tsx)
   - Add imports for departments, assets, vendors, agreements, groups and risk exceptions.
   - Add downloadable templates, name/email-based relation resolution instead of UUIDs, quote-safe parsing everywhere (Users, Operations and the Assessments strategy import split on commas), upsert, a dry run on every import, and a Users import result report.
   - Evidence: section 3.
10. **Starter content and template library (missing).**
    - Framework packages (ISO 27001, NIST, local AZ regulations) as importable packages, building on the 8-column package-item format.
    - Default incident stages.
    - A risk appetite that works on a 5×5 scale (fixes RM-02).
    - Plug in at the lazy-default services (section 1) and `CompliancePackageServiceImpl.importPackageItems`. — [BE/modules/compliance/api/CompliancePackageController.java:123-124](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/compliance/api/CompliancePackageController.java)
11. **Sample data and sandbox (missing in product).**
    - Productise `GUIDE/tools/seed_demo.py` server-side, or reuse the `DummyDataSeeder` logic, scoped to a tenant.
    - Pair it with Settings › Clear Data for a "start clean" button. — [BE/seed/DummyDataSeeder.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/seed/DummyDataSeeder.java); [BE/modules/settings/service/impl/TenantDataResetServiceImpl.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/settings/service/impl/TenantDataResetServiceImpl.java)
12. **"Connect your systems" step.**
    - Available now: LDAP connector plus test, SMTP status plus test send, and webhooks plus test. — [FE/app/(app)/integrations-automation/page.tsx](/home/user/grc_frontend_code/src/app/(app)/integrations-automation/page.tsx); [BE/modules/settings/api/WebhookController.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/settings/api/WebhookController.java)
    - Missing: OIDC/SAML login (`SecurityConfig` has no `oauth2Login`/`saml2Login`), JIT provisioning and group mapping from LDAP, SCIM, API tokens (and enforcement of `apiAccessEnabled`), Jira, and HRIS or cloud connectors. Evidence: section 4.
13. **Tenant discovery at sign-in (missing).**
    - Login needs `X-Tenant-Id` from `localStorage` or the build-time env, so a multi-customer SaaS needs an organisation slug, subdomain or email-domain lookup. — [FE/shared/api/apiClient.ts:111](/home/user/grc_frontend_code/src/shared/api/apiClient.ts); [FE/app/(public)/login/page.tsx](/home/user/grc_frontend_code/src/app/(public)/login/page.tsx)
14. **Onboarding emails and reminders (missing).**
    - Only invite and test mails exist, and scheduling is disabled.
    - Plug in at `SmtpEmailSender`/`EmailSender`, and use the `NotificationSweepScheduler` pattern for reminders such as "setup incomplete" or "you were assigned". — [BE/modules/notification/mail/SmtpEmailSender.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/notification/mail/SmtpEmailSender.java); [BE/modules/notification/service/NotificationSweepScheduler.java](/home/user/grc_backend_code/src/main/java/com/strativu/grc360/modules/notification/service/NotificationSweepScheduler.java)
15. **Role-aware first landing (missing).**
    - Everyone lands on the Command Center, and users without dashboard access hit Access Denied (PW-11).
    - The FE admin check is substring-based (PW-09), so admin-only onboarding steps must use the server's admin determination. — [FE/shared/auth/AuthContext.tsx:243-245](/home/user/grc_frontend_code/src/shared/auth/AuthContext.tsx)
16. **i18n for onboarding copy and emails.**
    - Add AZ dictionary entries for new UI copy. — [FE/shared/i18n/az.ts](/home/user/grc_frontend_code/src/shared/i18n/az.ts)
    - Add a server-side locale for emails. Section 7 covers the current state.
17. **Data-correctness blockers that undermine a first-run experience.**
    - New customers would hit these quickly during setup:
      - RM-02: Above Appetite is impossible with the defaults.
      - OH-01: picking a group replaces all of a user's groups.
      - OH-07: Clone Group fails.
      - CH-01: saving a risk overwrites compliance verdicts.
      - GH-11: editing an objective wipes data.
    - Fix them before guiding customers through those steps. — [GUIDE/appendices/known-issues.md](/home/user/grc_frontend_code/doc/guide/appendices/known-issues.md)

### Inferences
- The minimum viable guided onboarding, built on existing code, is:
  - **Backend:** a platform-operator "create organisation" call that also seeds the tenant and invites the first admin (gaps 1 and 2), and an onboarding-state endpoint that combines stored flags with live counts (gap 5).
  - **Frontend:** a setup-checklist panel or wizard that mirrors the 13 documented steps and deep-links into the existing pages (gap 6).
  - **Import:** working CSV templates for departments, users with groups, assets, vendors, risks, controls and framework items (gap 9).
- Everything else (tours, sample data, SSO/SCIM, reminders) can follow incrementally.
- The order of the 13 setup steps is already justified by record dependencies in the guide. The wizard can enforce or suggest that order without new domain modelling.

### Gaps
- Effort estimates were not attempted.
- UX expectations from competitors are outside this note's scope; other researchers cover them.
