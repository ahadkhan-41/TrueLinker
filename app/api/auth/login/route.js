import { NextResponse } from "next/server";
import { authenticate } from "@/lib/store";
import { setSession } from "@/lib/session";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const user = authenticate(body.email, body.password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  await setSession(user.email);
  return NextResponse.json({ ok: true, user });
}
