# AlloSafe
## Voice-First Business Assistant for Nigeria's Informal Economy

**3MTT Knowledge Showcase 2.0 — AI for Local Impact**

---

## 1. EXECUTIVE SUMMARY

AlloSafe is a voice-first business assistant that lets market traders, tailors, food vendors, bike riders, artisans, and farmers log their business activity by speaking naturally in **English, Pidgin, Yoruba, Hausa, or Igbo** — over a phone call. No smartphone, no literacy, and no internet connection are required to start.

The system produces a structured financial ledger that did not previously exist. The same data populates a web dashboard where users can view, edit, and export their business records — inventory, debts, sales, expenses — and build a verifiable financial identity for cooperative loans and savings decisions.

The product is built on three failsafe layers so that imperfect speech recognition never breaks the user's trust: confidence-weighted processing, contextual correction using a language model that knows the user's history, and graceful fallback to text input on the web when the system is unsure. Every layer is demonstrable using free-tier or sandbox infrastructure, so the full pipeline can be built and shown working without production telecom costs.

**Tagline:** *"Track Your Business. Unlock Opportunities."*
**Brand Promise:** *"Your Business, Fully Protected."*

---

## 2. PROBLEM AND SOLUTION

### 2.1 The Problem

Nigeria's informal economy employs over 80% of the workforce. Traders, artisans, and service providers handle cash daily but keep no structured records of income, expenses, inventory, or debt. This is not because they lack financial activity — it is because existing tools assume:

- A smartphone
- Literacy
- Comfort with banking apps
- Stable internet
- Accounting knowledge

None of these assumptions hold for the average market trader in Lagos, Kano, Onitsha, or Aba. The result is a $200 billion+ economy running entirely from memory and paper notebooks. This locks millions out of loans, cooperative savings schemes, and any measurable business history.

### 2.2 The Solution

AlloSafe removes every one of those assumptions.

- **Onboarding:** A new user dials a phone number, selects their language via DTMF (keypad press), and speaks their name and business type. An account is created instantly. No app download required.
- **Daily logging:** The user calls the same number and speaks a transaction naturally: *"I sold 5 yards of ankara to Mama Ngozi for fifteen thousand naira."* The system transcribes, extracts structured data, and confirms via DTMF during the call.
- **Visibility:** The same data appears in a structured PWA where the user (or a trusted agent) can view inventory, track debts, see financial summaries, and export a credit report.

**Voice removes the barrier. The web creates the value.**

---

## 3. SYSTEM ARCHITECTURE

### 3.1 Layer Overview

| Layer | Responsibility | Technology |
|-------|---------------|------------|
| **Voice Layer** | Inbound calls, DTMF menus, audio recording, TTS responses | Africa's Talking Voice API (sandbox) |
| **PWA Layer** | Structured dashboard, voice + text input, offline scaffold | React PWA on Netlify |
| **Integration Layer** | Webhooks from Africa's Talking, API for PWA | FastAPI on Render |
| **AI Layer** | ASR transcription, confidence scoring, LLM entity extraction, TTS | SBPN/N-ATLaS/Whisper, GPT-4o, Azure Edge-TTS/YarnGPT |
| **Data Layer** | Auth, database, file storage, real-time sync | Appwrite Cloud |

### 3.2 Request Flow (Voice)

1. User dials AlloSafe number from any phone.
2. Africa's Talking forwards the call event to FastAPI webhook.
3. If new user: language DTMF menu → name capture → business type → PIN generation → account creation.
4. If existing user: "Describe your transaction" → record audio → ASR transcription.
5. Confidence router decides: auto-process (>90%), DTMF confirm (60-90%), or retry (<60%).
6. LLM extracts structured entities: `{type, item, quantity, unit, amount, person}`.
7. Data written to Appwrite: `transactions`, `inventory`, `contacts` updated.
8. TTS confirmation spoken during call. No SMS required.

### 3.3 Request Flow (PWA)

1. User opens PWA, logs in with phone + OTP.
2. Dashboard shows all voice-logged transactions in structured tables.
3. User can add transactions via:
   - **Voice:** Hold mic button → Web Audio → ASR API → preview card → confirm.
   - **Text:** Standard form fallback.
4. Edits sync to same database. Real-time updates via Appwrite subscriptions or polling.

---

## 4. TELEPHONY AND VOICE DESIGN

### 4.1 Provider

**Africa's Talking** — session-based voice gateway live on MTN, Airtel, Glo, and 9mobile in Nigeria. Development happens entirely in the free sandbox environment, which simulates voice calls and DTMF without telecom cost.

### 4.2 No-SMS Confirmation (DTMF-Only)

Since literacy is a barrier, SMS confirmation is eliminated. All confirmations happen during the call via keypad presses:

| DTMF | Meaning |
|------|---------|
| `1` | Confirm and save |
| `2` | Correct / re-speak |
| `3` | Cancel |

This requires no reading, no typing text, no sending SMS. Any ₦2,000 feature phone supports this.

### 4.3 Language-First Onboarding

The very first system prompt is a language menu. Everything after — name, business, instructions — happens in that language.

```
"Welcome to AlloSafe. Track Your Business. Unlock Opportunities.
 For English, press 1.
 Fun Yoruba, te si 2.
 Don Hausa, ka 3.
 Maka Igbo, pia 4.
 For Pidgin, press 5."
```

The language selection determines:
- ASR model routing
- TTS voice selection
- All PWA UI text

### 4.4 Voice Call Flow (Transaction)

```
System: "Describe your sale or expense. Speak clearly."
[User speaks: "I sold 5 bags of rice to Mama Ngozi for seventy thousand naira"]

System: [TTS readback] "I heard: Sale of 5 bags of rice for 70,000 naira.
         Press 1 to confirm. Press 2 to correct. Press 3 to cancel."

[User presses 1]

System: "Done. Your balance is 127,500 naira. Call again anytime."
```

