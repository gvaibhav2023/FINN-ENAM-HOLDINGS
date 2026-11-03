import { NextResponse } from "next/server";
import portfolioData from "@/data/portfolio.json";

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const sym = params.symbol.toUpperCase();
  const all = [...portfolioData.portfolio, ...portfolioData.watchlist];
  const found = all.find((c) => c.symbol === sym);

  if (found) {
    return NextResponse.json({
      symbol: found.symbol,
      name: found.name,
      sector: found.sector,
      current_price: (found as any).avg_price || 2840.0,
      day_change_pct: 1.25,
    });
  }

  return NextResponse.json({
    symbol: sym,
    name: `${sym} India Ltd`,
    sector: "Indian Equities",
    current_price: 1850.0,
    day_change_pct: 0.85,
  });
}

