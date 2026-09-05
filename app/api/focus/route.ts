import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const company = body?.company;
  const month = typeof body?.month === "string" ? body.month.trim() : "";
  const goals = Array.isArray(body?.goals) ? body.goals.filter((g: unknown) => typeof g === "string" && g.trim()) : [];

  if (!["sdc", "wec", "smb"].includes(company) || !month) {
    return NextResponse.json({ error: "Missing company or month." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("carson_focus_state")
    .upsert({ id: 1, company, month, goals, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