---

## 5. BACKEND ARCHITECTURE (FastAPI on Render)

### 5.1 Service Design

A single FastAPI service exposes three groups of endpoints:

| Endpoint | Purpose |
|----------|---------|
| `POST /webhooks/voice/inbound` | Receives Africa's Talking call events, returns VoiceXML |
| `POST /webhooks/voice/dtmf` | Receives DTMF digit inputs, routes by call state |
| `POST /internal/transcribe` | Runs ASR on audio blob, returns transcript + confidence |
| `POST /internal/extract` | Runs LLM entity extraction with user context |
| `POST /internal/tts` | Generates TTS audio for spoken responses |
| `GET /api/users/me` | Returns user profile for PWA |
| `GET /api/transactions` | Returns transaction history |
| `POST /api/transactions` | Creates web/PWA transaction |
| `GET /api/inventory` | Returns stock levels |
| `GET /api/summaries` | Returns rolled-up financial identity |

### 5.2 Confidence Router

| Confidence | Action |
|------------|--------|
| Above 90% | Auto-process, log transaction, TTS brief confirmation |
| 60% to 90% | TTS readback + DTMF confirm before logging |
| Below 60% | TTS: "Please speak more clearly" → retry once → if still low, end call |

### 5.3 Environment Variables

```bash
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=xxx
APPWRITE_API_KEY=xxx
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=xxx
OPENAI_API_KEY=xxx
RENDER_EXTERNAL_URL=https://AlloSafe-api.onrender.com
```

---

## 6. DATA MODEL (Appwrite Cloud)

### 6.1 Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User profiles | phone, name, business_type, preferred_language, balance, pin_hash |
| `transactions` | All business activity | type, item, quantity, unit, amount, person, source, confidence, raw_transcript, status |
| `inventory` | Stock tracking | item_name, quantity, unit, reorder_threshold |
| `contacts` | Customers/suppliers | name, phone, role, outstanding_balance |
| `voice_sessions` | Call metadata | session_id, audio_url, language, transcript, confidence, dtmf_input, status |
| `summaries` | Weekly financial identity | week_start, total_income, total_expense, net_position, consistency_score |

### 6.2 Permissions

- User can read/write own documents.
- Backend service account can read/write all.
- No cooperative/multi-user access.

---

## 7. ASR AND LLM PIPELINE

### 7.1 Speech-to-Text

| Model | Role | Status |
|-------|------|--------|
| **SBPN** | Primary ASR for Nigerian languages | Benchmarked, 120M/600M variants |
| **N-ATLaS** | Secondary ASR (Yoruba/Hausa/Igbo/English) | Government-backed, 1,000 user cap |
| **Whisper API** | Fallback for 9-day build | Fastest setup, reliable |

**Recommended approach for 9 days:** Use Whisper API (`whisper-1`) for immediate functionality. Benchmark SBPN/N-ATLaS on recorded market audio and report WER honestly in submission. Note future fine-tuning with LoRA on Kaggle/Colab.

### 7.2 LLM Entity Extraction

**Model:** GPT-4o or Claude via API.

**Prompt template:**
```
You are AlloSafe, a business parser for Nigerian traders.
Given a voice transcript and user context, extract structured data.
Return ONLY valid JSON with keys: type, item, quantity, unit, amount, person.
Amount is always in Naira (integer).
Type must be one of: sale, expense, debt_given, debt_received.
If ambiguous, use context to infer. If completely unclear, set all values to null.
```

**User context injection:** Typical items, typical customers, typical price ranges from user's history.

### 7.3 Text-to-Speech

| Option | Use | Status |
|--------|-----|--------|
| **Azure Edge-TTS** | Primary TTS for English/Pidgin confirmations | Fast setup, natural voices |
| **YarnGPT** | Future TTS for Yoruba/Hausa/Igbo | Nigerian-accented, local |

For 9-day build: Use Azure Edge-TTS. Mention YarnGPT integration as post-showcase.

---

## 8. PWA FRONTEND (React on Netlify)

### 8.1 Design System

| Role | Hex |
|------|-----|
| Primary | `#3D3D3D` (charcoal) |
| Primary Hover | `#1A1A1A` |
| Background | `#F7F7F5` |
| Surface | `#FFFFFF` |
| Accent | `#D4880F` (ochre) |
| Voice Button Recording | `#2A2520` (warm espresso) |
| Text Primary | `#1A1A1A` |
| Text Secondary | `#737373` |
| Danger | `#DC2626` |

**No green anywhere.** No dark mode. Mobile-only (375–430px).

### 8.2 Screens

| Screen | Key Features |
|--------|-------------|
| **Login** | Phone + OTP only. AlloSafe wordmark with mic icon. |
| **Home** | Greeting in user's language, net position, quick stats, recent activity. |
| **Add** | **Hero screen.** Massive voice button (120px, charcoal → espresso when recording). Waveform animation. Preview card. Text fallback form. |
| **Ledger** | Filter tabs, search, transaction list with swipe actions. |
| **Stock** | Inventory list, quantity bars, reorder alerts. |
| **Profile** | Language switcher (instant re-render), voice history, financial summary with export. |

### 8.3 Internationalization

All 6 languages fully translated. Every UI string from dictionary. No hardcoded English. Language change is instant.

---

## 9. TECHNOLOGY STACK

| Component | Choice | Hosting |
|-----------|--------|---------|
| Frontend | React, Vite, TypeScript, Tailwind, shadcn/ui | Netlify |
| Backend | Python, FastAPI | Render |
| Database/Auth/Storage | Appwrite Cloud | Appwrite Cloud |
| Telephony/Voice | Africa's Talking | Sandbox (free) |
| ASR | Whisper API (fallback), SBPN/N-ATLaS (benchmarked) | API/self-hosted |
| LLM | GPT-4o / Claude | API |
| TTS | Azure Edge-TTS | API |
| Fine-tuning | Kaggle/Colab free GPU | Future |

