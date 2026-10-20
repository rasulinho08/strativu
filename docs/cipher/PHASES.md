# cipher — fazalar üzrə iş planı

> Bu sənəd [`RESEARCH.md`](./RESEARCH.md)-dəki araşdırmanın tasklara bölünmüş halıdır.
> Fazalar sıra ilə gedir. Hər faza **bir PR**-dır: tasklar bitir, "Hazırdır əgər" şərtləri yoxlanılır, sonra növbəti fazaya keçilir.
> Task ID-ləri (`F07.3`) commit mesajlarında və PR başlıqlarında istifadə olunur.

## Qəbul edilmiş ilkin qərarlar

`RESEARCH.md` §8-dəki suallara cavab gələnə qədər aşağıdakılar qəbul edilir. Hər biri dəyişdirilə bilər; təsir etdiyi fazalar göstərilib.

| # | Qərar | Default | Təsir edir |
| --- | --- | --- | --- |
| Q1 | İlk OS | **Windows 10/11** | F33–F38 |
| Q2 | Yerləşdirmə | **Eyni kod həm SaaS, həm on-prem** (docker compose); pilot on-prem | F14, F48 |
| Q3 | Server dili | **Rust (axum) + PostgreSQL** | F14–F22 |
| Q4 | `quarantine` | ML yoxdur; **qayda balı ilə**, F21-də | F09, F21 |
| Q5 | v1 AI alətləri | ChatGPT, Claude, Gemini, Copilot, DeepSeek, Perplexity, Mistral Le Chat, Grok, Meta AI, Poe | F30, F34 |
| Q6 | Repo | Yeni monorepo **`Strativuco/cipher`** | F01 |
| Q7 | Dillər (UI) | Azərbaycan (əsas), ingilis, rus | F23, F31, F36 |
| Q8 | ML / LLM | **Heç yerdə yoxdur.** Detektorlar deterministikdir: regex, validator, lüğət, hash | hamısı |

## Ölçülər

`S` = 1–3 iş günü · `M` = 3–7 gün · `L` = 1–2 həftə (1 developer + Claude üçün təxmini).

## Ümumi baxış

| Blok | Fazalar | Mərhələ (milestone) |
| --- | --- | --- |
| A. Bünövrə və detektor mühərriki | F01–F13 | **M0** — engine hazırdır, FP ölçülür |
| B. Server (control plane) | F14–F22 | |
| C. Admin konsol | F23–F28 | |
| D. Brauzer extension | F29–F32 | **M1** — monitorinq pilotu (brauzer + server + konsol) |
| E. Windows agent | F33–F38 | **M2** — Windows-da real qoruma |
| F. Gateway, fayl, EDM | F39–F42 | **M3** — bütün kanallar |
| G. macOS və Linux | F43–F44 | **M4** — cross-platform |
| H. Insight, archive, enterprise | F45–F48 | **M5** — satışa hazır |

```
F01 → F02 → F03 → F04 ─┬→ F05 → F06 ─┐
                       ├→ F07 ────────┼→ F09 → F10 ─┬→ F11
                       └→ F08 ────────┘             ├→ F12 ──────────────┐
                                                    └→ F13               │
F02 → F14 → F15 → F16 → F17 → F18 → F19 → F20 → F21 → F22               │
F14 → F23 → F24 → F25 → F26 → F27 → F28                                 │
F12 + F17 + F18 → F29 → F30 → F31 → F32 ═══ M1 ◀─────────────────────────┘
M1 → F33 → F34 → F35 → F36 → F37 → F38 ═══ M2
M2 → F39 · F40 · F41 · F42 ═══ M3 → F43 · F44 ═══ M4 → F45 · F46 · F47 · F48 ═══ M5
```

---

# A. Bünövrə və detektor mühərriki

## F01 — Monorepo və alətlər `S`
**Məqsəd:** boş, amma 3 OS-da CI-dən keçən monorepo.
**Asılılıq:** —

