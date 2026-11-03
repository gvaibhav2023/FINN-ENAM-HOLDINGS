"use client";

import { useState, useEffect } from "react";
import { Bell, Sliders, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { formatPct } from "@/lib/utils";

interface AlertItem {
  id: number;
  symbol: string;
  type: string;
  triggered_at: string;
  value: number;
  threshold: number;
  message: string;
  announcement_id?: number | null;
  announcement_headline?: string;
  seen: boolean;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    volume_multiple: 2.0,
    volume_lookback: 20,
    price_move_pct: 5.0,
    categories: ["results", "M&A", "management_change", "fund_raise", "litigation"],
  });

  useEffect(() => {
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/settings/alerts")
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/settings/alerts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setShowSettings(false);
  };

  const markSeen = async (id: number) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, seen: true } : a)));
    await fetch(`/api/alerts/${id}/seen`, { method: "POST" });
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#E8EAED] tracking-tight">Price & Volume Triggers</h1>
          <p className="text-xs text-[#8A9099]">Thresholds evaluated against EOD prices & corporate filings.</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-[#14171C] border border-[#23272F] rounded-xl text-[#8A9099] hover:text-[#2DD4BF]"
          title="Threshold Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Modal Sheet */}
      {showSettings && (
        <form onSubmit={saveSettings} className="bg-[#14171C] p-4 rounded-2xl border border-[#2DD4BF]/40 space-y-4">
          <div className="flex justify-between items-center border-b border-[#23272F] pb-2">
            <h3 className="text-sm font-semibold text-[#E8EAED]">Alert Threshold Settings</h3>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-xs text-[#8A9099] hover:text-[#E8EAED]"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[#8A9099] mb-1">
                <span>Volume Spike Multiplier</span>
                <span className="text-[#2DD4BF] font-mono font-bold">{settings.volume_multiple}x</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="5.0"
                step="0.1"
                value={settings.volume_multiple}
                onChange={(e) => setSettings({ ...settings, volume_multiple: parseFloat(e.target.value) })}
                className="w-full accent-[#2DD4BF]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#8A9099] mb-1">
                <span>Lookback Days for Average Volume</span>
                <span className="text-[#2DD4BF] font-mono font-bold">{settings.volume_lookback} days</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={settings.volume_lookback}
                onChange={(e) => setSettings({ ...settings, volume_lookback: parseInt(e.target.value) })}
                className="w-full accent-[#2DD4BF]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#8A9099] mb-1">
                <span>1-Day Price Move (%)</span>
                <span className="text-[#2DD4BF] font-mono font-bold">{settings.price_move_pct}%</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="10.0"
                step="0.5"
                value={settings.price_move_pct}
                onChange={(e) => setSettings({ ...settings, price_move_pct: parseFloat(e.target.value) })}
                className="w-full accent-[#2DD4BF]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#2DD4BF] text-[#0B0D10] font-bold text-xs rounded-xl hover:bg-[#26bba7] transition"
          >
            Save & Re-evaluate
          </button>
        </form>
      )}

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#14171C] rounded-xl animate-pulse border border-[#23272F]" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 bg-[#14171C]/50 rounded-2xl border border-[#23272F]">
          <Bell className="w-8 h-8 text-[#8A9099] mx-auto mb-2 opacity-50" />
          <p className="text-xs text-[#8A9099]">No active price or volume spikes triggered.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => markSeen(alert.id)}
              className={`p-3.5 rounded-2xl border transition ${
                alert.seen
                  ? "bg-[#14171C]/50 border-[#23272F] opacity-75"
                  : "bg-[#14171C] border-[#23272F] hover:border-[#2DD4BF]/50"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#E8EAED]">{alert.symbol}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      alert.type === "price_move"
                        ? alert.value >= 0
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "bg-[#EF4444]/10 text-[#EF4444]"
                        : "bg-[#2DD4BF]/10 text-[#2DD4BF]"
                    }`}
                  >
                    {alert.type === "price_move"
                      ? `${alert.value >= 0 ? "+" : ""}${alert.value.toFixed(1)}% Move`
                      : `${alert.value.toFixed(1)}x Vol Spike`}
                  </span>
                </div>
                <span className="text-[10px] text-[#8A9099]">
                  {new Date(alert.triggered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <p className="text-xs text-[#E8EAED] mt-1">{alert.message}</p>

              {/* Why it moved correlation */}
              {alert.announcement_headline && (
                <div className="mt-2 pt-2 border-t border-[#23272F] text-[11px] text-[#2DD4BF] flex items-center gap-1">
                  <span>Why it moved:</span>
                  <span className="text-[#8A9099] line-clamp-1">{alert.announcement_headline}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

