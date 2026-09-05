import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminRequest } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const venue = body?.venue;
  const filmingDate = typeof body?.filming_date === "string" ? body.filming_date : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, 1000) : "";

  if (!["grove", "sparks", "barn"].includes(venue) || !/^\d{4}-\d{2}-\d{2}$/.test(filmingDate)) {
    return NextResponse.json({ error: "Missing venue or a valid date." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("carson_dalton_filming")
    .insert({ venue, filming_date: filmingDate, notes: notes || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ event: data });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("carson_dalton_filming").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
