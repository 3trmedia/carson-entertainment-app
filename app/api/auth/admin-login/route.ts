import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const passcode = body?.passcode;

  if (typeof passcode !== "string" || passcode !== process.env.CARSON_ADMIN_PASSCODE) {
    return NextResponse.json({ error: "Incorrect admin passcode." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("carson_admin", passcode, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
