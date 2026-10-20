# cipher — sıfırdan yazmaq üçün araşdırma və ilkin plan

> Status: araşdırma / qaralama. Heç bir kod yazılmayıb. Qərar verilməli suallar sonda var.
> Mənbələr: Figma "cipher — Dizayn Sistemi" (səhifələr `01 Bünövrə`, `02 Komponentlər`),
> `rasulinho08/safeai` (əvvəlki prototip), Strativuco təşkilatının repoları (bax §2.3 — cipher kodu orada yoxdur).

---

## 1. cipher nədir (Figma-dan çıxan məhsul təsviri)

Figma faylı yalnız dizayn sistemidir (rəng, tipoqrafiya, komponentlər) — ekran dizaynları hələ yoxdur.
Amma komponentlərin adları və nümunə dataları məhsulu aydın təsvir edir:

**cipher = Enterprise AI Security / AI-DLP.** İşçilərin AI alətlərinə (ChatGPT, Claude, Gemini, Copilot…)
həssas məlumat ötürməsinin qarşısını alan, işçinin kompüterində (OS user səviyyəsində) işləyən agent + mərkəzi konsol.

| Figma-da nə var | Mənası |
| --- | --- |
| **Kanallar**: `brz`, `agt`, `gw`, `fayl`, `aud` ("Kanal üzrə tutma" qrafiki) | Brauzer (extension), Agent (clipboard / desktop AI app-lar), Gateway (API proxy), Fayl (upload/skan), Audit |
| **Siyasət hərəkəti**: `allow`, `review` (14 günlük rejim), `mask`, `block` (fail closed), `quarantine` (ML ≥ 85%), `coach`, `read_only` | Qayda tutanda nə edilir |
| **İnsident ağırlığı**: critical (SLA 15 dəq), high (1 saat), medium (8 saat), low (24 saat), info (SLA yox) | İnsident severity + SLA |
| **Agent statusu**: healthy, degraded, offline, tamper (şübhəsi), pending | Endpoint agent parkı, tamper aşkarlama |
| **Modullar**: `guard` (Qoruma), `insight` (Müşahidə + DPIA), `archive` (ayrıca lisenziya) | Lisenziyalanan modullar |
| KPI-lar: Kritik insident, Gözləyən təsdiq (orta gözləmə 4 dəq), Agent sağlamlığı 98.2% (1 284 / 1 307 online), **FP nisbəti 0.4% (hədəf ≤ 0.5%)** | Konsolun ana səhifəsi |
| Bannerlər: "Monitorinq rejimi aktivdir — 9/14 gün, bütün siyasətlər REVIEW rejimində", "Yalançı həyəcan nisbəti artıb — P-07 qaydası 7 gündə 34 dəfə FP", "Fövqəladə rejim aktivdir — DLP bloklamaları WARN-a keçirilib" | İş axınları: monitorinq rejimi, FP izləmə, fövqəladə rejim |
| Cədvəl: `AĞIRLIQ · HADİSƏ (EVT-2026-09-06-8842) · İŞÇİ · QAYDA (Sirlərin Qorunması P-07, Müştəri Məlumatları P-03, Mənbə Kodu P-11) · KANAL · VAXT` | İnsident siyahısı; qaydalar `P-NN` ID-li siyasətlərdir |

