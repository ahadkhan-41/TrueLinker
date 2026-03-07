import { NextResponse } from "next/server";
import { updateReport } from "@/lib/store";

export async function PATCH(request, { params }) {
  const { id } = params;
  const patch = await request.json().catch(() => ({}));
  const report = updateReport(id, patch);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  return NextResponse.json({ report });
}
