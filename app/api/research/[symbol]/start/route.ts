import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const job_id = `job_${params.symbol.toLowerCase()}_${Date.now()}`;
  return NextResponse.json({
    job_id,
    symbol: params.symbol.toUpperCase(),
    status: "started"
  });
}

