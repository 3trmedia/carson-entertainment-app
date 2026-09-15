import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { MAX_EVENTS_PER_COMPANY_PER_MONTH } from "@/lib/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const company = body?.company;
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : "";
  const eventDate = typeof body?.event_date === "string" ? body.event_date : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, 1000) : "";
  const id = typeof body?.id === "string" && UUID_RE.test(body.id) ? body.id : undefined;

  if (!["sdc", "wec", "smb"].includes(company) || !title || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return NextResponse.json({ error: "Missing company, title, or a valid date." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (company !== "smb") {
    const monthStart = eventDate.slice(0, 8) + "01";
    const [y, m] = eventDate.split("-").map(Number);
    const nextMonth = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);

    let countQuery = supabase
      .from("carson_events")
      .select("id", { count: "exact", head: true })
      .eq("company", company)
      .gte("event_date", monthStart)
      .lt("event_date", nextMonth);
    if (id) countQuery = countQuery.neq("id", id);
    const { count, error: countError } = await countQuery;

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }
    if ((count ?? 0) >= MAX_EVENTS_PER_COMPANY_PER_MONTH) {
      return NextResponse.json(
        { error: `This company already has ${MAX_EVENTS_PER_COMPANY_PER_MONTH} major events that month.` },
        { status: 409 }
      );
    }
  }

  const { data, error } = await supabase
    .from("carson_events")
    .upsert(id ? { id, company, title, event_date: eventDate, notes: notes || null } : { company, title, event_date: eventDate, notes: notes || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ event: data });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("carson_events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