**Dizayn tokenləri** (konsol və tray UI üçün birbaşa götürülə bilər):
- Brend (indigo): 50 `#EEF0FE` … 500 `#5A5AF0` … 900 `#1F1F5E`; neytral 0 `#FFFFFF` … 950 `#0E131A`, 1000 `#080B10`.
- Severity: critical `#F0384A`, high `#FF6B35`, medium `#F5A524`, low `#3B82F6`, info `#8B95A8`.
- Hərəkət: allow `#12B76A`, review `#F5A524`, mask `#3B82F6`, block `#F0384A`, quarantine `#B42318`, coach `#7A7BF3`, read_only `#8B95A8`.
- Modul: guard `#22D3EE`, insight `#A855F7`, archive `#F5A524`.
- Şrift: Inter (UI) + JetBrains Mono (ID-lər, hash-lər). Ölçülər display 32/40 … monoSm 12/16.
- 4 px baza şəbəkəsi, cədvəl sətri 44 px, radius xs…full, tünd tema əsasdır.
- Komponentlər: Button (Primary/Secondary/Ghost/Danger/Success × Md/Sm × 6 state), Badge/Severity, Badge/Policy Action, Status Dot, Input, Toggle, Checkbox, Select, Tab, Avatar, Nav Item, Banner, Toast, Stepper, Empty State, Tooltip, Table Row/Incident, KPI Tile, Card, Skeleton, Progress Bar, Breadcrumb, 19 ikon.

### ML ilə bağlı olanlar — tələbə görə atılır (skip)

"LLM train olunmayacaq, hər şey regex-lə" tələbinə görə:
- `quarantine — ML ≥ 85%` → **ML hissəsi atılır.** Karantin saxlanılır, amma tetikleyici *qayda balı* olur
  (məs. "≥ 2 kritik qayda eyni mətndə" və ya "EDM uyğunluğu"). Lazım deyilsə v1-də karantin ümumiyyətlə olmaya bilər.
- safeai-dakı "Presidio + spaCy NER sonra əlavə olunacaq" planı → **atılır.**
- Heç bir model faylı, embedding, LLM-classification çağırışı olmayacaq. Detektorlar tam deterministikdir:
  eyni giriş → eyni nəticə, bu da audit və test üçün böyük üstünlükdür.

---

## 2. Mövcud kod nə deyir

### 2.1 `rasulinho08/strativu` (bu repo)
Yalnız Strativu marketinq saytıdır (React 18 + Vite + Tailwind v4). cipher kodu burada yoxdur.

### 2.2 `rasulinho08/safeai` — əvvəlki prototip (ən faydalı mənbə)
"Human-in-the-loop AI Gateway + DLP". **Server tərəfli web app-dır, OS agenti deyil.**

- Stack: Python FastAPI (`backend/`, ~4 700 sətir) + React/Vite (`src/`). ML asılılığı **yoxdur**
  (`requirements.txt`: fastapi, pydantic, python-docx, openpyxl, httpx).
- Axın: sənəd/mətn → skan → insan təsdiqi → tokenləşdirmə (`[PERSON_1]`) → yalnız tokenli mətn OpenAI/Anthropic/Gemini-yə →
  cavabda token bütövlüyü yoxlanışı → lokal rehidrasiya.
- **Götürüləcək dəyərli hissələr:**
  - `services/dlp/detectors.py` — Azərbaycana uyğunlaşdırılmış regex detektorları: email, telefon (+994, 050/051/055/070/077/099/010, şəhər 012/018/02x),
    IBAN (`AZ\d{2}…`, 4-lük qruplarla), kart (Luhn), FİN kodu (kontekstli `FIN: XXXXXXX` və tək hüceyrə), VÖEN/TIN (kontekstli, 10 rəqəm),
    pasport (`AZE########`, `AA#######`), doğum tarixi (kontekstli), məbləğ + valyuta (AZN/₼/USD/manat…), IP, şirkət adı (MMC/ASC/QSC… suffiksi),
    şəxs adı evristikası (ata adı `oğlu/qızı`, `-ov/-ova/-zadə` soyadları, `Cənab/Xanım`, ad siyahısı, küçə adı istisnası).
  - `services/dlp/custom_terms.py` — "şirkət lüğəti": istifadəçi regex yazmır (ReDoS riski yoxdur), `#` = rəqəm, `@` = hərf
    (`MQ-####-####`), Azərbaycan dili şəkilçiləri (`Orion` → `Orionun`), transliterasiya (ə→e, ş→s).
  - `services/dlp/engine.py` — overlap həlli (ən yüksək confidence, bərabərdə uzun olan qalır).
  - `services/ai_gateway/proxy_guard.py` — **fail-closed** çıxış yoxlaması: göndərilən mətndə orijinal dəyər qalıbsa sorğu bloklanır; SHA-256 sübut qeydləri.
  - `services/tokenization/*`, `services/rehydration/integrity.py` — deterministik tokenlər və təhlükəsiz rehidrasiya (yalnız format düzəlişi, "təxmin" yoxdur).
  - `core/audit.py` — audit loqunda dəyər/məzmun saxlanılmır (yalnız metadata).
  - 88 test (`backend/tests/`), o cümlədən "orijinal dəyər heç vaxt çölə çıxmır" kritik testi → yeni engine üçün test korpusu kimi istifadə olunacaq.
