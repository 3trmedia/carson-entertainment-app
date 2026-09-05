import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminRequest } from "@/lib/adminAuth";

export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const key = body?.key;
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const sub = typeof body?.sub === "string" ? body.sub.trim() : "";
  const baseline = Array.isArray(body?.baseline) ? body.baseline.filter((s: unknown) => typeof s === "string" && s.trim()) : [];
  const focus = Array.isArray(body?.focus) ? body.focus.filter((s: unknown) => typeof s === "string" && s.trim()) : [];
  const nextFocusDate = typeof body?.next_focus_date === "string" && body.next_focus_date ? body.next_focus_date : null;

  if (!["sdc", "wec", "smb"].includes(key) || !label) {
    return NextResponse.json({ error: "Missing key or label." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("carson_company_info")
    .upsert({ key, label, sub, baseline, focus, next_focus_date: nextFocusDate, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
