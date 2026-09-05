import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminRequest } from "@/lib/adminAuth";

export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const postingSchedule = Array.isArray(body?.posting_schedule)
    ? body.posting_schedule.filter((s: unknown) => typeof s === "string" && s.trim())
    : [];
  const notes = Array.isArray(body?.notes) ? body.notes.filter((s: unknown) => typeof s === "string" && s.trim()) : [];

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("carson_dalton_page")
    .upsert({ id: 1, posting_schedule: postingSchedule, notes, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
