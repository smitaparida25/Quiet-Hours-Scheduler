import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { startTime, duration } = await req.json();

    if (!startTime || !duration) {
      return NextResponse.json({ error: "Missing startTime or duration" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("quiet-hours-scheduler");
    const blocks = db.collection("blocks");

    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    const overlap = await blocks.findOne({
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
    });

    if (overlap) {
      return NextResponse.json({ error: "Block overlaps with existing one" }, { status: 409 });
    }

    await blocks.insertOne({ startTime: start, endTime: end, duration });

    return NextResponse.json({ message: "Block created successfully" }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating block:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