- [ ] F01.1 `Strativuco/cipher` reposu; `main` qorunur (PR + yaşıl CI tələb olunur)
- [ ] F01.2 Cargo workspace: `crates/` altında boş crate-lər (`cipher-engine`, `cipher-rules`, `cipher-policy`, `cipher-proto`, `cipher-service`, `cipher-user`, `cipher-gateway`, `cipher-server`)
- [ ] F01.3 pnpm workspace: `apps/console`, `apps/extension`, `apps/tray`, `packages/ui`, `packages/engine-js`
- [ ] F01.4 `rust-toolchain.toml` (stabil versiya sabitlənir), `rustfmt.toml`, `clippy.toml`, `.editorconfig`, `deny.toml` (cargo-deny: lisenziya və zəiflik yoxlaması)
- [ ] F01.5 ESLint + Prettier + TypeScript `strict`
- [ ] F01.6 GitHub Actions: `ubuntu`, `windows`, `macos` matrisi — `cargo fmt --check`, `clippy -D warnings`, `cargo test`, `pnpm lint`, `pnpm test`, `cargo deny check`
- [ ] F01.7 `README.md`, `CONTRIBUTING.md` (commit formatı `F07.3: ...`), `SECURITY.md`, `CODEOWNERS`, lisenziya (proprietary)
- [ ] F01.8 `docs/adr/` qovluğu və şablon; bu sənəd və `RESEARCH.md` repoya köçürülür

**Nəticə:** işləyən boş monorepo.
**Hazırdır əgər:** CI üç OS-da yaşıldır; `cargo build` və `pnpm build` təmiz keçir.

## F02 — Domen modeli və ADR-lər `S`
**Məqsəd:** bütün komponentlərin danışdığı ortaq dil.
**Asılılıq:** F01

- [ ] F02.1 ADR-001 dil seçimi (Rust + TS), ADR-002 ML yoxdur, ADR-003 yalnız user-mode, kernel driver yoxdur, ADR-004 xam həssas dəyər endpoint-dən çıxmır, ADR-005 fail-closed
- [ ] F02.2 `docs/glossary.md`: finding, rule, policy, action, channel, destination, incident, agent, device, tenant, module
- [ ] F02.3 `cipher-proto` tipləri: `Category`, `Severity` (critical/high/medium/low/info + SLA), `Action` (allow/review/mask/block/quarantine/coach/read_only), `Channel` (browser/agent/gateway/file/audit), `AgentStatus` (healthy/degraded/offline/tamper/pending), `Module` (guard/insight/archive)
- [ ] F02.4 `Finding`, `Incident`, `PolicyRef`, `DeviceInfo`, `Heartbeat` struct-ları; `serde` + `schemars` ilə JSON Schema
- [ ] F02.5 JSON Schema → TypeScript tipləri (`packages/engine-js/types`), CI-də uyğunsuzluq yoxlaması
- [ ] F02.6 İnsident ID formatı `EVT-YYYY-MM-DD-NNNN`, siyasət ID formatı `P-NN`
- [ ] F02.7 Protokol versiyası (`proto_version`), geriyə uyğunluq qaydaları

**Hazırdır əgər:** tiplər Rust və TS-də eynidir (CI yoxlayır); ADR-lər merge olunub.

## F03 — Qayda formatı (`cipher-rules`) `M`
**Məqsəd:** qaydalar kodda yox, deklarativ fayllarda yaşayır.
**Asılılıq:** F02

- [ ] F03.1 TOML sxemi: `id`, `name` (az/en/ru), `category`, `pattern`, `flags`, `boundary` (`digit` / `word` / `none`), `validators[]`, `context.keywords[]`, `context.window`, `context.required`, `severity`, `confidence`, `strength` (`strong` / `weak`)
- [ ] F03.2 Hər qaydanın içində testlər: `should_match[]`, `should_not_match[]`
- [ ] F03.3 Parser + semantik validasiya (naməlum validator, boş pattern, təkrarlanan ID)
- [ ] F03.4 Regex limitləri: `RegexBuilder::size_limit`, `dfa_size_limit`; lookaround / backreference rədd edilir və aydın xəta verilir
- [ ] F03.5 Qayda paketi (`rulepack`): versiya, tenant, qaydalar, lüğətlər; kanonik JSON forması
- [ ] F03.6 ed25519 imza və yoxlama (`ed25519-dalek`); imzasız paket yüklənmir
- [ ] F03.7 CLI `cipher-rules lint | test | pack | sign | verify`

**Hazırdır əgər:** `cipher-rules test rules/` bütün nümunə qaydaları keçirir; pozulmuş imza rədd edilir.

## F04 — Engine nüvəsi `M`
**Məqsəd:** mətn → findings, sürətli və təhlükəsiz.
**Asılılıq:** F03

