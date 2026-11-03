import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    volume_multiple: 2.0,
    volume_lookback: 20,
    price_move_pct: 5.0,
    categories: ["results", "M&A", "management_change", "fund_raise", "litigation"]
  });
}

export async function PUT(req: Request) {
  const body = await req.json();
  return NextResponse.json({ status: "updated", settings: body });
}

