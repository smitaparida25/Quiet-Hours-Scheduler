"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function QuietBlockForm() {
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60); // default 60 mins
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Call your API route to create the block
    const res = await fetch("/api/blocks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime, duration }),
    });

    if (res.ok) {
      // Reset form or redirect/re-render blocks
      setStartTime("");
      setDuration(60);
      router.refresh(); // refresh to show new block
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 border rounded">
      <label>
        Start Time:
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="border p-1 rounded w-full"
          required
        />
      </label>

      <label>
        Duration (minutes):
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="border p-1 rounded w-full"
          min={1}
          required
        />
      </label>

      {error && <p className="text-red-500">{error}</p>}

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Create Quiet Block
      </button>
    </form>
  );
}