---

## 10. NINE-DAY BUILD ROADMAP

| Day | Focus | Deliverable |
|-----|-------|-------------|
| **1** | Infrastructure | Appwrite project, collections, Render FastAPI scaffold, Africa's Talking sandbox connected |
| **2** | Voice Onboarding | DTMF language menu → name → business → PIN → account creation |
| **3** | ASR Pipeline | Whisper API integration, `/internal/transcribe` endpoint |
| **4** | LLM Extraction | GPT-4o prompt, entity extraction, `/internal/extract` endpoint |
| **5** | Transaction Voice Flow | End-to-end: call → record → ASR → LLM → DTMF confirm → save |
| **6** | PWA Scaffold | React setup, Appwrite auth, bottom nav, empty screens |
| **7** | PWA Core | Voice button (MediaRecorder), text fallback, ledger, stock views |
| **8** | Integration | Real-time sync, financial summary, export, polish |
| **9** | Demo + Docs | Record video, write submission, bug fixes |

---

## 11. BUDGET

| Item | Cost | Notes |
|------|------|-------|
| Africa's Talking sandbox | Free | Fully functional for build and demo |
| Appwrite Cloud | Free | 75k executions, 10GB storage |
| Render | Free | Sleeps after 15min idle (ping to keep alive) |
| Netlify | Free | 100GB bandwidth, 300 build minutes |
| OpenAI/Anthropic API | ~$5–10 | Pay-as-you-go for demo scale |
| Azure Edge-TTS | Free tier | 10,000 characters/month |
| SBPN/N-ATLaS inference | Free | Open weights, self-hosted for testing |
| Production shortcode | ~₦53,750/month + fees | **Not needed for showcase** |

---

## 12. GO-TO-MARKET (Post-Showcase)

| Phase | Action |
|-------|--------|
| **Beachhead** | One market, 20–50 traders from initial interviews, sandbox pilot |
| **Trust** | Partner with market association chairman or cooperative leader as entry point |
| **Revenue** | Free for traders; monetize from lending side — cooperatives/MFIs pay for verified financial identity summaries |
| **Scale trigger** | Production USSD shortcode only when a cooperative is ready to act on summaries |

---

## 13. RISKS AND MITIGATIONS

| Risk | Mitigation |
|------|------------|
| ASR accuracy lower than benchmarks | Benchmark honestly on own recordings; use Whisper API fallback |
| Users don't trust voice logging | Start with logging only, no money movement; every transaction confirmed |
| Background market noise | Confidence router routes low-confidence to retry, not guess |
| LLM hallucinates correction | Always DTMF-confirm before writing; never auto-write below 90% |
| Network gaps in rural areas | Voice calls work on 2G; PWA is online but voice is primary |
| Licensing (SBPN non-commercial, N-ATLaS 1,000 cap) | Document explicitly; appropriate at showcase scale |

---

## 14. SUBMISSION NARRATIVE

> *"AlloSafe is a voice-first business assistant for Nigeria's informal economy. Market traders, tailors, food vendors, and artisans call a phone number, speak their business in English, Pidgin, Yoruba, Hausa, or Igbo, and the AI structures it into a financial ledger. No smartphone required to start; no literacy barrier. The same data populates a structured web dashboard where users can track stock, debts, and build a verifiable financial identity. Track Your Business. Unlock Opportunities."*

---

## APPENDIX A: COMPLETE UI/UX PROMPT FOR FRONTEND AGENT

```
You are a senior React/TypeScript frontend engineer building "AlloSafe" — a voice-first business assistant PWA for Nigeria's informal economy. Market traders, tailors, food vendors, bike riders, artisans, and farmers call a phone number, speak their business in English, Pidgin, Yoruba, Hausa, or Igbo, and the AI structures it into a ledger. The same data populates a structured web dashboard where users can view, edit, and export their business records. No smartphone is required to start; no literacy barrier.

The app is built with Vite + React + TypeScript + Tailwind CSS + shadcn/ui components. It deploys to Netlify as a PWA.

## BRAND & POSITIONING
- Product Name: AlloSafe
- Tagline: "Track Your Business. Unlock Opportunities."
- Brand Promise: "Your Business, Fully Protected." (What you speak is captured, down to the last kobo.)
- Tone: Humble, grounded, respectful, warm. This is not a "fintech bro" app. It is a tool built for people who run their business from memory and paper.
- Target Personas: Market traders, tailors, food vendors, bike/keke riders, hairdressers, carpenters, farmers. The UI must feel inclusive to all — not overly specific to one trade.

## CORE CONSTRAINTS
- Mobile-first ONLY. All screens are 375px–430px viewport width.
- Touch targets minimum 48px. High contrast for outdoor/sunlight viewing.
- Voice is the HERO. Text input is the fallback. Every screen must prioritize voice input.
- Languages: English, Pidgin, Yoruba, Hausa, Igbo. The ENTIRE UI must render in the user's chosen language. No mixed-language screens.
- NO SMS confirmation flow in the UI. Confirmations happen via DTMF during the voice call (backend handles this). The PWA only shows transaction status.
- NO COOPERATIVE VIEW. This is a single-trader app only.
- NO OFFLINE-FIRST (out of scope). Online required, but include a basic service worker scaffold for future.
- Dark mode is NOT needed. Single light theme.
- NO desktop sidebar. This is mobile-only.

## DESIGN SYSTEM (Locked Palette — Do NOT use green)
| Role               | Hex       | Usage                                       |
| ------------------ | --------- | ------------------------------------------- |
| **Primary**        | `#3D3D3D` | Buttons, nav active state, primary actions  |
| **Primary Hover**  | `#1A1A1A` | Pressed states, emphasis                    |
| **Background**     | `#F7F7F5` | App background, warm off-white              |
| **Surface**        | `#FFFFFF` | Cards, bottom sheets, modals                |
| **Accent**         | `#D4880F` | Income numbers, success states, up-arrows, subtle recording glow |
| **Accent Muted**   | `rgba(212, 136, 15, 0.15)` | Recording pulse ring only |
| **Voice Button Idle** | `#3D3D3D` | Default mic button fill                     |
| **Voice Button Recording** | `#2A2520` | Warm espresso dark while recording          |
| **Text Primary**   | `#1A1A1A` | Headings, primary content                   |
| **Text Secondary** | `#737373` | Labels, hints, timestamps                   |
| **Danger**         | `#DC2626` | Debts, corrections, cancel, delete          |
| **Danger Surface** | `#FEF2F2` | Debt card backgrounds, error toasts         |
| **Success Surface**| `#F0FDF4` | Success toasts (but text/icon in Accent)    |

