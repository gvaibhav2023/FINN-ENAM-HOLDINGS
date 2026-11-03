import { NextResponse } from "next/server";
import digestSnapshot from "@/data/snapshots/digest.json";

export async function GET() {
  return NextResponse.json(digestSnapshot);
}

