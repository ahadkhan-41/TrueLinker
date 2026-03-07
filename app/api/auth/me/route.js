import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/store";
import { getSessionEmail } from "@/lib/session";

export async function GET() {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const user = getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