### Typography
- Font: Inter or system-ui. 
- Body: 16px minimum. Small: 14px. Headings: 24px. Large numbers: 32px.
- Line height: 1.5 for body (Yoruba/Hausa text runs longer).
- Font weight: 600 for all buttons and labels.

### Shadows & Radius
- Cards: 12px radius, `0 2px 12px rgba(0,0,0,0.06)`
- Pills/Buttons: 999px radius (full rounded)
- Bottom sheet: 24px top radius only

## INTERNATIONALIZATION (i18n) — CRITICAL
The app MUST use a translation system. Every string is keyed and rendered from a language dictionary.

### Supported Languages
| Code | Language | Notes |
|------|----------|-------|
| `en` | English | Default |
| `pcm` | Nigerian Pidgin | Informal, friendly |
| `yo` | Yoruba | May need longer text containers |
| `ha` | Hausa | May need longer text containers |
| `ig` | Igbo | May need longer text containers |

### Implementation
- Use `react-i18next` or a lightweight custom context.
- The user's `preferred_language` is stored in Appwrite on onboarding.
- On app load, fetch user profile → set language → render UI.
- Language can be changed in Profile screen. Change is instant (no reload needed).

### Key UI String Categories (ALL must be translated)
1. **Auth** (login, OTP, onboarding tooltip)
2. **Navigation** (tab labels)
3. **Dashboard** (greetings, stats labels, section headers)
4. **Add Transaction** (voice button states, form labels, confirmation actions)
5. **Ledger** (filter tabs, empty state, search placeholder)
6. **Stock** (labels, empty state, alerts)
7. **Profile** (settings, voice history, summary labels)
8. **Toasts & Errors** (success, failure, network errors)
9. **Voice Flow** (TTS is backend, but UI text must match)

### Translation String Examples (Provide ALL of these in the i18n file)

