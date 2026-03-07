import { NextResponse } from "next/server";
import { deleteBlocklist } from "@/lib/store";

export async function DELETE(_request, { params }) {
  const { id } = params;
  const ok = deleteBlocklist(id);
  if (!ok) return NextResponse.json({ error: "Blocklist entry not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
