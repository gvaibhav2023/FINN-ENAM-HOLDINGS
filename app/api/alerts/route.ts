import { NextResponse } from "next/server";
import alertsSnapshot from "@/data/snapshots/alerts.json";

export async function GET() {
  return NextResponse.json(alertsSnapshot);
}