- [ ] F04.1 `Detector` trait (`fn detect(&self, text: &Normalized) -> Vec<Span>`), `Span { category, start, end, confidence, rule_id, strength }`
- [ ] F04.2 Normallaşdırma: Unicode NFC, boşluqların vahidləşdirilməsi, sıfır enli simvolların (U+200B və s.) silinməsi və orijinal offset-ə xəritə
- [ ] F04.3 **Azərbaycan dili üçün case folding**: `I`→`ı`, `İ`→`i` (Rust `to_lowercase` bunu səhv edir); transliterasiya (ə→e, ş→s, ç→c, ğ→g, ı→i, ö→o, ü→u) ayrıca axtarış variantı kimi
- [ ] F04.4 `RegexDetector` + **boundary validator** (safeai-dakı `(?<!\d)`, `(?!\d)` əvəzinə match-dən sonra kənar simvolların yoxlanması)
- [ ] F04.5 `RegexSet` prefilter: əvvəl hansı qaydaların ümumiyyətlə tutduğu tapılır, sonra yalnız onlar işlədilir
- [ ] F04.6 Overlap həlli (safeai `_dedupe` portu): ən yüksək confidence qalır, bərabərdə uzun olan
- [ ] F04.7 Kontekst pəncərəsi: açar söz match-dən N simvol əvvəl/sonra
- [ ] F04.8 Offset-lər: UTF-8 (Rust) **və UTF-16** (JS/DOM) — hər ikisi qaytarılır
- [ ] F04.9 Limitlər: maksimum giriş ölçüsü, maksimum finding sayı, timeout yerinə ölçü limiti
- [ ] F04.10 Benchmark (`criterion`): 1 MB mətn < 50 ms (orta noutbuk)

**Hazırdır əgər:** testlər keçir; benchmark büdcəsi CI-də izlənir; `unsafe` yoxdur.

## F05 — Validatorlar `S`
**Məqsəd:** regex tutur, validator təsdiqləyir — FP-ni azaldan əsas mexanizm.
**Asılılıq:** F04

- [ ] F05.1 Luhn (kart), BIN aralıqları (Visa/Mastercard/Amex/UnionPay/Mir) — yalnız prefiks və uzunluq
- [ ] F05.2 IBAN mod-97 + ölkələr üzrə uzunluq cədvəli (AZ = 28)
- [ ] F05.3 FİN: 7 simvol, hərf + rəqəm qarışığı, qadağan hərflər (verilən əlifba ilə yoxlanılmalı)
- [ ] F05.4 VÖEN: 10 rəqəm; checksum alqoritmi rəsmi mənbədən təsdiqlənməlidir (təsdiqlənməsə yalnız format)
- [ ] F05.5 Telefon: AZ mobil/şəhər prefiksləri, `+994` normallaşdırması; beynəlxalq üçün E.164 uzunluğu
- [ ] F05.6 Tarix etibarlılığı (gün/ay aralığı, ağlabatan il aralığı), IPv4/IPv6, email (TLD siyahısı)
- [ ] F05.7 Hər validator üçün property testləri (`proptest`)

**Hazırdır əgər:** hər validatorun müsbət/mənfi testləri var; qaydalar `validators = ["luhn"]` kimi istinad edə bilir.

## F06 — AZ-PII qayda paketi `M`
**Məqsəd:** safeai detektorlarının `rules/az-pii/*.toml`-a köçürülməsi.
**Asılılıq:** F05

- [ ] F06.1 EMAIL, PHONE (`+994`, `050/051/055/060/070/077/099/010`, şəhər `012/018/02x/036`, `994 ...`)
- [ ] F06.2 IBAN (bitişik və 4-lük qruplarla), CREDIT_CARD (Luhn)
- [ ] F06.3 FIN_CODE (kontekstli `FIN: ...` + cədvəl xanasında tək dəyər), TAX_ID / VÖEN (kontekstli)
- [ ] F06.4 PASSPORT (`AZE########`, `AA#######`), DATE_OF_BIRTH (kontekstli)
- [ ] F06.5 FINANCE (məbləğ + AZN / ₼ / USD / EUR / manat / dollar), IP_ADDRESS
- [ ] F06.6 ORGANIZATION (MMC/ASC/QSC/LLC... suffiksi)
- [ ] F06.7 PERSON — `strength = weak`: ata adı (`oğlu/qızı`), `Cənab/Xanım/Dr.`, `-ov/-ova/-yev/-zadə`, ad siyahısı, küçə adı istisnası
- [ ] F06.8 **safeai-dakı `ID_NUMBER \d{7,12}` və "iki böyük hərfli söz = ad" qaydaları yalnız `weak`** — heç vaxt `block` etmir
- [ ] F06.9 Rus və ingilis dilində açar söz variantları (`дата рождения`, `passport no`)

**Hazırdır əgər:** safeai `test_dlp.py` və `test_wider_scan.py` nümunələri Rust-da keçir.

