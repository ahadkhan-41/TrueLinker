import { NextResponse } from "next/server";
import { scanEmail } from "@/lib/store";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const result = scanEmail(body.email_content || "");
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