- **Zəif yerlər (yenidə düzəldilməli):**
  - `ID_NUMBER = \b\d{7,12}\b` (confidence 0.5) və "iki böyük hərflə başlayan söz = şəxs" evristikası çox FP verir.
    Figma hədəfi FP ≤ 0.5% olduğu üçün bunlar yalnız `review`/`coach` səviyyəsində qala bilər, `block` üçün yox.
  - Hər şey server yaddaşındadır; endpoint, brauzer, siyasət, insident, agent anlayışları yoxdur.
  - Python OS agenti üçün uyğun deyil (paketləmə, ölçü, servis kimi işləmə, imza).

### 2.3 Strativuco təşkilatı — cipher kodu tapılmadı
Təşkilatdakı hər üç repo yoxlanıldı, heç birində cipher / DLP / agent kodu yoxdur:

| Repo | Nədir | cipher ilə əlaqə |
| --- | --- | --- |
| `Strativuco/strativu` | Strativu marketinq saytı (React + Vite), 1 commit, 67 fayl | Yoxdur. Yalnız brend faylları (`public/brand/*`) və `theme.css` |
| `Strativuco/GRC_Backend_Code` | GRC360 backend — Java 21, Spring Boot 3.2, PostgreSQL, multi-tenant | Kod yoxdur. "tamper" sözü yalnız JWT təhlükəsizlik testlərindədir |
| `Strativuco/GRC_Frontend_Code` | GRC360 frontend — Next.js 16, React 19 | Kod yoxdur |

**Nəticə:** cipher-in yeganə real sələfi `rasulinho08/safeai`-dır. Ondan başqa hər şey sıfırdan yazılır.
GRC360 isə gələcəkdə **inteqrasiya nöqtəsidir**: cipher insidentləri webhook ilə GRC360-ın "Operations Center → İnsidentlər" bölməsinə,
cipher siyasətləri isə "Controls" bölməsinə sübut (evidence) kimi göndərilə bilər.

---

## 3. Hansı dildə yazılmalı — tövsiyə

**Tövsiyə: nüvə (detektor mühərriki + agent + gateway) — Rust; bütün UI-lar — TypeScript/React.**

| Hissə | Dil / alət | Niyə |
| --- | --- | --- |
| Detektor mühərriki (`cipher-engine`) | **Rust** (`regex`, `aho-corasick`) | Bir kod bazası **üç yerdə** işləyir: native agent, server/gateway və **WASM** kimi brauzer extension-un içində. Qaydalar hər kanalda eyni nəticə verir. `regex` crate xətti zamanlıdır → ReDoS mümkün deyil (DLP-də hər mətn hücumçu girişidir). |
| Endpoint agent (`cipher-agent`) | **Rust** | Tək statik binary (5–15 MB), GC yoxdur, CPU/RAM az, Windows service / launchd / systemd üçün yaxşı crate-lər (`windows`, `windows-service`, `objc2`), yaddaş təhlükəsizliyi (agent hər prosesin mətnini görür — C/C++ riskli). |
| İstifadəçi UI (tray, coach dialoqu, bildiriş) | **Tauri v2** (Rust + webview, React) | Electron-dan 10× kiçik; Figma komponentlərini React-da bir dəfə yazıb həm tray-də, həm konsolda istifadə etmək olur. |
| Brauzer extension | **TypeScript**, Manifest V3, engine `.wasm` | Chrome/Edge/Brave eyni kod; Firefox kiçik fərqlə. |
| Admin konsol | **React + Vite + TypeScript** | Komandanın artıq bildiyi stack (strativu saytı, safeai, hack-os). |
| Control-plane server | **Rust (axum) + PostgreSQL** (alternativlər: Java/Spring, TypeScript/Node) | Engine, siyasət tipləri və protokol crate-ləri ilə paylaşılır; on-prem tək binary kimi verilir. GRC360 komandası Java/Spring bildiyi üçün server Spring Boot-da da yazıla bilər. Engine ayrı olduğu üçün bu qərar sonra da dəyişdirilə bilər. |

