# GRC 360 — sayt üçün materiallar

Mənbə: `grc-front-end` (Next.js 16, əsas məhsul), `caspianLexGRC/caspian-admin` (köhnə prototip), `strativu` (sayt), backend `caspianlex-grc-9g2x.onrender.com/api/v1` (frontend bu ünvana proxy edir; backend kodu bu repolarda yoxdur).

## 1. Modullar (kodda olan, sidebar-dan)

Kodda **12 əsas modul, 31 alt ekran** var. Kodda "15 modul" yoxdur. 15 desəniz, sayt yazısını 12-yə düzəltmək lazımdır, ya da aşağıdakı 3 "əlavə"ni ayrıca modul kimi saymaq olar.

| # | Modul | Nə edir | Alt ekranlar |
|---|---|---|---|
| 1 | Command Center | Gecikmiş / bugünkü / gələcək tapşırıqlar, risk heat map-ləri, framework üzrə audit statusu | — |
| 2 | Governance Hub | Coverage, məqsədlər (objectives), problemlərin izlənməsi | Coverage, Issues, Objectives |
| 3 | Organization Hub | İstifadəçilər, departamentlər, rollar və icazələr | Users, Departments, Roles |
| 4 | Third Parties | Vendor reyestri və xidmət müqavilələri (SLA) | Vendors, Service Agreements |
| 5 | Asset Management | Aktiv reyestri və data axınlarının xəritəsi | Assets, Data Movement |
| 6 | Control Center | Kontrollar, siyasət və standartlar, istisnalar, BCP/DR | Controls, Policies & Standards, Exceptions, Continuity & Recovery |
| 7 | Risk Management | Aktiv, üçüncü tərəf və əməliyyat riskləri, 5×5 skorlama | Asset / Third-Party / Operational Risks, Risk Exceptions |
| 8 | Compliance Hub | Framework paketləri, qiymətləndirmələr, öhdəliklər, audit tapıntıları | Frameworks, Assessments, Obligations, Compliance Exceptions, Audit Findings |
| 9 | Operations Center | Layihələr və insidentlər | Projects, Incidents |
| 10 | Trust Center | Müştərilər üçün açıq səhifə: sertifikatlar, kontrollar, subprocessor-lar, sənədlər | public səhifə |
| 11 | Integrations & Automation | AWS, Azure, GCP, Okta, GitHub, Jira, Slack, CrowdStrike… + avtomatik workflow-lar | Integrations, Workflows |
| 12 | Settings | Autentifikasiya (SSO/MFA), sistem sağlamlığı, yeniləmələr, sistem jurnalı | Authentication, About, System Health, Updates, System Log |

Köhnə prototipdə (caspian-admin) olub, yenisinə hələ keçməyənlər — 15-ə tamamlamaq üçün namizədlər: **Evidence** (sübut kitabxanası), **Reports** (hesabatlar), **Account Reviews** (giriş icmalları). Bunları yazmaq istəyirsinizsə, əvvəl yeni frontend-ə əlavə olunmalıdır.

## 2. Screenshot-lar (demo data, profil menyusu bağlı)

`screenshots/` qovluğunda, 2400×1500:
1. `01-command-center.png` — tapşırıqlar + asset risk heat map
2. `02-frameworks.png` — framework paketləri (CMMC, ISO 27001, NIST CSF, PCI DSS, SOC 2)
3. `03-asset-risks.png` — risk reyestri, skor və treatment ilə
4. `04-audit-findings.png` — audit tapıntıları
5. `05-integrations.png` — inteqrasiyalar və avtomatik evidence
6. `06-trust-center.png` — açıq Trust Center səhifəsi

Qeyd: audit findings ekranında bir neçə təsvir azərbaycanca yazılıb ("Xarici pentest…"). İngiliscə sayt üçün demo datanı düzəltmək lazımdır.

## 3. Loqo

