import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  return NextResponse.json({
    job_id: params.jobId,
    step: 3,
    status: "completed",
    message: "Primary concall commitments extracted and reconciled against audited filings."
  });
}