## F07 — Lüğətlər və şirkət terminləri `M`
**Məqsəd:** minlərlə şirkət termininin xətti zamanda axtarışı.
**Asılılıq:** F04

- [ ] F07.1 `aho-corasick` əsaslı `DictionaryDetector` (leftmost-longest)
- [ ] F07.2 safeai `custom_terms` sintaksisinin portu: `#` = rəqəm, `@` = hərf, boşluq = `\s+`
- [ ] F07.3 Azərbaycan şəkilçiləri: 4+ simvollu terminə şəkilçi qoşula bilər (`Orion` → `Orionun`, `Orionla`)
- [ ] F07.4 Transliterasiya variantları (ə/e, ş/s...) və case-insensitive (F04.3)
- [ ] F07.5 Limitlər: 50 000 termin, 200 simvol; istifadəçi regex yaza bilmir
- [ ] F07.6 Lüğət növləri: layihə kod adları, müştəri adları, daxili sənəd nömrələri, "qadağan sözlər"
- [ ] F07.7 Benchmark: 50k termin + 1 MB mətn

**Hazırdır əgər:** safeai `test_custom_terms.py` (21 test) keçir.

## F08 — Sirlər və mənbə kodu detektorları `M`
**Məqsəd:** "P-07 Sirlərin qorunması" və "P-11 Mənbə kodu" siyasətləri üçün detektorlar.
**Asılılıq:** F04

- [ ] F08.1 Açar formatları: AWS (`AKIA...`, secret), GCP service account JSON, Azure connection string, GitHub (`ghp_`, `github_pat_`), GitLab (`glpat-`), Slack (`xox[abpr]-`), Stripe (`sk_live_`), OpenAI (`sk-...`, `sk-proj-`), Anthropic (`sk-ant-`), Telegram bot token
- [ ] F08.2 `-----BEGIN ... PRIVATE KEY-----`, JWT (3 base64url hissə + header decode yoxlaması), `.env` sətirləri (`PASSWORD=`, `SECRET=`)
- [ ] F08.3 DB connection string-lər (`postgres://user:pass@`, `mongodb+srv://`, JDBC)
- [ ] F08.4 Shannon entropiyası həddi (kontekst açar sözü ilə birlikdə)
- [ ] F08.5 Mənbə kodu balı: sintaksis simvolları sıxlığı, açar sözlər (`def`, `class`, `import`, `function`, `public static`, `#include`, `SELECT ... FROM`), girinti nisbəti, sətir sayı → 0–100 bal; həddən yuxarı `SOURCE_CODE` finding
- [ ] F08.6 Daxili host/IP nümunələri (`*.corp.local`, RFC1918) — tenant konfiqurasiyası ilə
- [ ] F08.7 gitleaks/trufflehog açıq test nümunələri ilə müqayisə (lisenziyaya uyğun)

**Hazırdır əgər:** hər açar növü üçün müsbət/mənfi nümunələr; adi mətn və markdown-da kod balı FP-si korpusda ≤ 0.5%.

## F09 — Bal və siyasət qiymətləndirməsi (`cipher-policy`) `M`
**Məqsəd:** findings + kontekst → bir hərəkət, səbəbi ilə birlikdə.
**Asılılıq:** F06, F07, F08

- [ ] F09.1 Siyasət modeli: `P-NN`, ad, qaydalar/kateqoriyalar, şərtlər (kanal, destination domen/app, istifadəçi qrupu, fayl tipi), say hədləri (`≥5 kart → critical`), hərəkət, severity
- [ ] F09.2 Bir neçə siyasət tutanda ən sərt hərəkət qalır: `block > quarantine > read_only > mask > coach > review > allow`
- [ ] F09.3 `weak` finding-lər tək başına `block` / `quarantine` edə bilmir (ən çox `coach`)
- [ ] F09.4 **Monitorinq rejimi**: siyasətin ilk N günü (default 14) hərəkət `review`-a endirilir; qalan gün sayı hesablanır
- [ ] F09.5 **Fövqəladə rejim**: müddətli; `block` → `coach`, `quarantine` → `review`
- [ ] F09.6 Quarantine tetikleyicisi (ML-siz): məsələn "≥ 2 fərqli strong kateqoriya" və ya "EDM uyğunluğu"
- [ ] F09.7 `Decision { action, severity, policy_ids, explain[] }` — hər qərarın "niyə" izi (konsolda göstərilir)
- [ ] F09.8 Fail-closed: engine xətası / limit aşımı → siyasətin `on_error` hərəkəti (default `block`)

