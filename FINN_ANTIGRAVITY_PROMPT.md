# FINN — Financial Investment Agent · Build Prompt

> Paste everything below this line into Antigravity (Planning mode). Then tell it: "Execute phase by phase. After each phase, run it, verify the acceptance checks, and commit before moving on."

---

## 0. Role & context

You are a senior full-stack engineer and product designer. Build **FINN**, a mobile-first financial investment agent for an Indian equity investor, as my submission for the **ENAM Holdings AI Engineer Build Challenge**. The deadline is **today**, so prioritise a **thin-but-working, beautifully presented** product over breadth. **A demo that doesn't run is the worst outcome.** Every phase must leave the app deployable.

The evaluators grade **creativity, product sense, judgment and architecture — not completeness**. They explicitly penalise "AI slop" (template-looking UI, verbose generic LLM text). They give bonus points for **cost efficiency**: smart model routing (cheap model for bulk, strong model only where reasoning demands), caching, and chunking.

FINN has two modes:
- **Push**: it proactively tells the investor what changed and why they should care.
- **Pull**: the investor asks it to research or analyse a company on demand, grounded **only** in primary sources (annual reports + concall transcripts + exchange filings). No news, no broker notes, no LLM outside knowledge on the pull side.

---

## 1. Tech stack (fixed — do not change without asking me)

| Layer | Choice |
|---|---|
| Frontend | **Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion + Recharts + lucide-react**. Installable **PWA** (manifest + icons + service worker). |
| API | **Python FastAPI** deployed as **Vercel Python serverless functions** (`/api/*`) in the **same Vercel project** as the frontend. |
| Data pipeline | **Python scripts in `/pipeline`**, run by **GitHub Actions cron** (heavy jobs never run on Vercel). |
| Database | **Supabase Postgres** (free tier) with **pgvector**. Use `DATABASE_URL` with the Supabase **pooled** connection string (port 6543) for serverless. |
| Prices | `yfinance`, NSE tickers with `.NS` suffix (fallback `.BO`). End-of-day data. |
| Announcements | **BSE corporate announcements API** (primary, reliable from servers) with NSE as an optional fallback. |
| Fundamentals | **screener.in** company page → links to Annual Reports + Concall transcripts (+ standardised financial tables). PDFs parsed with **PyMuPDF**. |
| LLMs | **Google Gemini API** (Google AI Studio key). Cheap model = Gemini Flash; strong model = Gemini Pro. **Model names must come from env vars** (`GEMINI_FLASH_MODEL`, `GEMINI_PRO_MODEL`) with sensible current defaults. Optional fallback: Groq (`GROQ_API_KEY`) if set. |
| Embeddings | Gemini embedding model (env `GEMINI_EMBED_MODEL`) → pgvector. |
| People enrichment | **Tavily** search API (`TAVILY_API_KEY`) for management-change bios (push side only). |
| Hosting | **Vercel** (frontend + API). GitHub Actions for cron. |

**Vercel constraints you must design around:** function time limit (~60 s on the free plan), no persistent filesystem, Python bundle size limit (no torch/chromadb/heavy ML libs). Keep `requirements.txt` for the API lean; put heavy deps in `pipeline/requirements.txt`.

### Environment variables (create `.env.example`)
```
DATABASE_URL=
GEMINI_API_KEY=
GEMINI_FLASH_MODEL=gemini-2.5-flash
GEMINI_PRO_MODEL=gemini-2.5-pro
GEMINI_EMBED_MODEL=gemini-embedding-001
TAVILY_API_KEY=
GROQ_API_KEY=            # optional fallback
NEXT_PUBLIC_API_BASE=/api
```
Verify the default model names against the current Gemini API docs and update the defaults if they are outdated.

---

## 2. Repository structure

