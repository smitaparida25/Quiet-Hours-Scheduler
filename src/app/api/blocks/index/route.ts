import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("quiet-hours-scheduler");
    const blocks = db.collection("blocks");
    const userBlocks = await blocks.find({ userId }).sort({ startTime: 1 }).toArray();
    return NextResponse.json(userBlocks);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}