**Hazırdır əgər:** qərar cədvəli testləri (table-driven) bütün kombinasiyaları əhatə edir.

## F10 — Test korpusu, FP ölçmə, fuzzing `M`
**Məqsəd:** FP ≤ 0.5% hədəfini rəqəmlə sübut etmək.
**Asılılıq:** F09

- [ ] F10.1 `corpus/positive/` və `corpus/negative/` — az/en/ru: email-lər, müqavilələr, hesabatlar, kod, chat mesajları (sintetik, real şəxs məlumatı yoxdur)
- [ ] F10.2 safeai-nin 88 testinin uyğun hissələrinin portu
- [ ] F10.3 `cipher-bench` CLI: qayda üzrə precision / recall / FP nisbəti → markdown və JSON hesabat
- [ ] F10.4 CI qapısı: strong qaydalarda FP > 0.5% → CI qırmızı
- [ ] F10.5 `cargo-fuzz`: engine heç bir girişdə panic etmir, yaddaş limitini aşmır
- [ ] F10.6 Performans reqressiya testi (F04.10 büdcəsi)

**Hazırdır əgər:** hesabat PR-a avtomatik şərh kimi düşür; fuzzing ən azı 1 saat panic-siz.
**═══ M0: engine hazırdır.**

## F11 — Maskalama və tokenləşdirmə `S`
**Məqsəd:** `mask` hərəkəti və gateway üçün təhlükəsiz əvəzləmə.
**Asılılıq:** F09

- [ ] F11.1 Kateqoriya üzrə maska stilləri: token (`[CARD_1]`), qismən (`4169 **** **** 1234`), tam (`████`)
- [ ] F11.2 Sessiya üzrə deterministik tokenlər (safeai `tokenizer.py` portu)
- [ ] F11.3 Rehidrasiya və token bütövlüyü yoxlaması (safeai `integrity.py` portu: yalnız format düzəlişi, "təxmin" yoxdur)
- [ ] F11.4 Konsola gedən maskalanmış fraqment: dəyərin özü yox, ətrafındakı ±20 simvol + maska
- [ ] F11.5 Dəyər hash-i: tenant duzu ilə HMAC-SHA256 (eyni dəyərin təkrarını saymaq üçün)

**Hazırdır əgər:** safeai `test_tokenization.py`, `test_rehydration.py`, `test_token_integrity.py` ekvivalentləri keçir.

## F12 — WASM build (`@cipher/engine`) `M`
**Məqsəd:** eyni engine brauzerdə.
**Asılılıq:** F09, F11

- [ ] F12.1 `wasm-bindgen` + `wasm-pack` build; `wasm-opt -Oz`
- [ ] F12.2 JS API: `loadRulepack(bytes, signature)`, `scan(text) → Finding[]` (UTF-16 offset-lərlə), `evaluate(findings, context) → Decision`, `mask(text, findings)`
- [ ] F12.3 Ölçü büdcəsi: gzip ilə ≤ 1.5 MB; CI-də izlənir
- [ ] F12.4 Testlər: Node (vitest) və headless Chromium (Playwright) — native ilə **eyni nəticə** (golden testlər)
- [ ] F12.5 MV3 üçün qeyd: WASM service worker / offscreen document-də işləyir, CSP-də `'wasm-unsafe-eval'`
- [ ] F12.6 `packages/engine-js` npm paketi (daxili registry və ya workspace)

**Hazırdır əgər:** golden testlər native və WASM-da eyni JSON-u çıxarır.

## F13 — Sənəddən mətn çıxarma `M`
**Məqsəd:** fayl kanalı (upload) üçün.
**Asılılıq:** F04

- [ ] F13.1 Fayl tipi magic bytes ilə (`infer`), uzantı ilə yox
- [ ] F13.2 DOCX / XLSX / PPTX: `zip` + `quick-xml` (sətir/xana koordinatları ilə)
- [ ] F13.3 CSV / TXT / MD / JSON / kod faylları; kodlaşdırma aşkarlama (UTF-8 / UTF-16 / Windows-1251)
- [ ] F13.4 PDF: yalnız mətn qatı (`lopdf`); skan olunmuş PDF → "yoxlanıla bilmədi" (OCR yoxdur — bu ML sayılır)
- [ ] F13.5 Zip-bomb və ölçü qoruması: maksimum açılmış ölçü, maksimum fayl sayı, iç-içə arxiv dərinliyi
- [ ] F13.6 Həm native, həm WASM build
- [ ] F13.7 safeai `test_excel_order.py` ekvivalenti