```
finn/
├── app/                      # Next.js App Router (frontend)
│   ├── (tabs)/brief/         # Push: digest feed (home)
│   ├── (tabs)/alerts/        # Push: triggered alerts + threshold settings
│   ├── (tabs)/ask/           # Pull: research on any NSE ticker
│   ├── (tabs)/portfolio/     # Holdings
│   ├── company/[symbol]/     # Company research view
│   └── layout.tsx            # Mobile shell + bottom tab bar
├── components/               # UI components (cards, charts, sheets)
├── lib/                      # API client, formatters (₹, Cr, %), types
├── api/                      # FastAPI app for Vercel
│   ├── index.py              # FastAPI entrypoint (app = FastAPI())
│   ├── routers/              # digest, alerts, portfolio, research, settings
│   └── core/                 # db, llm router, cache, retrieval, sources
├── pipeline/                 # Heavy jobs (GitHub Actions)
│   ├── refresh_prices.py
│   ├── fetch_announcements.py
│   ├── classify_and_enrich.py
│   ├── run_alerts.py
│   ├── ingest_documents.py   # AR + concall PDFs → chunks → embeddings
│   ├── precompute_research.py
│   └── requirements.txt
├── data/
│   ├── portfolio.json        # demo portfolio + research watchlist
│   ├── taxonomy.json         # announcement categories + priority rules
│   ├── bse_scrip_map.json    # NSE symbol ↔ BSE code (cached)
│   └── snapshots/            # pre-computed JSON fallbacks for the demo
├── db/schema.sql
├── .github/workflows/        # daily_refresh.yml, keep_warm.yml (optional)
├── vercel.json
├── requirements.txt          # lean API deps only
├── README.md
└── WRITEUP.md                # draft of the covering-email writeup
```

---

## 3. Demo companies (`data/portfolio.json`)

**Portfolio (18, mixed sectors and sizes)**, each with quantity + average buy price (make up plausible mock values):
RELIANCE, HDFCBANK, TCS, BHARTIARTL, ITC, LT, SUNPHARMA, MARUTI, BAJFINANCE, TRENT, DIXON, POLYCAB, PERSISTENT, TATAPOWER, ETERNAL, KPITTECH, DEEPAKNTR, CDSL

**Ad-hoc research watchlist (outside portfolio):** ASIANPAINT, PIDILITIND, HAL, IRCTC

Store per company: NSE symbol, BSE scrip code, name, sector, market-cap bucket (large/mid/small). Verify that every ticker resolves on yfinance and BSE; if one doesn't (e.g. renamed), replace it with a similar company and tell me.

**The engine must generalise:** every pipeline and API function takes an arbitrary NSE symbol. Nothing is hard-wired to this list. Resolve NSE→BSE code dynamically from BSE's scrip master list (download once, cache in `bse_scrip_map.json` and the DB).

---

## 4. Database schema (`db/schema.sql`)

Create these tables (plus indexes and `create extension vector`):
- `companies(symbol PK, bse_code, name, sector, mcap_bucket, in_portfolio bool, qty, avg_price)`
- `prices(symbol, date, open, high, low, close, volume, PK(symbol,date))`
- `announcements(id PK, symbol, bse_code, filed_at timestamptz, headline, raw_category, raw_subcategory, attachment_url, category, materiality smallint 0-3, one_liner, card_type, card_payload jsonb, processed bool)`
- `alerts(id PK, symbol, type, triggered_at, value, threshold, message, announcement_id null, seen bool)`
- `alert_settings(id PK=1, volume_multiple numeric default 2.0, volume_lookback int default 20, price_move_pct numeric default 5.0, categories text[] default '{results,M&A,management_change,fund_raise,litigation,credit_rating,pledging}')`
- `documents(id PK, symbol, doc_type ('annual_report'|'concall'|'results'), period_label, url, fetched_at, page_count)`
- `chunks(id PK, document_id, symbol, page int, text, embedding vector(768 or model dim), tsv tsvector)`
- `research(symbol, view, payload jsonb, sources jsonb, model, tokens_in, tokens_out, cost_usd, created_at, PK(symbol, view))`
- `llm_cache(key PK sha256, model, response jsonb, tokens_in, tokens_out, created_at)`
- `research_jobs(id PK, symbol, status, step, error, created_at, updated_at)`

---

## 5. Backend — data sources

### 5.1 Prices (`refresh_prices.py`)
- `yfinance` download ~1 year of daily OHLCV for all tracked symbols (batch download). Upsert into `prices`.
- Compute per symbol: 1-day % change, volume ÷ N-day average volume (N from settings), 52-week high/low.

