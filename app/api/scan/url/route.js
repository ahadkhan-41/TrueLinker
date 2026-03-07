import { NextResponse } from "next/server";
import { scanUrl } from "@/lib/store";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const result = scanUrl(body.url);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
