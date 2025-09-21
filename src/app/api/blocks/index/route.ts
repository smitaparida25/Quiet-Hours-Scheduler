import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("quiet-hours-scheduler");
    const blocks = db.collection("blocks");
    const allBlocks = await blocks.find({}).sort({ startTime: 1 }).toArray();
    return NextResponse.json(allBlocks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