### 5.2 Announcements (`fetch_announcements.py`)
- BSE endpoint (send browser-like `User-Agent`, `Referer: https://www.bseindia.com/`, `Origin: https://www.bseindia.com`):
  `https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?pageno=1&strCat=-1&strPrevDate=YYYYMMDD&strScrip={BSE_CODE}&strSearch=P&strToDate=YYYYMMDD&strType=C&subcategory=-1`
  Attachment PDFs: `https://www.bseindia.com/xml-data/corpfiling/AttachLive/{ATTACHMENTNAME}`
- Fetch the last 30 days for every tracked company, dedupe by announcement ID, and store.
- Add retry with backoff and graceful failure. If BSE fails, fall back to the NSE corporate-announcements API (needs a cookie warm-up request to nseindia.com first). If both fail, the app serves from the DB/snapshots. Never crash the UI.

### 5.3 Fundamentals (`ingest_documents.py`)
- From `https://www.screener.in/company/{SYMBOL}/consolidated/` (fall back to the standalone page), parse the **Documents** section: annual-report links (latest 2) and concall transcript links (latest 4–6 quarters). Also parse the standardised tables (quarterly results, P&L, balance sheet, cash flow, ratios) — these are derived from primary filings and are used for numbers and trajectory.
- Download PDFs, extract text per page with PyMuPDF, chunk ~800 tokens with ~100 overlap **keeping the page number**, embed with Gemini embeddings (batch), and store in `chunks` (+ `tsv` for keyword search).
- **For annual reports, embed only the high-value sections** (MD&A, Directors' Report highlights, segment info, financial statements, notes on borrowings / contingent liabilities / related-party transactions, auditor's report) — detect them by headings/keywords. This is a deliberate cost decision; document it.
- Be polite: rate-limit requests and cache downloads.

---

## 6. Push side — the intelligence

