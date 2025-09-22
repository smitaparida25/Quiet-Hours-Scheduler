import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(req: NextRequest) {
  try {
    const { id, userId } = (await req.json()) as { id?: string; userId?: string };

    if (!id || !userId) {
      return NextResponse.json({ error: "Missing id or userId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("quiet-hours-scheduler");
    const blocks = db.collection("blocks");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: "Invalid block id" }, { status: 400 });
    }

    const result = await blocks.deleteOne({ _id: objectId, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Block deleted" }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error deleting block:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