**Alternativlər və niyə yox:**
- **Go** — agent üçün yaxşıdır (sadə, cross-compile), amma brauzerdə WASM ölçüsü böyükdür (TinyGo məhdud), Tauri kimi yüngül UI yoxdur → engine iki dəfə yazılmalı olardı.
- **C# / .NET** — Windows üçün əla, macOS/Linux və brauzer üçün zəif.
- **Python** (safeai kimi) — endpoint-də paylanması, imzalanması, servis kimi işləməsi çətindir.
- **C/C++** — yaddaş təhlükəsizliyi riski; təhlükəsizlik məhsulu üçün yaxşı seçim deyil.

**Diqqət — Rust `regex` lookaround dəstəkləmir.** safeai-dakı `(?<!\d)`, `(?!\d)` kimi pattern-lər birbaşa köçmür.
Həll: pattern-i lookaround-suz yazmaq + match-dən sonra kənar simvolları yoxlayan kiçik "boundary validator" funksiyası.
`fancy-regex` (backtracking) istifadə **etməmək** — ReDoS riskini geri gətirir.

---

## 4. Arxitektura

```
                        ┌───────────────────────────── cipher-server (control plane) ──┐
                        │  enrollment · siyasət paylanması · insident qəbulu · audit    │
                        │  PostgreSQL · hash-chained audit log · EDM hash anbarı        │
                        └───────▲───────────────────────▲─────────────────▲────────────┘
                     mTLS/HTTPS │ siyasət ↓, insident ↑ │                 │ HTTPS
┌──────────── işçinin kompüteri ┴───────────────────────┼───────┐   ┌─────┴──────────┐
│                                                       │       │   │ admin konsol   │
│  cipher-service (SYSTEM/root)  ◀─ named pipe / UDS ─▶ cipher-user (hər istifadəçi sessiyası) │ React, Figma DS│
│   • serverlə əlaqə, offline növbə (SQLite)            • clipboard monitor     │   └────────────────┘
│   • siyasət keşi, engine (native)                     • aktiv pəncərə / AI app aşkarı     
│   • watchdog, tamper, heartbeat                       • Tauri tray: coach / block dialoqu │
│   • fayl skanı (insight)                              • native-messaging host ◀──┐        │
│                                                                                  │        │
│  Brauzer extension (MV3, policy ilə məcburi quraşdırılır) ──────────────────────┘        │
│   • AI saytlarında paste / drop / submit / file-upload tutur                              │
│   • engine.wasm ilə lokal skan → mask / block / coach                                     │
└───────────────────────────────────────────────────────────────────────────────────────────┘

cipher-gateway (ixtiyari, server tərəfində): OpenAI/Anthropic-uyğun API proxy — tərtibatçıların API trafiki üçün,
safeai-dakı tokenləşdirmə + rehidrasiya + fail-closed guard burada yaşayır.
```

**Niyə iki agent prosesi:** Windows-da servis "session 0"-da işləyir və istifadəçinin clipboard-unu, pəncərələrini görə bilmir,
UI göstərə bilmir. Ona görə: imtiyazlı `cipher-service` (silinməyə/dayandırılmağa qarşı) + hər istifadəçi sessiyasında
`cipher-user` (clipboard, UI, extension ilə əlaqə). macOS-da eyni bölgü LaunchDaemon + LaunchAgent-dir.