**GRC 360-ın ayrıca loqosu yoxdur.** Tətbiqdə sadəcə narıncı kvadrat + "GRC" yazısı var. Strativu loqosu var (`public/brand/logo-full.png`, `logo-mark.png`, `logo-mark.svg`). Ya Strativu mark-ı istifadə edin, ya da GRC 360 üçün loqo hazırlatmaq lazımdır.

## 4. Fərqi nədir (kodda olanlara əsasən)

1. **Bir kontrol, çox framework.** Kontrol bir dəfə yazılır, ISO 27001, SOC 2, NIST, PCI DSS tələblərinə eyni anda bağlanır.
2. **Evidence özü yığılır.** AWS, Okta, GitHub və s. kollektorlar cədvəl üzrə yoxlayır; uğursuz yoxlama Jira tiketi və Slack xəbərdarlığı açır.
3. **Hər şey bir yerdə.** Risk, aktiv, vendor, kontrol, audit və insident eyni sistemdə bir-birinə bağlıdır; Excel faylları arasında qaçmaq yoxdur.
4. **Açıq Trust Center.** Müştərilər sertifikatları və təhlükəsizlik vəziyyətini özü görür, sorğu anketlərinə daha az vaxt gedir.
5. **Azərbaycan qanunvericiliyi.** Fərdi məlumatlar haqqında Qanun (998-IIIQ) xəritələnir (sayt datasında "in progress").

Saytdakı "hash-chained audit trail" (changelog 2026-08-29) frontend-də hələ görünmür; System Log ekranı var, amma hash zənciri backend-dədirsə, onu təsdiqləyin.

## 5. Rəqəmlər — yalnız doğru olanlar

Kodda yoxlanıla bilən:
- **12 modul, 31 ekran** hazır (frontend).
- **5 framework paketi** sistemdə: CMMC, ISO 27001:2022, NIST CSF 2.0, PCI DSS v4.0, SOC 2 Type II.
- **11 inteqrasiya** kataloqda: AWS, GCP, Azure, Okta, Google Workspace, GitHub, Jira, Slack, Datadog, BambooHR, CrowdStrike.

Diqqət — bunları saytda yazmayın, seed (nümunə) datadır:
- Framework item sayları (CMMC 110, ISO 114, NIST 108, PCI 84, SOC 2 66). ISO 27001:2022-də əslində 93 Annex A kontrolu var; 114 köhnə 2013 versiyasının rəqəmidir.
- "522 auto-monitored controls", "9 active integrations", Trust Center-dəki "99.99% uptime", "98/100 security score" — hamısı hardcoded demo rəqəmlərdir.

## 6. Status və vaxt

- **Hazır:** frontend-də 12 modul; risk və kontrol reyestrləri (changelog 2026-07-03); cross-framework mapping (2026-09-12); AWS IAM və GitHub kollektorları (2026-07-31).
- **Hazırlanır:** NIST CSF 2.0, GDPR, AZ 998-IIIQ xəritələnməsi; frontend-in qalan ekranlarının backend-ə qoşulması (hazırda yalnız ~9 ekran API çağırır, qalanları mock datadır).
- **Plan:** early access 2027-ci ilin I rübündə (`site.ts`).

## 7. Kimin üçün / deployment

Kodda bu barədə qərar yoxdur. Tövsiyə (təsdiqləyin): banklar və fintech (PCI DSS, DORA), orta və böyük şirkətlər (ISO 27001, SOC 2), dövlət qurumları (AZ qanunu). Kod multi-tenant cloud kimi qurulub (tenantId), indi Render-də işləyir. On-premise hələ yoxdur.

## 8. Video və animasiya

- `grc360-screen-tour.mp4` — real tətbiqdən 41 saniyəlik ekran yazısı (1440×900, səssiz, loop üçün uyğun).
- `grc360-demo.html` — animasiyalı, klikli məhsul turu: kursor özü klikləyir, istənilən vaxt dayandırıb özünüz klikləyə bilərsiniz.
