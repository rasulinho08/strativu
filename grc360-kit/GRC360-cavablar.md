# GRC 360: sayt üçün materiallar

**Mənbə (son versiya):**
- Frontend: `Strativuco/GRC_Frontend_Code`, `main` branch-i, 2026-10-04.
- Backend: `Strativuco/GRC_Backend_Code`, `develop` branch-i, 2026-10-04.

Hər iki tərəfi lokalda qaldırdım (Postgres + Spring Boot + Next.js), demo hesabla daxil olub ekranları özüm çəkdim.

---

## 1. Modullar

Məhsulda **12 modul** və onların içində **31 ekran** var (`src/shared/config/navigation.ts`). Kodda "15 modul" yoxdur. Saytda ya **12** yazın, ya da aşağıdakı B variantını istifadə edin: orada 15 real ekran ayrıca bacarıq kimi göstərilib.

### A. Məhsuldakı 12 modul (sidebar)

| # | Modul | Nə edir | İçindəki ekranlar |
|---|---|---|---|
| 1 | **Command Center** | Gecikmiş, bugünkü və gələcək tapşırıqları, aktiv/biznes/üçüncü tərəf risk heat map-lərini və uyğunluq statusunu bir ekranda göstərir | — |
| 2 | **Governance Hub** | Strateji məqsədləri, problemləri və siyasət–kontrol əhatəsini idarə edir | Coverage, Issues, Objectives (+ Audits) |
| 3 | **Organization Hub** | İstifadəçilər, departamentlər, qruplar; hər modul və hər əməliyyat üzrə icazələr | Users, Departments, Groups |
| 4 | **Third Parties** | Vendor reyestri, müqavilələr və onların bitmə xəbərdarlıqları | Vendors, Service Agreements |
| 5 | **Asset Management** | Aktiv reyestri, data axınları, GDPR sualları | Assets (+ Reviews), Data Flows |
| 6 | **Control Center** | Kontrollar, onların auditləri və texniki xidməti; siyasətlər; istisnalar; davamlılıq planları | Controls, Policies & Standards, Policy Exceptions, Continuity Plans |
| 7 | **Risk Management** | 5×5 ehtimal × təsir skorlaması, risk iştahı həddləri, müalicə planı, dövri icmal | Asset Risks, Third Party Risks, Business Risks, Risk Exceptions |
| 8 | **Compliance Hub** | Framework paketləri və tələbləri, uyğunluq analizi, öhdəliklər, audit tapıntıları | Compliance Packages, Compliance Analysis, Obligations, Compliance Exceptions, External Audit Findings |
| 9 | **Operations Center** | Təhlükəsizlik layihələri (tapşırıq, xərc) və insidentlər (mərhələlərlə) | Projects, Security Incidents |
| 10 | **Trust Center** | Müştəriyə açıq təhlükəsizlik səhifəsi: tətbiq olunan təcrübələr, data emalı, sertifikat yol xəritəsi | — |
| 11 | **Integrations & Automation** | LDAP, OAuth/SAML SSO, CSV import/export, REST API, bildirişlər | — |
| 12 | **Settings** | Autentifikasiya, sistem sağlamlığı, yeniləmələr, sistem jurnalı, sessiyalar | Authentication, About, System Health, Updates, System Log, Clear Data |

### B. Modul xəritəsi üçün 15 bacarıq (hamısı məhsulda real ekrandır)

1. **Command Center**: tapşırıqlar və risk heat map-ləri bir ekranda
2. **Risk Register**: aktiv, biznes və üçüncü tərəf riskləri, 5×5 skorlama
3. **Risk Exceptions**: qəbul edilmiş risklər, bitmə tarixi ilə
4. **Control Library**: kontrollar, audit və texniki xidmət cədvəlləri ilə
5. **Policy Management**: siyasət və standartlar, versiya və icmal tarixi ilə
6. **Compliance Packages**: framework-lər və onların tələbləri (ISO, SOC 2, NIST, GDPR…)
7. **Compliance Analysis**: tələb üzrə uyğunluq boşluqları
8. **Obligations**: hüquqi və müqavilə öhdəlikləri
9. **Audit Findings**: xarici audit tapıntıları, sahib və son tarix ilə
10. **Asset Inventory**: aktivlər və data axınları (GDPR)
11. **Vendor Management**: vendorlar və xidmət müqavilələri
12. **Business Continuity**: davamlılıq planları, testlər və auditlər
13. **Incident Management**: təhlükəsizlik insidentləri, mərhələlərlə
14. **Governance**: məqsədlər, problemlər, əhatə analizi
15. **Trust Center**: müştərilər üçün açıq təhlükəsizlik səhifəsi

(İstəsəniz 15-ci yerə Trust Center əvəzinə **Access & Identity** yaza bilərsiniz: rollar, LDAP, SSO.)

---

## 2. Screenshot-lar

`screenshots/` qovluğunda, 3200×2000 (2x). Hamısı demo data ilə çəkilib, profil menyusu bağlıdır:

1. `01-command-center.png`: tapşırıqlar və asset risk heat map
2. `02-asset-risks.png`: risk reyestri
3. `03-controls.png`: kontrol siyahısı
4. `04-compliance-packages.png`: framework paketləri (ISO 27001, SOC 2, NIST, GDPR, PCI DSS, AZ qanunu)
5. `05-audit-findings.png`: audit tapıntıları
6. `06-trust-center.png`: Trust Center
7. `07-policies-standards.png`: siyasətlər (ehtiyat şəkil)