**Kernel driver yoxdur (v1).** "OS user-dən işləyən" = user-mode. Windows minifilter, macOS Endpoint Security / Network Extension,
Linux eBPF — imza/notarizasiya/sertifikasiya tələb edir, aylarla iş deməkdir; v2-yə saxlanılır.
TLS-i ələ keçirən (MITM) lokal proxy da v1-də yoxdur — həm kövrəkdir, həm məxfilik baxımından ağırdır.

### 4.1 Kanallar necə işləyir (OS səviyyəsində)

| Kanal (Figma) | Necə | Windows | macOS | Linux |
| --- | --- | --- | --- | --- |
| **brz** — brauzer | MV3 extension; AI domenlərində `paste`, `drop`, `beforeinput`, Enter/submit, `<input type=file>` hadisələri; `chrome.runtime.connectNative` ilə agentə | GPO `ExtensionInstallForcelist` | MDM profili | policy JSON |
| **agt** — clipboard / desktop app | Ön planda AI app-ı (ChatGPT/Claude desktop, Copilot) varsa clipboard məzmununu skan et; bloklananda clipboard-u təmizlə / maskalanmış versiya ilə əvəz et | `AddClipboardFormatListener`, `GetForegroundWindow` | `NSPasteboard.changeCount` sorğusu (bildiriş API-si yoxdur), `NSWorkspace` | X11 `XFixes`; Wayland-da məhduddur |
| **gw** — gateway | API proxy (safeai məntiqi) + şirkət şəbəkəsində icazəsiz AI domenlərinin DNS/PAC ilə bloklanması | — | — | — |
| **fayl** | Extension-da upload olunan faylın skanı (docx/xlsx/csv/txt/pdf mətni); `insight` üçün seçilmiş qovluqların fon skanı | `notify` crate | `notify` (FSEvents) | `notify` (inotify) |
| **aud** — audit | Hər hadisə hash-chained loga; dəyər saxlanılmır, yalnız maskalanmış fraqment + hash | | | |

### 4.2 Detektor mühərriki — ML olmadan

Hər qayda deklarativ fayldır (`rules/*.toml`), kodda deyil. Qayda paketi serverdən imzalı gəlir.

1. **Regex + validator**: pattern tutur, sonra yoxlama funksiyası təsdiqləyir — Luhn (kart), IBAN mod-97, FİN formatı (7 simvol, hərf+rəqəm),
   telefon prefiksləri, tarix etibarlılığı. Validatorlar FP-ni kəskin azaldır.
2. **Kontekst (yaxınlıq)**: `FIN`, `VÖEN`, `doğum tarixi`, `şifrə`, `password` kimi açar sözlərin N simvolluq pəncərəsində olan dəyər (safeai `ContextValueDetector`).
3. **Lüğətlər (Aho-Corasick)**: şirkət lüğəti, layihə kod adları, müştəri adları — minlərlə termin xətti zamanda; şəkilçi və transliterasiya dəstəyi.
4. **Sirlər (secrets)**: gitleaks tipli qaydalar — AWS `AKIA…`, GitHub `ghp_…`, Slack `xox[bp]-…`, `-----BEGIN … PRIVATE KEY-----`, JWT, connection string-lər + Shannon entropiya həddi.
5. **Mənbə kodu (P-11)**: sintaksis sıxlığı balı (`{ } ; => ::`, `def/class/import/function/public static` açar sözləri, girinti nisbəti). Model deyil — sadə hesablanmış bal.
6. **EDM (Exact Data Match)**: admin müştəri bazasını (CSV) yükləyir → server dəyərləri normallaşdırıb **duzlu HMAC** edir → agentə yalnız hash-lər (bloom filter) gedir →
   agent mətndəki namizəd tokenləri hash-ləyib yoxlayır. Endpoint-də heç vaxt xam məlumat olmur. "P-03 Müştəri məlumatları" üçün ən dəqiq üsul.
