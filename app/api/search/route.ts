import { NextResponse } from "next/server";
import portfolioData from "@/data/portfolio.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toUpperCase();

  const all = [...portfolioData.portfolio, ...portfolioData.watchlist];
  const filtered = all.filter(
    (c) => c.symbol.includes(q) || c.name.toUpperCase().includes(q)
  );

  return NextResponse.json(filtered.slice(0, 8));
}