### 6.1 Classification (cheap first, LLM only when needed)
Taxonomy (from the challenge's reference doc): `results, M&A, fund_raise, management_change, litigation, insider_trading, earnings_call, investor_meetings, credit_rating, dividend, bonus_split, capex, press_release, postal_ballot, agm_egm, pledging, unclassified`.

1. **Rule-based first:** map BSE's own `CATEGORYNAME`/`SUBCATNAME` + headline keywords to the taxonomy (`data/taxonomy.json`). This handles most filings at zero LLM cost.
2. **Gemini Flash only for ambiguous ones:** pass the headline + first ~1,500 chars of the PDF and return JSON `{category, materiality 0-3, one_liner ≤ 18 words}`.
3. Cache every LLM call in `llm_cache` keyed by `sha256(model + prompt)`. Never pay twice for the same filing.

### 6.2 Materiality / priority (the judgment layer — make it explicit)
`priority = category_weight × materiality × position_weight`
- Category weights: results, M&A, management_change (CEO/CFO/MD), fund_raise, litigation (regulatory order/fine), credit_rating change, pledging = **high**. Dividend, bonus_split, capex, press_release (order wins) = **medium**. Earnings_call notice, investor_meetings, postal_ballot, agm_egm, unclassified (ESOP allotments, compliance certificates, trading-window closures) = **low → collapsed**.
- Position weight = the holding's % of portfolio value (portfolio companies outrank watchlist).
- Write this logic in `taxonomy.json` + one documented function so I can explain it in the writeup.

### 6.3 Rich cards (decide what earns attention)
- **Quarterly results card** (`card_type="results"`): download the results PDF and use Gemini Flash structured extraction (JSON schema) to get **Revenue, EBITDA, PBT, PAT** for **current quarter, previous quarter, same quarter last year** (results filings contain all three columns), unit (₹ Cr), and consolidated vs standalone (prefer consolidated). If EBITDA isn't reported, compute `EBITDA = PBT + finance costs + depreciation − other income` and label it "derived". For **banks/NBFCs** (HDFCBANK, BAJFINANCE), EBITDA isn't meaningful: show **Net Interest Income / Total Income, Operating Profit, PBT, PAT** instead and say why. Compute QoQ % and YoY %. Cross-check against screener's quarterly table and flag mismatches. Card shows a 4-row mini table with coloured ▲▼ deltas plus a margin line (EBITDA margin / PAT margin change in bps).
- **Management change card** (`card_type="management_change"`): use Flash to extract `{person, role, change: appointed|resigned|retired, effective_date, reason}`. SEBI rules require appointment filings to include a **brief profile**, so extract that from the filing first. Then enrich with Tavily (`"{person} {company} {role}"`, prefer LinkedIn/company pages) and summarise in **2 lines**: previous roles, years of experience, where they came from. Show source links. For resignations, highlight the reason, whether it's a CXO, and whether a successor is named.
- **Everything else:** one-line summary for medium items; low items only appear as a collapsed group ("9 routine filings · ESOP allotments, trading window…").

### 6.4 Alerts (`run_alerts.py`, configurable)
- **Volume spike:** today's volume > `volume_multiple` × `volume_lookback`-day average.
- **Price move:** |1-day change| > `price_move_pct`.
- **Material announcement:** a new filing in one of the user's selected categories.
- Store each alert with the exact trigger ("Volume 3.4× its 20-day average"). Settings are editable from the UI (`PUT /api/settings/alerts`) and the pipeline re-evaluates on the next run.
- The UI also shows a "**Why it moved**" link: if a price/volume alert coincides with a filing on the same or previous day, link them.

---

## 7. Pull side — research grounded in primary sources

### 7.1 Views (build these, in this priority order)
1. **Promised vs. Delivered** ⭐ (the flagship; the challenge says they value this most):
   - For each of the last 4 concall transcripts, use **Flash** structured extraction to list explicit guidance: `{metric (revenue growth / EBITDA margin / capex / volume / other), target, timeframe, verbatim quote ≤ 25 words, page}`.
   - Match each promise against **actuals** from later quarters (results tables / screener quarterly data).
   - Use **Pro** (single call) to synthesise verdicts: `Delivered ✅ / Partial 🟡 / Missed ❌ / Too early ⏳`, a credibility score (e.g. 7/10 promises met), and 2–3 sentences on where narrative and numbers diverge.
   - UI: a vertical timeline of promises → outcomes, each with a quote and source chip.
2. **Snapshot**: what the company does, segments and revenue mix (donut), plus headline numbers: revenue, EBITDA margin, PAT, ROE/ROCE, D/E.
3. **Trajectory**: 5-year revenue/EBITDA/PAT bars and margin line; "growing" vs "compressing" chips.
4. **Cash quality**: CFO vs PAT (cash conversion %) over 5 years, FCF, working-capital days trend; a red flag if profits don't convert to cash.
5. **Balance sheet**: debt, D/E, interest coverage, working-capital cycle, contingent liabilities and RPT mentions from the AR notes.
6. **Guidance**: latest explicit guidance on headline numbers.
7. **Bull vs. Bear**: 3 tight points each, every point cited.

### 7.2 Grounding rules (enforce in prompts and code)
- Retrieval = **hybrid** (pgvector similarity + Postgres full-text), top-k ≈ 8 chunks per question, scoped to the company.
- The system prompt says: "Answer ONLY from the provided excerpts. Every claim must cite [doc, page]. If the excerpts don't contain it, say 'Not disclosed in sources reviewed.' Do not use outside knowledge."
- Every rendered claim has a tappable **source chip** (e.g. "AR FY26 · p.142", "Q1 FY27 concall · p.7") that opens the PDF at that page (`url#page=N`).
- Output is strict JSON (Gemini structured output / response schema) → rendered as designed UI components, **never as a wall of markdown**.

### 7.3 Model routing & cost (visible in the product)
- Flash: classification, one-liners, results extraction, guidance extraction, per-chunk summaries.
- Pro: only final synthesis for Promised vs Delivered and Bull/Bear.
- Cache everything (`llm_cache`, `research` tables). Pre-compute research for all 22 demo companies in GitHub Actions so the demo is instant.
- Log tokens and estimated cost per call. Show a subtle footer on each research view: "Generated with Flash ×6 + Pro ×1 · 18.4k tokens · ≈ ₹0.9 · cached 2h ago".

### 7.4 On-demand research for ANY NSE ticker (generalisation demo)
Vercel functions time out, so make it a **stepwise job**:
`POST /api/research/{symbol}/start` → creates `research_jobs` row → the frontend calls `POST /api/research/jobs/{id}/step` repeatedly; each step does one bounded unit of work (resolve company → fetch screener tables → fetch latest 2–4 concall transcripts → chunk + embed → extract guidance → synthesise) and stays well under the limit. The UI shows live progress ("Reading Q1 FY27 concall…"). For a new ticker, limit scope to the latest concalls + screener tables (+ AR MD&A if time allows) and say so in the UI.

---

## 8. API endpoints (FastAPI, all JSON)

```
GET  /api/health
GET  /api/portfolio                         → holdings + price, day change, sparkline (30d)
GET  /api/digest?window=24h|3d|7d|30d|custom&from=&to=
                                            → { material: [cards], medium: [items], routine: {count, items} }
GET  /api/alerts                            → triggered alerts (unseen first)
POST /api/alerts/{id}/seen
GET  /api/settings/alerts   PUT /api/settings/alerts
GET  /api/company/{symbol}                  → header info + latest price
GET  /api/research/{symbol}/{view}          → cached view or 404 (frontend then offers to generate)
POST /api/research/{symbol}/start           → job id
POST /api/research/jobs/{id}/step           → status, progress text
GET  /api/search?q=                         → ticker autocomplete (NSE symbol/name)
```
Add CORS for local dev. Every endpoint falls back to `data/snapshots/*.json` if the DB is unreachable, so the demo never shows an empty screen.

`vercel.json`: route `/api/(.*)` to `api/index.py`; Next.js handles everything else. Confirm the Next.js + Python setup works on a real Vercel deploy early (Phase 1).

---

## 9. Frontend — product & design

### 9.1 Interaction model (the point of view)
The thesis: **"An investor's day starts with a 60-second brief, not a dashboard."** FINN is a calm, ranked feed that you clear like an inbox, plus a research desk you can ask about any company.

Bottom tab bar (thumb-reachable, 4 tabs):
1. **Brief** (home): greeting + "3 things that matter today" hero line, then a time-window segmented control (24h · 3d · 7d · Custom). Material cards first (results / management / M&A…), then medium one-liners, then a collapsed "Routine (N)" accordion. **Swipe right = mark read, swipe left = snooze.** "You're all caught up ✓" empty state.
2. **Alerts**: triggered alerts with the exact trigger and a "why it moved" link; a settings sheet with sliders for volume multiple, lookback days, price %, and category toggles.
3. **Ask**: a search/command bar ("Search any NSE company…") with autocomplete; recent and watchlist chips; tapping a company opens `/company/[symbol]`. Optional stretch: mic button using the Web Speech API for voice queries.
4. **Portfolio**: holdings list with price, day %, P&L, 30-day sparkline, and a badge if the company has an unread material filing.

**Company page**: sticky header (name, price, day %), then horizontally scrollable view tabs: **Promised vs Delivered** (default) · Snapshot · Trajectory · Cash · Balance Sheet · Guidance · Bull/Bear. Each view is designed cards and charts with source chips, plus the cost/model footer.

### 9.2 Visual design (no AI slop)
- Aesthetic: **calm editorial finance**, like a premium terminal reimagined for a phone. **Dark mode default** with a light-mode toggle.
- Palette: near-black background `#0B0D10`, surfaces `#14171C`, hairline borders `#23272F`, text `#E8EAED` / muted `#8A9099`, one accent (e.g. electric teal `#2DD4BF`), gains `#22C55E`, losses `#EF4444`, amber for "partial". **No purple gradients, no emoji clutter, no generic hero illustrations.**
- Type: **Inter** for UI; **JetBrains Mono or Inter with `tabular-nums`** for all numbers. Indian number formatting (₹1,23,456; ₹ Cr).
- Density: information-dense but breathable. 14–15px body, clear hierarchy, 12px muted metadata. Cards with 16px radius, subtle borders, no heavy shadows.
- Motion: Framer Motion for card enter, swipe gestures, sheet transitions, skeleton shimmer loaders. Keep it subtle (150–250 ms).
- Mobile-first at 390px width; on desktop, centre a phone-width column with a soft frame so judges on laptops still see the mobile experience.
- Copy: short, specific, numeric. LLM prompts enforce brevity ("≤ 18 words, no adjectives like 'robust', 'impressive', 'significant'").
- Accessibility: 44px tap targets, colour is never the only signal (▲▼ icons).

---

## 10. GitHub Actions

- `daily_refresh.yml`: cron **13:00 UTC (6:30 pm IST) Mon–Fri**, plus `workflow_dispatch`. Runs refresh_prices → fetch_announcements → classify_and_enrich → run_alerts → exports `data/snapshots/*.json` and commits them (so the fallback stays fresh).
- `ingest.yml`: `workflow_dispatch` only. Runs ingest_documents + precompute_research for all demo companies.
- Secrets: `DATABASE_URL`, `GEMINI_API_KEY`, `TAVILY_API_KEY`, model env vars.

---

## 11. Build phases (execute in order; each ends deployable)

**Phase 1 — Skeleton & deploy (do first).** Scaffold Next.js + FastAPI in one repo, add `vercel.json`, create the `/api/health` endpoint, add the mobile shell with 4 tabs and dummy data, and deploy to Vercel. ✅ The live URL works on a phone and `/api/health` returns OK.

**Phase 2 — Data plumbing.** Supabase schema, portfolio.json, BSE code resolver, price refresh, announcement fetch, rule-based classification. Run locally and populate the DB. ✅ `/api/portfolio` and `/api/digest` return real data.

**Phase 3 — Push intelligence.** Flash classification for ambiguous items, priority scoring, results card extraction, management-change card with Tavily, alerts engine + settings, LLM cache. ✅ The Brief tab shows a ranked real digest with at least one real results card (Q2 FY27 results season is under way, so there should be many).

**Phase 4 — Pull research.** Document ingestion for the demo companies, hybrid retrieval, Promised vs Delivered (flagship), Snapshot, Trajectory, Cash quality, Bull/Bear, citations, cost footer, precompute. ✅ The company page renders all views instantly for demo companies with working source chips.

**Phase 5 — Generalisation.** Stepwise on-demand research job for any NSE ticker with a progress UI. ✅ Researching a ticker not in the list (e.g. NESTLEIND) completes on the deployed app.

**Phase 6 — Polish & ship.** Design pass (spacing, motion, empty/loading/error states), PWA install, snapshot fallbacks, GitHub Actions, README, WRITEUP.md. ✅ Full flow works on a real phone from the Vercel URL, with no console errors.

If time runs short, **cut scope from the end of the list in 7.1 and from Phase 5, never from polish of what exists.**

---

## 12. README.md & WRITEUP.md

**README.md**: one-paragraph pitch, live link, screenshots/GIF, architecture diagram (Mermaid), data flow, model routing table (which model does what and why), cost per run, local setup, env vars, how to run the pipeline, known limitations.

**WRITEUP.md** (draft for my covering email, ≤ 400 words, in first person):
1. **What I built**: FINN's thesis (the brief, not a dashboard) and the 2 flagship workflows (ranked digest with rich results/management cards; Promised vs Delivered).
2. **Key decisions & trade-offs**: rule-first classification before the LLM; Flash/Pro routing; caching; selective AR section embedding; BSE over NSE for reliability; GitHub Actions for heavy jobs vs Vercel for serving; pre-computed snapshots for demo reliability; bank-specific results metrics.
3. **What I deliberately left out**: real push notifications/auth/multi-user, intraday data, full AR ingestion for arbitrary tickers, broker/news data (by design).
4. **Where I'd take it next**: web push + WhatsApp digest, per-user learning of what they open/dismiss to tune priority, guidance tracker across all holdings, peer comparisons, voice-first morning brief.

---

## 13. Quality bar & rules for you (the agent)

- Write clean, typed, modular code with docstrings on every non-trivial function. No dead code. No secrets in the repo.
- Handle every external failure gracefully (timeouts, 403s, empty PDFs, missing transcripts). Show a friendly UI state, never a stack trace.
- Never invent financial numbers. If extraction fails, show "Couldn't extract — view filing" with the PDF link.
- Commit after every phase with clear messages (my AI build history is part of the submission).
- Before calling a phase done, run the app, hit the endpoints, and check the UI at 390px width.
- Ask me before changing the stack, adding paid services, or dropping a flagship feature.
