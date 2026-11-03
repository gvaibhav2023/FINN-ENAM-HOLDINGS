"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR, formatPct } from "@/lib/utils";
import { PieChart, TrendingUp, ChevronRight, AlertCircle } from "lucide-react";

interface Holding {
  symbol: string;
  name: string;
  sector: string;
  qty: number;
  avg_price: number;
  current_price: number;
  day_change_pct: number;
  total_value: number;
  pnl_pct: number;
  has_unread_filing: boolean;
  sparkline?: number[];
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        setHoldings(data.holdings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalPortfolioValue = holdings.reduce((sum, h) => sum + (h.total_value || 0), 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.qty * h.avg_price || 0), 0);
  const totalPnlPct = totalCost > 0 ? ((totalPortfolioValue - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="space-y-4 pb-6">
      {/* Portfolio Summary Card */}
      <div className="bg-[#14171C] rounded-2xl p-4 border border-[#23272F] space-y-3">
        <div className="flex justify-between items-center text-xs text-[#8A9099]">
          <span className="font-semibold uppercase tracking-wider">Indian Equity Portfolio</span>
          <span>18 Holdings</span>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold font-mono text-[#E8EAED]">
              {formatINR(totalPortfolioValue, { decimals: 0 })}
            </div>
            <div className="text-xs text-[#8A9099] mt-0.5">
              Invested: <span className="font-mono">{formatINR(totalCost, { decimals: 0 })}</span>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-sm font-bold font-mono ${
                totalPnlPct >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"
              }`}
            >
              {formatPct(totalPnlPct)}
            </div>
            <div className="text-[10px] text-[#8A9099]">Total P&L</div>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1 text-xs text-[#8A9099] font-semibold uppercase tracking-wider">
          <span>Company / Holding</span>
          <span>Current / Day %</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-[#14171C] rounded-xl animate-pulse border border-[#23272F]" />
            ))}
          </div>
        ) : (
          holdings.map((h) => (
            <Link
              key={h.symbol}
              href={`/company/${h.symbol}`}
              className="bg-[#14171C] rounded-xl p-3 border border-[#23272F] flex items-center justify-between hover:border-[#2DD4BF]/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#E8EAED]">{h.symbol}</span>
                    {h.has_unread_filing && (
                      <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" title="Unread material disclosure" />
                    )}
                  </div>
                  <div className="text-xs text-[#8A9099] font-mono">
                    {h.qty} shares @ {formatINR(h.avg_price, { decimals: 0 })}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold font-mono text-sm text-[#E8EAED]">
                  {formatINR(h.current_price, { decimals: 2 })}
                </div>
                <div
                  className={`text-xs font-mono font-medium ${
                    h.day_change_pct >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"
                  }`}
                >
                  {formatPct(h.day_change_pct)}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

