"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

type Block = {
  _id: unknown;
  userId: string;
  userEmail?: string;
  startTime: string | Date;
  endTime?: string | Date;
  duration: number;
  notified?: boolean;
};

type QuietBlockFormProps = {
  onCreated?: (block: Block) => void;
};

export default function QuietBlockForm({ onCreated }: QuietBlockFormProps) {
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60); // default 60 mins
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      setUserEmail(user?.email ?? null);
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!userId || !userEmail) {
      setError("You must be logged in to create a block.");
      return;
    }

    const parsed = new Date(startTime);
    if (Number.isNaN(parsed.getTime())) {
      setError("Please provide a valid start time.");
      return;
    }

    const payload = {
      startTime: parsed.toISOString(),
      duration,
      userId,
      userEmail,
    };
    try {
      const res = await fetch("/api/blocks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setStartTime("");
        setDuration(60);
        if (onCreated && data?.block) {
          onCreated(data.block);
        }
      } else {
        let data: any = null;
        try { data = await res.json(); } catch {}
        setError((data && data.error) || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded-md">
      <div className="grid gap-2">
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          id="startTime"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          min={1}
          required
        />
      </div>

      {error && <p className="text-destructive">{error}</p>}

      <Button type="submit">Create Quiet Block</Button>
    </form>
  );
}
