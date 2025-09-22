import { NextResponse } from "next/server";
import { sendReminderEmails } from "@/lib/sendReminders";

export const runtime = "nodejs";

export async function GET() {
  try {
    const info = await sendReminderEmails();
    return NextResponse.json({ ok: true, ...info });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}


