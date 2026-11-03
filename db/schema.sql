-- Extension for vector similarity embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Companies Master (Portfolio + Research Watchlist)
CREATE TABLE IF NOT EXISTS companies (
    symbol VARCHAR(30) PRIMARY KEY,
    bse_code VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    mcap_bucket VARCHAR(20) DEFAULT 'mid', -- large, mid, small
    in_portfolio BOOLEAN DEFAULT FALSE,
    qty INTEGER DEFAULT 0,
    avg_price NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Daily OHLCV Prices
CREATE TABLE IF NOT EXISTS prices (
    symbol VARCHAR(30) REFERENCES companies(symbol) ON DELETE CASCADE,
    date DATE NOT NULL,
    open NUMERIC(12, 2),
    high NUMERIC(12, 2),
    low NUMERIC(12, 2),
    close NUMERIC(12, 2),
    volume BIGINT,
    PRIMARY KEY(symbol, date)
);
CREATE INDEX IF NOT EXISTS idx_prices_sym_date ON prices(symbol, date DESC);

-- 3. Corporate Announcements & Disclosures
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(100) PRIMARY KEY,
    symbol VARCHAR(30) REFERENCES companies(symbol) ON DELETE CASCADE,
    bse_code VARCHAR(20),
    filed_at TIMESTAMPTZ NOT NULL,
    headline TEXT NOT NULL,
    raw_category TEXT,
    raw_subcategory TEXT,
    attachment_url TEXT,
    category VARCHAR(50) DEFAULT 'unclassified',
    materiality SMALLINT DEFAULT 1, -- 0 (routine) to 3 (critical)
    one_liner TEXT,
    card_type VARCHAR(50) DEFAULT 'general', -- results, management_change, general
    card_payload JSONB DEFAULT '{}'::jsonb,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_announcements_filed ON announcements(filed_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_sym ON announcements(symbol);

-- 4. Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(30) REFERENCES companies(symbol) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- volume_spike, price_move, material_announcement
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    value NUMERIC(12, 2),
    threshold NUMERIC(12, 2),
    message TEXT NOT NULL,
    announcement_id VARCHAR(100) REFERENCES announcements(id) ON DELETE SET NULL,
    seen BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_alerts_unseen ON alerts(seen, triggered_at DESC);

-- 5. User Configurable Alert Settings
CREATE TABLE IF NOT EXISTS alert_settings (
    id INT PRIMARY KEY DEFAULT 1,
    volume_multiple NUMERIC(5, 2) DEFAULT 2.0,
    volume_lookback INT DEFAULT 20,
    price_move_pct NUMERIC(5, 2) DEFAULT 5.0,
    categories TEXT[] DEFAULT '{results,M&A,management_change,fund_raise,litigation,credit_rating,pledging}'
);

INSERT INTO alert_settings (id, volume_multiple, volume_lookback, price_move_pct, categories)
VALUES (1, 2.0, 20, 5.0, '{results,M&A,management_change,fund_raise,litigation,credit_rating,pledging}')
ON CONFLICT (id) DO NOTHING;

-- 6. Document Metadata (Annual Reports & Concalls)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(30) REFERENCES companies(symbol) ON DELETE CASCADE,
    doc_type VARCHAR(30) NOT NULL, -- annual_report, concall, results
    period_label VARCHAR(50), -- e.g. FY24, Q1 FY25
    url TEXT,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    page_count INT DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_docs_symbol ON documents(symbol);

-- 7. Document Chunks & Vector Embeddings
CREATE TABLE IF NOT EXISTS chunks (
    id SERIAL PRIMARY KEY,
    document_id INT REFERENCES documents(id) ON DELETE CASCADE,
    symbol VARCHAR(30) REFERENCES companies(symbol) ON DELETE CASCADE,
    page INT NOT NULL,
    text TEXT NOT NULL,
    embedding vector(768), -- Gemini embedding dimension (or 1536 depending on model)
    tsv TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', text)) STORED
);
CREATE INDEX IF NOT EXISTS idx_chunks_sym ON chunks(symbol);
CREATE INDEX IF NOT EXISTS idx_chunks_tsv ON chunks USING GIN(tsv);

-- 8. Synthesized Research Views
CREATE TABLE IF NOT EXISTS research (
    symbol VARCHAR(30) REFERENCES companies(symbol) ON DELETE CASCADE,
    view VARCHAR(50) NOT NULL, -- promised_vs_delivered, snapshot, trajectory, cash, balance_sheet, guidance, bull_bear
    payload JSONB NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    model VARCHAR(100),
    tokens_in INT DEFAULT 0,
    tokens_out INT DEFAULT 0,
    cost_usd NUMERIC(10, 6) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(symbol, view)
);

-- 9. LLM Execution Cache
CREATE TABLE IF NOT EXISTS llm_cache (
    key VARCHAR(64) PRIMARY KEY, -- sha256(model + prompt)
    model VARCHAR(100),
    response JSONB NOT NULL,
    tokens_in INT DEFAULT 0,
    tokens_out INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Stepwise Research Jobs
CREATE TABLE IF NOT EXISTS research_jobs (
    id VARCHAR(50) PRIMARY KEY,
    symbol VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending', -- pending, running, completed, failed
    step INT DEFAULT 0,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

