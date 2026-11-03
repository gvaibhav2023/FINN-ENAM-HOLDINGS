"use client";

import { useState, useEffect } from "react";
import { formatINR, formatPct } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2, ChevronRight, FileText, UserCheck } from "lucide-react";
import Link from "next/link";

interface MaterialCard {
  id: string;
  symbol: string;
  company_name: string;
  category: string;
  card_type: string;
  headline: string;
  one_liner: string;
  card_payload?: any;
  filed_at: string;
  attachment_url?: string;
  read?: boolean;
}

export default function BriefPage() {
  const [window, setWindow] = useState("24h");
  const [items, setItems] = useState<MaterialCard[]>([]);
  const [medium, setMedium] = useState<any[]>([]);
  const [routine, setRoutine] = useState<{ count: number; items: any[] }>({ count: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [routineOpen, setRoutineOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/digest?window=${window}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.material || []);
        setMedium(data.medium || []);
        setRoutine(data.routine || { count: 0, items: [] });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [window]);

  const markRead = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header Greeting */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2DD4BF] uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" /> FINN Daily Executive Brief
        </div>
        <h1 className="text-xl font-bold text-[#E8EAED] tracking-tight">
          3 things that matter today
        </h1>
        <p className="text-xs text-[#8A9099] mt-0.5">
          Curated primary filings across your 18 portfolio holdings.
        </p>
      </div>

      {/* Segmented Time Filter */}
      <div className="flex bg-[#14171C] p-1 rounded-xl border border-[#23272F]">
        {["24h", "3d", "7d", "30d"].map((t) => (
          <button
            key={t}
            onClick={() => setWindow(t)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              window === t
                ? "bg-[#23272F] text-[#E8EAED] shadow-sm font-semibold"
                : "text-[#8A9099] hover:text-[#E8EAED]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[#14171C] rounded-2xl animate-pulse border border-[#23272F]" />
          ))}
        </div>
      ) : items.length === 0 && medium.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#14171C]/50 rounded-2xl border border-[#23272F]">
          <CheckCircle2 className="w-10 h-10 text-[#2DD4BF] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#E8EAED]">You're all caught up</h3>
          <p className="text-xs text-[#8A9099] mt-1">
            No unread material disclosures in this time window.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Material Cards */}
          {items.map((card) => (
            <div
              key={card.id}
              className="bg-[#14171C] rounded-2xl p-4 border border-[#23272F] shadow-sm relative group transition hover:border-[#2DD4BF]/40"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/company/${card.symbol}`}
                    className="text-sm font-bold text-[#E8EAED] hover:text-[#2DD4BF] flex items-center gap-1"
                  >
                    {card.symbol}
                    <ChevronRight className="w-3.5 h-3.5 text-[#8A9099]" />
                  </Link>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#23272F] text-[#2DD4BF]">
                    {card.category.replace("_", " ")}
                  </span>
                </div>
                <button
                  onClick={() => markRead(card.id)}
                  title="Mark as read"
                  className="text-xs text-[#8A9099] hover:text-[#2DD4BF] p-1"
                >
                  ✓
                </button>
              </div>

              <h4 className="text-sm font-semibold text-[#E8EAED] leading-snug mb-1">
                {card.headline}
              </h4>
              <p className="text-xs text-[#8A9099] mb-3 leading-relaxed">
                {card.one_liner}
              </p>

              {/* Rich Card: Results */}
              {card.card_type === "results" && card.card_payload && (
                <div className="bg-[#0B0D10] rounded-xl p-3 border border-[#23272F] text-xs space-y-2 mb-3">
                  <div className="grid grid-cols-4 font-mono text-[11px] text-[#8A9099] border-b border-[#23272F] pb-1">
                    <span>Metric</span>
                    <span className="text-right">Q-Current</span>
                    <span className="text-right">YoY %</span>
                    <span className="text-right">QoQ %</span>
                  </div>
                  {card.card_payload.rows?.map((row: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-4 font-mono text-[11px] items-center">
                      <span className="text-[#E8EAED] font-sans font-medium">{row.label}</span>
                      <span className="text-right text-[#E8EAED] font-semibold">
                        {row.is_currency ? formatINR(row.curr, { isCr: true, decimals: 0 }) : `${row.curr}%`}
                      </span>
                      <span
                        className={`text-right flex items-center justify-end ${
                          row.yoy >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"
                        }`}
                      >
                        {formatPct(row.yoy)}
                      </span>
                      <span
                        className={`text-right flex items-center justify-end ${
                          row.qoq >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"
                        }`}
                      >
                        {formatPct(row.qoq)}
                      </span>
                    </div>
                  ))}
                  {card.card_payload.margin_comment && (
                    <div className="text-[11px] text-[#2DD4BF] pt-1 border-t border-[#23272F]/50 flex items-center gap-1">
                      <span>Margin:</span> {card.card_payload.margin_comment}
                    </div>
                  )}
                </div>
              )}

              {/* Rich Card: Management Change */}
              {card.card_type === "management_change" && card.card_payload && (
                <div className="bg-[#0B0D10] rounded-xl p-3 border border-[#23272F] text-xs space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#2DD4BF]" />
                    <span className="font-semibold text-[#E8EAED]">{card.card_payload.person}</span>
                    <span className="text-[#8A9099]">→</span>
                    <span className="text-[#2DD4BF] font-medium">{card.card_payload.role}</span>
                  </div>
                  <div className="text-[11px] text-[#8A9099] leading-relaxed">
                    {card.card_payload.bio_summary}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#8A9099] pt-2 border-t border-[#23272F]/50">
                <span>{new Date(card.filed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                {card.attachment_url && (
                  <a
                    href={card.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#2DD4BF] hover:underline"
                  >
                    <FileText className="w-3 h-3" /> View Original Filing
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Medium Priority Section */}
          {medium.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A9099]">
                Noteworthy Updates
              </h3>
              {medium.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#14171C]/70 rounded-xl p-3 border border-[#23272F] flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link href={`/company/${item.symbol}`} className="text-xs font-bold text-[#E8EAED] hover:text-[#2DD4BF]">
                        {item.symbol}
                      </Link>
                      <span className="text-[10px] text-[#8A9099]">• {item.category}</span>
                    </div>
                    <p className="text-xs text-[#E8EAED]">{item.one_liner || item.headline}</p>
                  </div>
                  {item.attachment_url && (
                    <a
                      href={item.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#8A9099] hover:text-[#2DD4BF] p-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Routine Disclosures Collapsible */}
          {routine.count > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setRoutineOpen(!routineOpen)}
                className="w-full py-2.5 px-3 bg-[#14171C]/40 border border-[#23272F] rounded-xl text-xs text-[#8A9099] flex items-center justify-between hover:text-[#E8EAED]"
              >
                <span>
                  {routine.count} routine filings · ESOPs, trading windows, compliance
                </span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${routineOpen ? "rotate-90" : ""}`} />
              </button>

              {routineOpen && (
                <div className="mt-2 space-y-1.5 pl-2 border-l border-[#23272F]">
                  {routine.items.map((r, i) => (
                    <div key={i} className="text-[11px] text-[#8A9099] flex items-center justify-between py-1">
                      <span>
                        <strong className="text-[#E8EAED]">{r.symbol}:</strong> {r.headline}
                      </span>
                      {r.attachment_url && (
                        <a href={r.attachment_url} target="_blank" rel="noreferrer" className="text-[#2DD4BF] ml-2">
                          PDF
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

