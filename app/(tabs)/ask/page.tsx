"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, TrendingUp, Compass, ArrowRight } from "lucide-react";

const POPULAR_TICKERS = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Oil & Gas / Retail" },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking" },
  { symbol: "TRENT", name: "Trent Ltd", sector: "Retail" },
  { symbol: "DIXON", name: "Dixon Tech", sector: "EMS / Electronics" },
  { symbol: "PERSISTENT", name: "Persistent Systems", sector: "IT Services" },
  { symbol: "KPITTECH", name: "KPIT Technologies", sector: "Auto Software" },
  { symbol: "HAL", name: "Hindustan Aeronautics", sector: "Defense" },
];

export default function AskPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setResults(data || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (symbol: string) => {
    router.push(`/company/${symbol}`);
  };

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-xl font-bold text-[#E8EAED] tracking-tight">Primary Source Research</h1>
        <p className="text-xs text-[#8A9099] mt-0.5">
          Grounded strictly in Annual Reports, concall transcripts & SEBI filings. No broker notes.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8A9099] absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search any NSE symbol or company (e.g. TRENT, HAL)..."
          className="w-full bg-[#14171C] border border-[#23272F] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#E8EAED] placeholder-[#8A9099] focus:outline-none focus:border-[#2DD4BF]"
        />
      </div>

      {/* Live Autocomplete Results */}
      {query.trim().length >= 2 && (
        <div className="bg-[#14171C] rounded-2xl border border-[#23272F] overflow-hidden divide-y divide-[#23272F]">
          {searching ? (
            <div className="p-4 text-xs text-[#8A9099] text-center">Searching universe...</div>
          ) : results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.symbol}
                onClick={() => handleSelect(r.symbol)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#23272F]/50 transition"
              >
                <div>
                  <div className="font-bold text-sm text-[#E8EAED]">{r.symbol}</div>
                  <div className="text-xs text-[#8A9099]">{r.name} • {r.sector}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A9099]" />
              </button>
            ))
          ) : (
            <button
              onClick={() => handleSelect(query.toUpperCase().trim())}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#23272F]/50 transition"
            >
              <div>
                <div className="font-bold text-sm text-[#2DD4BF]">Initiate Research on '{query.toUpperCase()}'</div>
                <div className="text-xs text-[#8A9099]">Synthesize on-demand from live screener + transcripts</div>
              </div>
              <Sparkles className="w-4 h-4 text-[#2DD4BF]" />
            </button>
          )}
        </div>
      )}

      {/* Watchlist & Popular Quick Access */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8A9099] uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-[#2DD4BF]" /> Precomputed Research Desk
        </div>
        <div className="space-y-2">
          {POPULAR_TICKERS.map((t) => (
            <button
              key={t.symbol}
              onClick={() => handleSelect(t.symbol)}
              className="w-full bg-[#14171C] border border-[#23272F] rounded-xl p-3 flex items-center justify-between hover:border-[#2DD4BF]/40 transition text-left"
            >
              <div>
                <div className="font-bold text-sm text-[#E8EAED]">{t.symbol}</div>
                <div className="text-xs text-[#8A9099]">{t.name} • {t.sector}</div>
              </div>
              <div className="text-[11px] text-[#2DD4BF] font-mono px-2 py-0.5 rounded bg-[#2DD4BF]/10">
                Instant Brief →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

