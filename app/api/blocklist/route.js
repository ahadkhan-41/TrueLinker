import { NextResponse } from "next/server";
import { createBlocklist, listBlocklist } from "@/lib/store";
import { getSessionEmail } from "@/lib/session";

export async function GET() {
  return NextResponse.json({ blocklist: listBlocklist() });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!body.value) {
    return NextResponse.json({ error: "Value is required" }, { status: 400 });
  }
  const email = await getSessionEmail();
  const entry = createBlocklist(body.value, email || "system");
  return NextResponse.json({ entry });
}