7. **Sənəd barmaq izi**: məxfi sənədlərin shingle/winnowing hash-ləri → mətnin bir hissəsi kopyalananda tutulur (yenə model yox, sadəcə hash).
8. **Fayl tipi**: uzantı yox, magic bytes (`infer` crate); docx/xlsx = zip + XML, mətn çıxarılır.

**Bal və qərar**: hər qaydanın `severity` və `weight`-i var; nəticə = ən yüksək severity + say hədləri
(məs. "1 kart nömrəsi → medium, ≥ 5 → critical"). Siyasət (`P-07`) = qaydalar + kanal + istifadəçi qrupu + hərəkət.

### 4.3 Siyasət hərəkətləri (Figma) — semantika

| Hərəkət | Davranış |
| --- | --- |
| `allow` | Burax, yalnız statistika |
| `review` | Burax + insident yaz. **Yeni quraşdırmada bütün siyasətlər 14 gün bu rejimdə** (banner "Monitorinq rejimi 9/14 gün") — FP-ləri bloklamadan əvvəl görmək üçün |
| `coach` | İstifadəçiyə xəbərdarlıq dialoqu: "Bu mətn müştəri məlumatı ehtiva edir" → səbəb yazıb davam edə bilər |
| `mask` | Tapılan dəyərlər `[CARD_1]` kimi tokenlərlə əvəz olunur, mətn göndərilir |
| `block` | Göndərmə dayandırılır. **Fail closed**: agent/engine cavab vermirsə də bloklanır |
| `quarantine` | Göndərmə saxlanılır, admin təsdiqi gözlənilir (KPI "Gözləyən təsdiq"). Tetikleyici ML yox, qayda balıdır |
| `read_only` | AI saytı açılır, amma paste/upload/yazı qadağandır |
| Fövqəladə rejim | Admin müvəqqəti olaraq bütün `block`-ları `coach/review`-a endirir (banner "3 saat 12 dəq qalıb") |

### 4.4 Məxfilik və təhlükəsizlik prinsipləri
- Serverə **heç vaxt xam həssas dəyər getmir**: yalnız qayda ID, say, maskalanmış fraqment (`4169 **** **** 1234`), dəyərin duzlu hash-i.
- Audit log hash-zəncirlidir (hər qeyd əvvəlkinin hash-ini daşıyır) — strativu saytında vəd edilən yanaşma.
- Agent ↔ server: mTLS, cihaz sertifikatı enrollment zamanı verilir; qayda paketləri imzalıdır (ed25519).
- Tamper: servis dayandırılması, binary dəyişməsi, extension silinməsi, heartbeat itkisi → `tamper` statusu + insident.
- Binary-lər imzalı: Windows Authenticode, macOS Developer ID + notarization.

---

## 5. Repo strukturu (təklif — yeni ayrıca repo)

```
cipher/
├─ crates/
│  ├─ cipher-engine/      # detektorlar, validatorlar, lüğət, EDM, bal — I/O yoxdur; native + wasm32
│  ├─ cipher-rules/       # qayda formatı (TOML) parser + imza yoxlaması
│  ├─ cipher-policy/      # siyasət modeli, qiymətləndirmə → hərəkət
│  ├─ cipher-proto/       # agent ↔ server mesaj tipləri (serde / JSON)
│  ├─ cipher-service/     # imzalı servis: server əlaqəsi, SQLite növbə, watchdog
│  ├─ cipher-user/        # sessiya agenti: clipboard, ön plan app, native-messaging host
│  ├─ cipher-gateway/     # API proxy (safeai-dan port)
│  └─ cipher-server/      # axum + Postgres control plane
├─ apps/
│  ├─ tray/               # Tauri v2
│  ├─ extension/          # MV3, TS + engine.wasm
│  └─ console/            # React + Vite admin konsol
├─ packages/ui/           # Figma dizayn sistemi React komponentləri (tray + konsol paylaşır)
├─ rules/                 # qayda paketləri + hər qayda üçün müsbət/mənfi test nümunələri
└─ corpus/                # FP ölçmək üçün real-bənzər mətnlər (safeai testlərindən başlanır)
```