**Hazırdır əgər:** zərərli fayllarla (bomb, pozulmuş zip) testlər crash-siz keçir.

---

# B. Server (control plane)

## F14 — Server skeleti `M`
**Asılılıq:** F02

- [ ] F14.1 `axum` + `tokio`, konfiqurasiya (env + TOML), `tracing` JSON loqlar
- [ ] F14.2 PostgreSQL: `sqlx` (compile-time yoxlanan SQL), `migrations/` qovluğu, açılışda avtomatik migrasiya (advisory lock ilə)
- [ ] F14.3 `/healthz`, `/readyz`, `/metrics` (Prometheus)
- [ ] F14.4 OpenAPI (`utoipa`) → TS client generasiyası (konsol üçün)
- [ ] F14.5 `docker-compose.dev.yml`: Postgres + server + konsol
- [ ] F14.6 Xəta formatı (RFC 7807), request ID, rate limit
- [ ] F14.7 İnteqrasiya testləri: `testcontainers` ilə Postgres

**Hazırdır əgər:** `docker compose up` ilə server qalxır; OpenAPI səhifəsi açılır.

## F15 — Tenant və admin autentifikasiyası `M`
**Asılılıq:** F14

- [ ] F15.1 `tenants`, `admins`, `roles` cədvəlləri; bütün sorğularda tenant izolyasiyası (Postgres RLS və ya məcburi `tenant_id` filtri + testlər)
- [ ] F15.2 Rollar: owner, admin, analyst (insidentlər), auditor (yalnız oxuma)
- [ ] F15.3 Login: argon2id parol, TOTP 2FA (məcburi edilə bilər), sessiya cookie (HttpOnly, SameSite=Strict), CSRF
- [ ] F15.4 Parol sıfırlama, hesab kilidlənməsi, login audit hadisələri
- [ ] F15.5 İcazə matrisi testləri (hər endpoint × hər rol)

**Hazırdır əgər:** başqa tenant-ın datasına çıxış testləri 403/404 qaytarır.

## F16 — Cihaz qeydiyyatı (enrollment) və mTLS `M`
**Asılılıq:** F15

- [ ] F16.1 Enrollment token-ləri (müddətli, istifadə sayı limitli, konsoldan yaradılır)
- [ ] F16.2 Agent açar cütü yaradır → CSR → server daxili CA ilə imzalayır (`rcgen`); cihaz ID sertifikatdadır
- [ ] F16.3 Bütün agent API-ləri mTLS tələb edir; sertifikat ləğvi (revocation) siyahısı
- [ ] F16.4 Sertifikat yenilənməsi (bitməzdən əvvəl avtomatik)
- [ ] F16.5 Extension üçün ayrıca, daha zəif identifikasiya (agent olmadan işləyən rejim: tenant token + cihaz ID)
- [ ] F16.6 `devices` cədvəli: hostname, OS, versiya, istifadəçi, son görülmə

**Hazırdır əgər:** etibarsız/ləğv olunmuş sertifikatla sorğu rədd edilir.

## F17 — Siyasət və qayda paylanması `M`
**Asılılıq:** F16, F03

- [ ] F17.1 Siyasət CRUD API (`P-NN` avtomatik nömrələnir), versiya tarixçəsi, dəyişiklik kimdən
- [ ] F17.2 Qayda paketi build: tenant siyasətləri + qaydalar + lüğətlər → `rulepack` → server açarı ilə imza
- [ ] F17.3 Agent/extension sorğusu: `GET /v1/rulepack` + `ETag` / `If-None-Match`; long-poll
- [ ] F17.4 Mərhələli yayım (əvvəl test qrupu, sonra hamı) və geri qaytarma (rollback)
- [ ] F17.5 İmza açarının rotasiyası

**Hazırdır əgər:** konsolda siyasət dəyişəndə agent ≤ 60 saniyədə yeni paketi alır (test).

## F18 — İnsident qəbulu və saxlanması `L`
**Asılılıq:** F17

- [ ] F18.1 `POST /v1/events` — batch, idempotent (klient event UUID), offline növbədən gələn köhnə hadisələr
- [ ] F18.2 **Server tərəfində qoruma**: payload-da xam dəyər ola biləcək sahələr rədd edilir; yalnız maskalanmış fraqment və HMAC
- [ ] F18.3 `incidents` sxemi: EVT ID, severity, policy, rule-lar, kanal, destination, istifadəçi, cihaz, hərəkət, istifadəçinin səbəbi (coach), vaxt
- [ ] F18.4 SLA hesablanması (critical 15 dəq, high 1 saat, medium 8 saat, low 24 saat, info yox); SLA pozuntusu
- [ ] F18.5 Status axını: open → acknowledged → resolved / false_positive; təyin etmə, şərhlər
- [ ] F18.6 FP qeydləri qayda üzrə statistikaya düşür (konsoldakı "P-07 7 gündə 34 FP" banneri üçün)
- [ ] F18.7 Filtr, axtarış, sayfalama (cursor) API-ləri; partitioning (aylıq)
- [ ] F18.8 Saxlama müddəti (retention) siyasəti

