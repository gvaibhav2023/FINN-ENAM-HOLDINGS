import { NextResponse } from "next/server";
import portfolioSnapshot from "@/data/snapshots/portfolio.json";

export async function GET() {
  return NextResponse.json(portfolioSnapshot);
}