Hər qaydanın yanında `should_match` / `should_not_match` nümunələri olur; CI-də FP nisbəti ölçülür (hədəf ≤ 0.5%).

---

## 6. Mərhələlər

| Faza | Məzmun | Nəticə |
| --- | --- | --- |
| **0 — Bünövrə** | Repo, CI, `cipher-engine` (safeai detektorlarının Rust portu + lookaround-suz pattern-lər), qayda formatı, test korpusu, `packages/ui` (Figma tokenləri) | `cargo test` + FP hesabatı |
| **1 — MVP (monitorinq)** | Brauzer extension (engine.wasm), minimal server (enrollment, siyasət, insident), konsol: insident siyahısı, siyasətlər, KPI-lar. Yalnız `review` + `coach` | Pilot müştəridə 14 günlük monitorinq |
| **2 — Windows agent + enforcement** | `cipher-service` + `cipher-user`, clipboard, desktop AI app aşkarı, native messaging, tray, tamper/heartbeat; `block`, `mask`, `read_only`, fövqəladə rejim | Real qoruma (guard modulu) |
| **3 — Genişlənmə** | Gateway (safeai portu), fayl kanalı, EDM, sənəd barmaq izi, macOS agent, quarantine axını | |
| **4 — insight / archive** | DPIA hesabatları, AI istifadə xəritəsi, arxiv (ayrıca lisenziya), Linux | |

Brauzer-dən başlamağın səbəbi: işçilərin AI istifadəsinin böyük hissəsi brauzerdədir, extension hər OS-da eyni işləyir
və imzalı native agent hazır olmamışdan məhsul dəyər verir.

---

## 7. Risklər

- **AI saytlarının DOM-u tez-tez dəyişir** → sayt üzrə adapterlər + ümumi (paste/drop/contenteditable) tutucular; adapter testləri Playwright ilə.
- **macOS clipboard məxfiliyi** — yeni macOS versiyalarında proqramlı pasteboard oxunması istifadəçiyə xəbərdarlıq göstərə bilər; MDM ilə icazə tələb oluna bilər (yoxlanılmalı).
- **Wayland** clipboard girişini məhdudlaşdırır → Linux sonuncu prioritetdir.
- **FP** — ML olmadan dəqiqlik validatorlar, kontekst və EDM hesabına əldə olunur; zəif evristikalar (`\d{7,12}`, Title-Case ad) heç vaxt `block` etməməlidir.
- **Rust öyrənmə əyrisi** — komanda əsasən TS/Python yazır. Azaltma: engine kiçik və test-yönümlüdür; server lazım olsa TS-də yazıla bilər.

---

## 8. Qərar verilməli suallar

1. **Prioritet OS**: Windows birinci? (AZ bank/korporativ müştərilər üçün ehtimal ki, bəli.)
2. **Yerləşdirmə**: SaaS, on-prem, yoxsa hər ikisi? (Banklar on-prem istəyəcək → server tək binary + Postgres.)
3. **Server dili**: Rust (paylaşılan crate-lər), Java/Spring (GRC360 komandası ilə eyni) və ya TypeScript?
4. **`quarantine` v1-də lazımdırmı**, yoxsa ML olmadığı üçün sonraya qalır?
5. Hansı AI alətləri v1-də dəstəklənir (ChatGPT, Claude, Gemini, Copilot, DeepSeek…)?
6. cipher GRC360 ilə inteqrasiya olunacaqmı (insident → GRC İnsidentlər, siyasət → Controls sübutu)?
7. Kod üçün yeni repo: `Strativuco/cipher`?
