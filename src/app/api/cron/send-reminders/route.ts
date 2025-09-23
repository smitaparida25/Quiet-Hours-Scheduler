import { NextResponse } from "next/server";
import { sendReminderEmails } from "@/lib/sendReminders";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const provided = url.searchParams.get("secret") || (req.headers.get("x-cron-secret") ?? undefined);
  const expected = process.env.CRON_SECRET;
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const info = await sendReminderEmails();
    return NextResponse.json({ ok: true, ...info });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}


