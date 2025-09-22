import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { userEmail, startTime, duration, userId } = (await req.json()) as {
      userEmail?: string
      startTime?: string
      duration?: number
      userId?: string
    };

    if (!startTime || !duration || !userId) {
      return NextResponse.json({ error: "Missing startTime or duration or userId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("quiet-hours-scheduler");
    const blocks = db.collection("blocks");

    const start = new Date(startTime);
    const end = new Date(start.getTime() + (duration as number) * 60000);

    const overlap = await blocks.findOne({
      userId,
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
    });

    if (overlap) {
      return NextResponse.json({ error: "Block overlaps with existing one" }, { status: 409 });
    }

    const result = await blocks.insertOne({ userId, userEmail, startTime: start, endTime: end, duration, notified: false });

    const createdBlock = {
      _id: result.insertedId,
      userId,
      userEmail,
      startTime: start,
      endTime: end,
      duration,
      notified: false,
    };

    return NextResponse.json({ message: "Block created successfully", block: createdBlock }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error creating block:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