```typescript
// src/lib/i18n.ts
export const translations = {
  en: {
    // Auth
    loginTitle: "Welcome to AlloSafe",
    loginSubtitle: "Track Your Business. Unlock Opportunities.",
    phoneLabel: "Phone Number",
    phonePlaceholder: "8012345678",
    sendPin: "Send PIN",
    otpLabel: "Enter PIN",
    otpSent: "PIN sent to your phone",
    firstLoginTooltip: "Your voice calls are linked here. Everything you say by phone appears here.",

    // Nav
    navHome: "Home",
    navAdd: "Add",
    navLedger: "Ledger",
    navStock: "Stock",
    navProfile: "Profile",

    // Dashboard
    greeting: "Good afternoon, {{name}}",
    netPosition: "Net Position",
    thisWeekIncome: "This Week Income",
    thisWeekExpense: "This Week Expense",
    peopleOwing: "People Owing You",
    recentActivity: "Recent Activity",
    viewAll: "View All",
    noRecentActivity: "No recent activity. Call to log your first sale!",

    // Add Transaction
    holdToSpeak: "Hold to Speak",
    listening: "Listening...",
    understanding: "Understanding...",
    typeInstead: "Type instead",
    transactionType: "Type",
    typeSale: "Sale",
    typeExpense: "Expense",
    typeDebt: "Debt",
    itemLabel: "Item",
    quantityLabel: "Quantity",
    unitLabel: "Unit",
    amountLabel: "Amount (₦)",
    personLabel: "Customer / Supplier",
    saveTransaction: "Save Transaction",
    confirm: "Confirm",
    edit: "Edit",
    cancel: "Cancel",
    lowConfidenceWarning: "We heard: "{{transcript}}". Please check.",
    successLogged: "Kobo logged!",

    // Ledger
    searchPlaceholder: "Search items or people...",
    filterAll: "All",
    filterSales: "Sales",
    filterExpenses: "Expenses",
    filterDebts: "Debts",
    emptyLedger: "No transactions yet. Your voice logs will appear here.",

    // Stock
    addStock: "Add Stock",
    stockEmpty: "No stock recorded yet.",
    reorderAlert: "Running low",
    unitBags: "bags",
    unitYards: "yards",
    unitPieces: "pieces",
    unitLitres: "litres",
    unitKg: "kg",

    // Profile
    myVoiceHistory: "My Voice History",
    financialSummary: "Financial Summary",
    weekLabel: "Week",
    consistencyScore: "Consistency Score",
    topItems: "Top Items",
    exportSummary: "Copy Summary",
    logout: "Log Out",
    languageLabel: "Language",

    // Voice History Status
    statusConfirmed: "Confirmed",
    statusCorrected: "Corrected",
    statusFailed: "Failed",
    statusLowConfidence: "Needs Review",

    // Errors
    errorNetwork: "Network error. Please check your connection.",
    errorAuth: "Session expired. Please log in again.",
    errorAudio: "Could not hear clearly. Try again or type instead.",
  },

  pcm: {
    loginTitle: "Welcome to AlloSafe",
    loginSubtitle: "Track Your Business. Unlock Opportunities.",
    phoneLabel: "Your Phone Number",
    phonePlaceholder: "8012345678",
    sendPin: "Send PIN",
    otpLabel: "Enter your PIN",
    otpSent: "We don send PIN to your phone",
    firstLoginTooltip: "All the things wey you talk for phone go show here. Na your account be this.",

    navHome: "Home",
    navAdd: "Add",
    navLedger: "History",
    navStock: "Stock",
    navProfile: "Profile",

    greeting: "Good afternoon, {{name}}",
    netPosition: "Your Money",
    thisWeekIncome: "Money Wey Enter",
    thisWeekExpense: "Money Wey Comot",
    peopleOwing: "People Wey Dey Owe You",
    recentActivity: "Wetin Happen Lately",
    viewAll: "See Everything",
    noRecentActivity: "Nothing don happen yet. Call our number to log your first sale!",

    holdToSpeak: "Hold to Talk",
    listening: "I dey hear you...",
    understanding: "I dey think...",
    typeInstead: "Type am instead",
    transactionType: "Wetin you wan log?",
    typeSale: "Sale",
    typeExpense: "Expense",
    typeDebt: "Debt",
    itemLabel: "Wetin you sell/buy?",
    quantityLabel: "How many?",
    unitLabel: "Unit",
    amountLabel: "How much? (₦)",
    personLabel: "Customer or Supplier",
    saveTransaction: "Save am",
    confirm: "Confirm",
    edit: "Change am",
    cancel: "Cancel",
    lowConfidenceWarning: "I hear say: "{{transcript}}". Abeg check am.",
    successLogged: "Kobo don log!",

    searchPlaceholder: "Find item or person...",
    filterAll: "Everything",
    filterSales: "Sales",
    filterExpenses: "Expenses",
    filterDebts: "Debts",
    emptyLedger: "No transaction yet. The things you talk for phone go show here.",

    addStock: "Add Stock",
    stockEmpty: "You never add stock.",
    reorderAlert: "E dey finish",
    unitBags: "bags",
    unitYards: "yards",
    unitPieces: "pieces",
    unitLitres: "litres",
    unitKg: "kg",

    myVoiceHistory: "My Voice Calls",
    financialSummary: "Your Money Summary",
    weekLabel: "Week",
    consistencyScore: "How steady you dey",
    topItems: "Wetin you dey sell pass",
    exportSummary: "Copy Summary",
    logout: "Comot",
    languageLabel: "Language",

    statusConfirmed: "Confirmed",
    statusCorrected: "Corrected",
    statusFailed: "Fail",
    statusLowConfidence: "Abeg check am",

    errorNetwork: "Network no good. Try again.",
    errorAuth: "Your session don expire. Log in again.",
    errorAudio: "I no hear am well. Try again or type am.",
  },

  yo: {
    loginTitle: "Kaabo si AlloSafe",
    loginSubtitle: "Kobo koo kan, a ka a.",
    phoneLabel: "Nọ́mbà Tẹlifọọnu",
    phonePlaceholder: "8012345678",
    sendPin: "Firanṣẹ́ PIN",
    otpLabel: "Tẹ PIN rẹ sii",
    otpSent: "A ti firanṣẹ́ PIN sí fọọnu rẹ",
    firstLoginTooltip: "Ohun gbogbo ti o sọ lori foonu yoo fara han nibi. Iyi ni akọọlẹ rẹ.",

    navHome: "Ile",
    navAdd: "Fi kun",
    navLedger: "Akọsilẹ",
    navStock: "Ohun-ini",
    navProfile: "Profaili",

    greeting: "Ẹ ku ọsan, {{name}}",
    netPosition: "Ipo Owo",
    thisWeekIncome: "Owo Ti O Wọle Nla Yi",
    thisWeekExpense: "Owo Ti O Jade Nla Yi",
    peopleOwing: "Awọn Eniyan Ti O Ni Gbese",
    recentActivity: "Iṣẹlẹ Tuntun",
    viewAll: "Wo Gbogbo e",
    noRecentActivity: "Ko si iṣẹlẹ tuntun. Pe nọ́mbà wa lati ṣe akọsilẹ iṣowo akọkọ rẹ!",

    holdToSpeak: "Mu lati Sọrọ",
    listening: "Ngbọ́...",
    understanding: "N loye...",
    typeInstead: "Kọ rẹ nipa tẹ",
    transactionType: "Irú iṣowo",
    typeSale: "Tita",
    typeExpense: "Inawo",
    typeDebt: "Gbese",
    itemLabel: "Ohun-ini",
    quantityLabel: "Iye",
    unitLabel: "Ẹya",
    amountLabel: "Owo (₦)",
    personLabel: "Onibara / Olupese",
    saveTransaction: "Fi Akọsilẹ",
    confirm: "Jẹrisi",
    edit: "Ṣatunkọ",
    cancel: "Fagile",
    lowConfidenceWarning: "A gbo: "{{transcript}}". Jọwọ ṣayẹwo.",
    successLogged: "A ti ka kobo!",

    searchPlaceholder: "Wa ohun-ini tabi eniyan...",
    filterAll: "Gbogbo",
    filterSales: "Tita",
    filterExpenses: "Inawo",
    filterDebts: "Gbese",
    emptyLedger: "Ko si iṣowo. Awọn ohun ti o sọ lori foonu yoo wa nibi.",

    addStock: "Fi Ohun-ini kun",
    stockEmpty: "Ko si ohun-ini ti a ṣe akọsilẹ.",
    reorderAlert: "O ku die",
    unitBags: "apo",
    unitYards: "yards",
    unitPieces: "awọn nkan",
    unitLitres: "litres",
    unitKg: "kg",

    myVoiceHistory: "Itan Ohun mi",
    financialSummary: "Akopọ Owo",
    weekLabel: "Ọsẹ",
    consistencyScore: "Aṣeyọri Didogba",
    topItems: "Awọn Ohun Tita",
    exportSummary: "Daakọ Akopọ",
    logout: "Jade",
    languageLabel: "Ede",

    statusConfirmed: "Ti jẹrisi",
    statusCorrected: "Ti ṣatunkọ",
    statusFailed: "Kuna",
    statusLowConfidence: "Ni lati ṣayẹwo",

    errorNetwork: "Aṣiṣe nẹtiwọki. Jọwọ ṣayẹwo asopo rẹ.",
    errorAuth: "Akoko iṣẹ rẹ ti pari. Jọwọ wọle tun.",
    errorAudio: "A ko le gbo daradara. Gbiyanju lẹẹkan si tabi kọ rẹ.",
  },

  ha: {
    loginTitle: "Barka da zuwa AlloSafe",
    loginSubtitle: "Kobo koo, an lissafa shi.",
    phoneLabel: "Lambar Wayar",
    phonePlaceholder: "8012345678",
    sendPin: "Aika PIN",
    otpLabel: "Shigar da PIN",
    otpSent: "An aika PIN zuwa wayarka",
    firstLoginTooltip: "Duk abin da ka ce a waya zai bayyana a nan. Wannan asusun ka ne.",

    navHome: "Gida",
    navAdd: "Ƙara",
    navLedger: "Rahoto",
    navStock: "Kaya",
    navProfile: "Bayani",

    greeting: " Barka da rana, {{name}}",
    netPosition: "Matsayi Kuɗi",
    thisWeekIncome: "Kudin da Ya Shigo Wannan Mako",
    thisWeekExpense: "Kudin da Ya Fit Wannan Mako",
    peopleOwing: "Mutanen da Ke Bin Kuɗi",
    recentActivity: "Abubuwan da Suka Faru",
    viewAll: "Duba Duka",
    noRecentActivity: "Babu wani abu. Kira lambarmu don yin rijistar sayarwar ka!",

    holdToSpeak: "Ka riƙe Don Yi Magana",
    listening: "Na saurara...",
    understanding: "Na fahimta...",
    typeInstead: "Rubuta maimakon haka",
    transactionType: "Irin ma'amala",
    typeSale: "Sayarwa",
    typeExpense: "Kudade",
    typeDebt: "Bashi",
    itemLabel: "Abu",
    quantityLabel: "Yawan",
    unitLabel: "Naƙa",
    amountLabel: "Kudin (₦)",
    personLabel: "Abokin Ciniki / Mai Ba da Kaya",
    saveTransaction: "Ajiye Ma'amala",
    confirm: "Tabbatar",
    edit: "Gyara",
    cancel: "Soke",
    lowConfidenceWarning: "Na ji: "{{transcript}}". Da fatan za a duba.",
    successLogged: "An lissafa kobo!",

    searchPlaceholder: "Nemi abu ko mutum...",
    filterAll: "Duka",
    filterSales: "Sayarwa",
    filterExpenses: "Kudade",
    filterDebts: "Bashi",
    emptyLedger: "Babu ma'amala. Abubuwan da ka ce a waya za su bayyana a nan.",

    addStock: "Ƙara Kaya",
    stockEmpty: "Babu kaya da aka yi rijista.",
    reorderAlert: "Ya ƙare",
    unitBags: "jaka",
    unitYards: "yards",
    unitPieces: "yankuna",
    unitLitres: "litres",
    unitKg: "kg",

    myVoiceHistory: "Tarihin Muryata",
    financialSummary: "Takaitaccen Kuɗi",
    weekLabel: "Mako",
    consistencyScore: "Matsayin Daidaito",
    topItems: "Manyan Abubuwa",
    exportSummary: "Kwafi Takaitaccen",
    logout: "Fita",
    languageLabel: "Harshe",

    statusConfirmed: "An tabbatar",
    statusCorrected: "An gyara",
    statusFailed: "Ya karya",
    statusLowConfidence: "Bukatar duba",

    errorNetwork: "Kuskuren hanyar sadarwa. Da fatan za a duba haɗin ku.",
    errorAuth: "Zaman aiki ya kare. Da fatan za a sake shiga.",
    errorAudio: "Ba mu ji kyau ba. A sake gwadawa ko rubuta.",
  },

  ig: {
    loginTitle: "Nnọọ na AlloSafe",
    loginSubtitle: "Kobo ọ bụla, a gụrụ ya.",
    phoneLabel: "Nọmba Ekwentị",
    phonePlaceholder: "8012345678",
    sendPin: "Zipu PIN",
    otpLabel: "Tinye PIN",
    otpSent: "Anyị ezipula PIN gị na ekwentị gị",
    firstLoginTooltip: "Ihe niile ị kwuru n'ekwentị ga-aputa ebe a. Nke a bụ akaụntụ gị.",

    navHome: "Ụlọ",
    navAdd: "Tinye",
    navLedger: "Akwụkwọ",
    navStock: "Ihe Ndị Dị",
    navProfile: "Profaịlụ",

    greeting: "Ndeewo, {{name}}",
    netPosition: "Ọnọdụ Ego",
    thisWeekIncome: "Ego Ọ Banyere Izu A",
    thisWeekExpense: "Ego Ọ Pụrụ Izu A",
    peopleOwing: "Ndị Na-Agọzi Gị Ego",
    recentActivity: "Ihe Na-Emume Ugbu A",
    viewAll: "Lee Ha Niile",
    noRecentActivity: "Enweghị ihe ọhụrụ. Kpọ nọmba anyị ka ịdebe ahịa mbụ gị!",

    holdToSpeak: "Jide Iji Kwu",
    listening: "Na-anụ...",
    understanding: "Na-aghọta...",
    typeInstead: "Dee n'akwụkwọ kama",
    transactionType: "Ụdị azụmahịa",
    typeSale: "Ịre",
    typeExpense: "Ọnụ ego",
    typeDebt: "Ọgwụgwụ",
    itemLabel: "Ihe",
    quantityLabel: "Ọnụọgụgụ",
    unitLabel: "Nkeji",
    amountLabel: "Ego (₦)",
    personLabel: "Onye Ịzụrụ / Onye Na-ere",
    saveTransaction: "Chekwaa Azụmahịa",
    confirm: "Kwesie Nke Ọma",
    edit: "Dezie",
    cancel: "Kagbuo",
    lowConfidenceWarning: "Anyị nụrụ: "{{transcript}}". Biko lelee ya.",
    successLogged: "A gụrụ kobo!",

    searchPlaceholder: "Chọọ ihe ma ọ bụ mmadụ...",
    filterAll: "Ha Niile",
    filterSales: "Ịre",
    filterExpenses: "Ọnụ Ego",
    filterDebts: "Ọgwụgwụ",
    emptyLedger: "Enweghị azụmahịa. Ihe ndị ị kwuru n'ekwentị ga-aputa ebe a.",

    addStock: "Tinye Ihe",
    stockEmpty: "Enweghị ihe e debere.",
    reorderAlert: "Ọ na-agafe",
    unitBags: "akpa",
    unitYards: "yards",
    unitPieces: "ihe",
    unitLitres: "litres",
    unitKg: "kg",

    myVoiceHistory: "Akụkọ Mmụta M",
    financialSummary: "Nchịkọta Ego",
    weekLabel: "Izu",
    consistencyScore: "Akara Ọnọdụ",
    topItems: "Ihe Kacha",
    exportSummary: "Detuo Nchịkọta",
    logout: "Pụọ",
    languageLabel: "Asụsụ",

    statusConfirmed: "Ekwesịtala",
    statusCorrected: "Emezila",
    statusFailed: "Mmehie",
    statusLowConfidence: "Ọ chọrọ ilele",

    errorNetwork: "Nsogbu netwọk. Biko lelee njikọ gị.",
    errorAuth: "Oge ọrụ gị gụchara. Biko banye ọzọ.",
    errorAudio: "Anyị anụghị nke ọma. Gbalịa ọzọ ma ọ bụ dee ya.",
  },
};
```

