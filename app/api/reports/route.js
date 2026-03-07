import { NextResponse } from "next/server";
import { createReport, listReports } from "@/lib/store";
import { getSessionEmail } from "@/lib/session";

export async function GET() {
  return NextResponse.json({ reports: listReports() });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!body.url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }
  const email = await getSessionEmail();
  const report = createReport({ ...body, reportedBy: email || "anonymous" });
  return NextResponse.json({ report });
}
