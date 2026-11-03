# ENAM Holdings AI Engineer Build Challenge Submission — Covering Note

**Author:** AI Engineer Candidate  
**Product:** FINN — Financial Investment Agent  
**Submission Focus:** Mobile-First Primary Source Investment Agent for Indian Equity Investors

---

### 1. What I Built
I designed and engineered **FINN**, an installable, mobile-first financial investment agent tailored for Indian equity investors. Rather than flooding the user with another generic dashboard or chat interface that hallucinates broker rumors, FINN is structured around a central point of view: **an investor's day starts with a 60-second ranked brief, followed by grounded primary source deep dives.**

FINN delivers on two high-leverage workflows:
- **Push Intelligence**: Ingests corporate disclosures directly from BSE/NSE, categorizing them via a rule-first taxonomy before escalating ambiguous ones to Gemini Flash. Material disclosures (such as Q2 FY25 results or C-suite transitions) are structured into custom cards featuring YoY/QoQ deltas, margin shift commentary, and executive career summaries.
- **Pull Research (Promised vs. Delivered)**: FINN’s flagship feature ingests historical concall transcripts, extracts verifiable management guidance (verbatim quotes with exact page references), and audits them against subsequent audited filings to yield an executive Credibility Score (e.g. 8/10 promises met).

---

### 2. Key Decisions & Architectural Trade-offs
- **Cost-Centric Model Routing**: To minimize inference cost, routine disclosures (ESOPs, compliance certificates) are classified by deterministic rule-based algorithms at ₹0 cost. Fast, structured extraction tasks use Gemini Flash, while Gemini Pro is reserved exclusively for synthesizing nuanced promises versus delivered metrics.
- **Selective Annual Report Chunking**: Ingesting entire 400-page Annual Reports introduces noise and excessive token consumption. The ingestion pipeline programmatically filters for high-signal sections (MD&A, Auditor’s Notes, Segment Results, Borrowings).
- **Vercel Serverless + GitHub Actions Cron Separation**: Heavy batch downloads and vector embeddings are executed on GitHub Actions cron runners, preserving lightweight Vercel serverless functions strictly for low-latency JSON delivery.
- **Pre-computed Fallback Snapshots**: Every API endpoint falls back seamlessly to versioned local snapshots (`data/snapshots/`), ensuring zero broken UI states during offline evaluation.

---

### 3. What I Deliberately Left Out
- **Intraday Tick Streaming & Rumor Feeds**: Excluded by design to maintain a calm, high-signal focus strictly on audited, primary SEBI disclosures.
- **Complex Multi-Tenant Auth**: Prioritized building a delightful, information-dense, single-investor mobile experience.

---

### 4. Next Steps
- Automated WhatsApp & Web Push Morning Digests.
- Fine-tuned behavioral prioritization learning from user dismissal patterns.
- Cross-portfolio capex and guidance tracking across sector peers.