### Text Length Handling
- Yoruba and Hausa labels can be 20-40% longer than English.
- Use `min-height` for buttons, not fixed height.
- Allow text wrap on labels (2 lines max).
- Dashboard stat cards: use vertical stack if horizontal doesn't fit.

## AUTH FLOW
Screen: /login
- App logo: "AlloSafe" wordmark in Primary (#3D3D3D) with a small mic icon integrated into the "o" of Soro.
- Phone number input (Nigerian format, +234 prefix locked).
- "Send PIN" button (large, Primary color).
- OTP input: 4 boxes, auto-advance.
- NO email/password. Phone + OTP only.
- On first login, show a brief tooltip: `{{firstLoginTooltip}}` in user's language.

## MAIN APP STRUCTURE (Bottom Navigation)
Five tabs, always visible at bottom:
1. HOME (Dashboard)
2. ADD (+) — Voice-first transaction entry
3. LEDGER (History)
4. STOCK (Inventory)
5. PROFILE

Tab labels come from i18n: `{{navHome}}`, `{{navAdd}}`, etc.

## SCREEN 1: HOME / DASHBOARD
- Greeting: `{{greeting}}` with user's name, in their language.
- Net Position Card (large, prominent): `{{netPosition}}` label + amount in Accent color. Up/down arrow + percentage vs last week.
- Quick Stats Row (3 cards): `{{thisWeekIncome}}` | `{{thisWeekExpense}}` | `{{peopleOwing}}`
- "Recent Activity" list: Last 3 transactions with icon (mic for voice, keyboard for typed), amount, item, time ago.
- Tap any transaction → opens detail bottom sheet.

## SCREEN 2: ADD TRANSACTION (THE HERO SCREEN)
This is the most important screen. Two input modes, voice ALWAYS on top.

### Voice Mode (Default):
- MASSIVE circular button centered on screen: `{{holdToSpeak}}` with microphone icon.
- Button size: 120px diameter. Minimum 48px touch target beyond visual.
- While holding: 
  - Button fill changes to `#2A2520` (warm espresso dark)
  - Button scales to 1.08x
  - Shows CSS audio waveform animation (4-5 bars pulsing)
  - Text below: `{{listening}}` in selected language
  - Subtle ring glow: `box-shadow: 0 0 0 0 rgba(212, 136, 15, 0.15)` pulsing outward
- On release: 
  - Button shows loading spinner
  - Text: `{{understanding}}`
- Then: structured preview card appears with extracted fields:
  - Type: [Sale / Expense / Debt] — use i18n keys
  - Item, Quantity, Unit, Amount, Person
- Action row below card: [✓ `{{confirm}}`] [✏ `{{edit}}`] [✗ `{{cancel}}`]
- If ASR confidence < 0.7: show amber warning banner with `{{lowConfidenceWarning}}`

### Voice Button CSS
```css
.voice-button {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #3D3D3D;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: none;
  position: relative;
}

.voice-button.recording {
  background: #2A2520;
  transform: scale(1.08);
  animation: warmPulse 1.5s infinite;
}

@keyframes warmPulse {
  0% { box-shadow: 0 0 0 0 rgba(212, 136, 15, 0.15); }
  70% { box-shadow: 0 0 0 24px rgba(212, 136, 15, 0); }
  100% { box-shadow: 0 0 0 0 rgba(212, 136, 15, 0); }
}

.voice-button .waveform {
  display: flex;
  gap: 3px;
  align-items: center;
  height: 24px;
}

.voice-button .waveform span {
  width: 3px;
  background: white;
  border-radius: 2px;
  animation: wave 0.5s ease infinite;
}

.voice-button .waveform span:nth-child(2) { animation-delay: 0.1s; }
.voice-button .waveform span:nth-child(3) { animation-delay: 0.2s; }
.voice-button .waveform span:nth-child(4) { animation-delay: 0.3s; }

@keyframes wave {
  0%, 100% { height: 6px; }
  50% { height: 20px; }
}
```

### Text Fallback Mode:
- Small link below voice button: `{{typeInstead}}`
- Switches to form: Type (segmented: `{{typeSale}}` | `{{typeExpense}}` | `{{typeDebt}}`), Item, Qty, Unit, Amount, Person.
- Save button: large Primary pill.

### After Save:
- Toast: `{{successLogged}}` with Accent color icon.
- Auto-return to Home with updated numbers.

## SCREEN 3: LEDGER
- Filter tabs: `{{filterAll}}` | `{{filterSales}}` | `{{filterExpenses}}` | `{{filterDebts}}`
- Search bar: placeholder `{{searchPlaceholder}}`
- List of transactions. Each row:
  - Left: icon (arrow up Accent for sale, arrow down Danger for expense, clock amber for debt)
  - Middle: Item name, quantity, person (if any)
  - Right: Amount, date (e.g., "2h ago")
- Tap row → Bottom sheet with full details + raw transcript (if voice) + `{{edit}}` button.
- Swipe left on row → Quick actions: `{{edit}}` | `{{cancel}}`

## SCREEN 4: STOCK / INVENTORY
- `{{addStock}}` button (voice or text, same pattern as Add Transaction).
- List of current items with quantity bars (visual progress bar showing stock level).
- Tap item → Edit qty, set reorder alert threshold, delete.
- Low stock items: amber border + `{{reorderAlert}}` badge.

## SCREEN 5: PROFILE
- User info card (name, phone, business type, language).
- Language switcher: dropdown with language names in native script:
  - English | Pidgin | Yoruba | Hausa | Igbo
  - Switching language instantly re-renders all UI text.
- `{{myVoiceHistory}}` — list of recent call sessions with status badges using i18n keys.
- `{{financialSummary}}` button → opens full-screen summary:
  - Week selector
  - Income vs Expense bar chart (simple CSS div bars or recharts)
  - `{{consistencyScore}}` badge (0-100)
  - `{{topItems}}` list
  - `{{exportSummary}}` button (copies plain text to clipboard)
- `{{logout}}` button at bottom.

## COMPONENT SPECS
- All buttons: min-height 56px, font-weight 600, full rounded (999px) or 12px for cards.
- Cards: white (#FFFFFF), 12px radius, 16px padding, `0 2px 12px rgba(0,0,0,0.06)`.
- Bottom sheet: slides up from bottom, 90% height, 24px top radius, close on backdrop tap or swipe down.
- Loading states: Skeleton screens for lists, spinner for actions.
- Empty states: Centered illustration (simple line art) + `{{emptyLedger}}` or `{{stockEmpty}}` in selected language.

## VOICE INPUT INTERACTION
- Must use MediaRecorder API with audio/webm or audio/wav.
- Send blob to backend: POST /api/voice/transcribe
- Show states: `{{holdToSpeak}}` → `{{listening}}` → `{{understanding}}` → Preview Card
- Handle errors: `{{errorAudio}}`
- On successful transcription, pre-populate the Add form so user can edit before saving.

## ACCESSIBILITY
- All inputs have associated labels.
- Focus rings: `2px solid #D4880F` with 2px offset.
- ARIA labels on icon-only buttons.
- Respect prefers-reduced-motion: disable waveform animation, confetti, pulse.

## PWA REQUIREMENTS
- manifest.json: name "AlloSafe", short_name "AlloSafe", theme_color "#3D3D3D", background_color "#F7F7F5", display "standalone".
- Register service worker (basic scaffold).
- Apple touch icon, meta viewport fit=cover.

## API CONTRACT
GET /api/users/me → { id, name, phone, business_type, language, balance }
GET /api/transactions → [{ id, type, item, quantity, unit, amount, person, source, created_at }]
POST /api/transactions → { type, item, quantity, unit, amount, person, source: "web" | "voice" }
GET /api/inventory → [{ id, item_name, quantity, unit, reorder_threshold }]
POST /api/voice/transcribe → FormData with audio blob → { transcript, confidence, extracted: { type, item, qty, unit, amount, person } }

## FILE STRUCTURE
/src
  /components
    /ui (shadcn components)
    BottomNav.tsx
    VoiceButton.tsx
    TransactionCard.tsx
    SummaryChart.tsx
    LanguageSelector.tsx
    BottomSheet.tsx
    Toast.tsx
  /pages
    Login.tsx
    Home.tsx
    Add.tsx
    Ledger.tsx
    Stock.tsx
    Profile.tsx
  /hooks
    useAuth.ts
    useVoiceRecorder.ts
    useTransactions.ts
    useLanguage.ts
  /lib
    api.ts (axios/fetch wrapper)
    i18n.ts (full translation dictionaries as shown above)
    utils.ts
  App.tsx
  main.tsx

## IMPORTANT NOTES
- Do NOT build a desktop sidebar. This is mobile-only.
- Do NOT add dark mode.
- Do NOT add cooperative/multi-user views.
- The voice button MUST be the largest, most prominent interactive element on the Add screen.
- Use React Query or SWR for server state if possible, otherwise useEffect + fetch.
- All currency is ₦ (NGN). Format with Intl.NumberFormat('en-NG').
- Every single piece of user-facing text MUST come from the i18n dictionary. No hardcoded English strings anywhere in JSX.
- Language context wraps the entire app. Changing language in Profile instantly re-renders everything without page reload.
- Do NOT use green anywhere in the UI. The locked palette is Charcoal (#3D3D3D), Espresso (#2A2520), and Ochre (#D4880F) only.
```

---

*End of AlloSafe Project Brief*

