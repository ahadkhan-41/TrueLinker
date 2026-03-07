import { NextResponse } from "next/server";
import { deleteIncident, updateIncident } from "@/lib/store";

export async function PATCH(request, { params }) {
  const { id } = params;
  const patch = await request.json().catch(() => ({}));
  const updated = updateIncident(id, patch);
  if (!updated) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  return NextResponse.json({ incident: updated });
}

export async function DELETE(_request, { params }) {
  const { id } = params;
  const ok = deleteIncident(id);
  if (!ok) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
