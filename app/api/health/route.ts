import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "FINN Financial Investment Agent",
    mode: "primary-sources-engine"
  });
}