**Hazırdır əgər:** 1 milyon insidentlə siyahı sorğusu < 200 ms (yük testi).

## F19 — Hash-zəncirli audit loqu `S`
**Asılılıq:** F18

- [ ] F19.1 `audit_log` append-only (UPDATE/DELETE DB səviyyəsində qadağan); hər qeyd `prev_hash` daşıyır
- [ ] F19.2 Yazılan hadisələr: admin girişi, siyasət dəyişikliyi, insident statusu, fövqəladə rejim, cihaz ləğvi, eksport
- [ ] F19.3 Zəncirin yoxlanması: API + CLI `cipher-server audit verify`
- [ ] F19.4 Eksport (JSON Lines + imza) — auditor üçün; GRC360 üçün sübut
- [ ] F19.5 Audit qeydlərində məzmun yoxdur (safeai `audit.py` prinsipi)

**Hazırdır əgər:** DB-də bir qeyd əl ilə dəyişdiriləndə `verify` səhv yeri göstərir.

## F20 — Agent parkı və heartbeat `S`
**Asılılıq:** F16

- [ ] F20.1 `POST /v1/heartbeat`: versiya, qayda paketi versiyası, komponentlərin vəziyyəti (servis, user agent, extension), növbə uzunluğu
- [ ] F20.2 Status hesablanması: healthy / degraded (komponent çatışmır, köhnə paket) / offline (N dəq heartbeat yox) / tamper (F37 siqnalları) / pending (qeydiyyat tamamlanmayıb)
- [ ] F20.3 Status dəyişikliyi → hadisə (tamper → critical insident)
- [ ] F20.4 Versiya inventarı (konsoldakı "1 284 / 1 307 online" üçün)

**Hazırdır əgər:** heartbeat dayananda cihaz konfiqurasiya olunan müddətdən sonra offline olur.

## F21 — Karantin, təsdiq, monitorinq və fövqəladə rejimlər `M`
**Asılılıq:** F18, F09

- [ ] F21.1 Quarantine: agent göndərməni saxlayır → server "gözləyən təsdiq" yaradır → admin təsdiq/rədd edir → agentə push (long-poll / WebSocket)
- [ ] F21.2 Təsdiq üçün timeout (default rədd); orta gözləmə müddəti metriki ("orta gözləmə 4 dəq")
- [ ] F21.3 Monitorinq rejimi: tenant/siyasət üzrə başlanğıc tarixi, qalan gün, vaxtından əvvəl bitirmə
- [ ] F21.4 Fövqəladə rejim: başlat (səbəb + müddət), qalan vaxt, "Dərhal bitir"; hamısı audit loquna
- [ ] F21.5 Rejimlər qayda paketinə daxil edilir (agent offline olsa da düzgün işləsin)

**Hazırdır əgər:** e2e test: quarantine → konsolda təsdiq → agent göndərir.

## F22 — Bildirişlər və inteqrasiyalar `M`
**Asılılıq:** F18

- [ ] F22.1 Email (SMTP) — severity və SLA üzrə qaydalar
- [ ] F22.2 Webhook (HMAC imzalı, təkrar cəhd, ölü məktub növbəsi)
- [ ] F22.3 SIEM: syslog / CEF, Splunk HEC, Microsoft Sentinel formatı
- [ ] F22.4 **GRC360 inteqrasiyası**: insident → GRC360 Operations Center, siyasət statusu → Controls sübutu
- [ ] F22.5 Telegram / Slack / Teams (ixtiyari)

**Hazırdır əgər:** webhook imzası test edilir; GRC360-a test insidenti düşür.

---

# C. Admin konsol

## F23 — UI paketi: Figma dizayn sistemi `L`
**Məqsəd:** Figma "cipher — Dizayn Sistemi"-nin React komponentləri.
**Asılılıq:** F01