Demo datanı API ilə özüm yüklədim: adlar, risklər, vendorlar və s. uydurmadır, real müştəri datası yoxdur. Framework paketlərinə yalnız bir neçə nümunə tələb əlavə etmişəm (bax: 5-ci bənd).

---

## 3. Loqo

`logo/` qovluğunda, məhsulun özündən götürülüb (`public/brand/`):
- `grc360-logo.png`: tam loqo (işarə + "GRC 360°"), 640×357, şəffaf fon
- `grc360-mark.png`: yalnız işarə, 256×256, şəffaf fon

SVG və ya böyük ölçülü versiya repoda yoxdur. 640px vebdə kiçik loqo üçün bəs edir, böyük hero üçün dizaynerdən SVG istəyin.

---

## 4. Fərqi nədir (kodda yoxlanılıb)

1. **Hər şey bir-birinə bağlıdır.** Risk birbaşa onu azaldan kontrola, siyasətə, aktivə, layihəyə və framework tələbinə bağlanır. Excel-də bu əlaqələr əl ilə saxlanılır və qırılır.
2. **Risk iştahı və skorlama.** 5×5 matris, təşkilatın öz həddləri (threshold matrix) və qalıq risk hesablanır.
3. **Avtomatik xəbərdarlıqlar.** Müqavilə bitməsi (həftə qalmış və bitmək üzrə), məqsəd auditinin vaxtı, gecikmiş hədəflər, istisnaların bitməsi planlaşdırılmış işlərlə izlənir.
4. **Azərbaycan dilində interfeys və yerli qanun.** UI tam AZ/EN-dir (3 200 sətirlik tərcümə faylı). AZ Fərdi Məlumatlar Qanunu ayrıca paket kimi yüklənə bilir.
5. **Bulud və ya öz serverinizdə.** Multi-tenant SaaS, həm də Docker ilə on-premise quraşdırma; LDAP/Active Directory, OAuth və SAML SSO.

---

## 5. Rəqəmlər: yalnız doğru olanlar

**Saytda yazmaq olar (kodda var):**
- **12 modul, 31 ekran**
- **600+ API endpoint**, **120+ məlumat modeli** (backend)
- **1 200+ backend faylı, 550 test faylı**; frontend-də 80+ test faylı
- **2 dil**: Azərbaycan və İngilis
- **3 giriş üsulu**: LDAP/AD, OAuth SSO, SAML SSO (+ e-poçt/şifrə)

**Yazmayın (hələ doğru deyil):**
- **"X kontrol/tələb xəritələnib":** framework kataloqu (ISO 27001 Annex A-nın 93 kontrolu və s.) sistemə hazır yüklənmir. Paketlər və tələblər istifadəçi tərəfindən yaradılır və ya CSV ilə import olunur. Hazır kataloq yükləsəniz, sonra rəqəm yazmaq olar.
- **"N framework dəstəklənir":** hər hansı framework yüklənə bilər, amma hazır gələn yoxdur.
- **Hazırkı saytda (strativu.com) koda uyğun gəlməyən iddialar:**
  - **AWS IAM / GitHub evidence kollektorları:** backend-də yoxdur.
  - **Hash-chained audit trail:** sistem jurnalı var, amma hash zənciri yoxdur.
  - **Jira inteqrasiyası və e-poçt xülasələri:** məhsulun özündə "planned" kimi göstərilir.

  Bunları saytdan çıxarmaq və ya "planlaşdırılır" kimi yazmaq lazımdır.

---

## 6. Status və vaxt

**Hazırdır:**
- Bütün 12 modul backend-ə qoşulub.
- Server-side səhifələmə, CSV import/export.
- Rollar və icazələr, LDAP/SSO.
- Trust Center, bildirişlər, sessiya təhlükəsizliyi.
- Frontend versiyası 0.1.0 (2026-09-04).

**İşlənilir:**
- API müqaviləsinin (OpenAPI) tam sinxronlaşdırılması.
- CI/CD.
- Davamlılıq planı auditləri (son commit-lər).

**Növbədə:**
- E-poçt xülasələri, Jira.
- Risk matrisi üçün xüsusi çəki əmsalları.
- İnsident eskalasiya qaydaları.

**Pilot və launch:**
- Plan sənədində "ilk 3 korporativ müştəri ilə pilot" yazılıb, amma konkret tarix yoxdur.
- Strativu saytında "early access Q1 2027" yazılıb.

Tarixi siz təsdiqləyin.

---

## 7. Kimin üçün və necə quraşdırılır

Biznes planına görə (`doc/plan/03-biznes-plan.md`):
- **Banklar və maliyyə:** Mərkəzi Bank tələbləri, PCI DSS.
- **Dövlət və kritik infrastruktur.**
- **Kiçik və orta şirkətlər:** Starter planı, 20 istifadəçiyə qədər.

**Deployment: hər ikisi.** Multi-tenant bulud (SaaS) və Enterprise üçün on-premise / air-gapped. Kodda bunun üçün Docker Compose var: app, Postgres, Redis, MinIO, Nginx, Prometheus, Grafana.

---

## 8. Video və animasiyalı demo

Siz dediyiniz kimi sonraya saxladım. Köhnə versiyadan çəkilmiş video və demo bu qovluqdan silindi.
