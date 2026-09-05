import { NextRequest } from "next/server";

export function isAdminRequest(req: NextRequest): boolean {
  const cookie = req.cookies.get("carson_admin")?.value;
  return !!cookie && cookie === process.env.CARSON_ADMIN_PASSCODE;
}