- [ ] F23.1 Tokenlər → CSS dəyişənləri + Tailwind theme: brend 50–900, neytral 0–1000, severity, hərəkət, agent statusu, modul rəngləri; tünd tema əsas, açıq tema
- [ ] F23.2 Tipoqrafiya: Inter + JetBrains Mono, display/h1/h2/h3/bodyLg/body/bodyMed/small/smallMed/caption/overline/mono/monoSm
- [ ] F23.3 Spacing (4 px şəbəkə), radius xs–full, elevation sm/md/lg
- [ ] F23.4 Komponentlər: Button (Primary/Secondary/Ghost/Danger/Success × Md/Sm × Default/Hover/Pressed/Focus/Disabled/Loading), Badge/Severity, Badge/PolicyAction, StatusDot, Input, Toggle, Checkbox, Select, Tab, Avatar, NavItem
- [ ] F23.5 Banner, Toast, Stepper, EmptyState, Tooltip, Skeleton, ProgressBar, Breadcrumb, Card, KPI Tile, Table (44 px sətir, severity solda), TableRow/Incident (default/hover/selected)
- [ ] F23.6 19 ikon (check, close, dot, warning, info, arrow, chevron, caret, search, lock, shield, device, policy, audit, user, key, file, bell, filter)
- [ ] F23.7 Storybook (və ya Ladle); hər komponent Figma screenshot-u ilə vizual müqayisə
- [ ] F23.8 A11y: fokus halqası, kontrast (WCAG AA), klaviatura; rəng yeganə siqnal deyil (Figma qaydası: ton + nişan + mətn)
- [ ] F23.9 i18n infrastrukturu (az/en/ru)

**Hazırdır əgər:** bütün Figma komponentləri Storybook-da var; a11y testləri (axe) keçir.

## F24 — Konsol skeleti və giriş `M`
**Asılılıq:** F23, F15

- [ ] F24.1 Vite + React + TS, router, layout (sol naviqasiya: Panel, İnsidentlər, Siyasətlər, Agentlər, İstifadəçilər, Audit, Parametrlər)
- [ ] F24.2 OpenAPI-dən generasiya olunmuş API client, sorğu keşi (TanStack Query)
- [ ] F24.3 Login, 2FA, çıxış, sessiya bitməsi
- [ ] F24.4 Rol əsaslı menyu/düymələr
- [ ] F24.5 Xəta və boş vəziyyətlər (EmptyState), yüklənmə (Skeleton)

**Hazırdır əgər:** Playwright e2e: login → panel → logout.

## F25 — Panel (dashboard) `M`
**Asılılıq:** F24, F18, F20

- [ ] F25.1 KPI-lar: Kritik insident (+dünənə görə), Gözləyən təsdiq (orta gözləmə), Agent sağlamlığı (% və online/ümumi), FP nisbəti (hədəf ≤ 0.5%)
- [ ] F25.2 "Kanal üzrə tutma" qrafiki (brz / agt / gw / fayl / aud)
- [ ] F25.3 "Agent parkı" kartı (sağlam / degrade / offline + meter)
- [ ] F25.4 Bannerlər: monitorinq rejimi (X/14 gün), FP artımı (qayda üzrə), fövqəladə rejim (qalan vaxt + "Dərhal bitir")
- [ ] F25.5 Son insidentlər cədvəli; vaxt aralığı filtri
- [ ] F25.6 Panel sorğuları üçün server tərəfində aqreqasiya endpoint-ləri

**Hazırdır əgər:** panel Figma "Data" bölməsinə vizual uyğundur; 10k insidentlə < 1 s yüklənir.

## F26 — İnsidentlər `M`
**Asılılıq:** F25

- [ ] F26.1 Siyahı: AĞIRLIQ · HADİSƏ · İŞÇİ · QAYDA · KANAL · VAXT; filtrlər (severity, kanal, siyasət, status, istifadəçi, tarix), EVT ID ilə axtarış
- [ ] F26.2 Detal səhifəsi: maskalanmış fraqment, qərarın izi (`explain`), istifadəçi, cihaz, destination, istifadəçinin səbəbi, zaman xətti
- [ ] F26.3 Hərəkətlər: qəbul et, həll et, **FP kimi işarələ** (qaydaya statistik geri bildiriş), təyin et, şərh
- [ ] F26.4 Toplu əməliyyatlar, CSV eksport (yalnız maskalanmış data)
- [ ] F26.5 SLA göstəricisi (qalan vaxt / pozulub)

**Hazırdır əgər:** e2e: insident yarat → siyahıda gör → FP işarələ → panelin FP nisbəti dəyişir.

> **Qeyd:** bu sənəd hələ tamamlanmayıb — F27–F48 yazılmayıb.
