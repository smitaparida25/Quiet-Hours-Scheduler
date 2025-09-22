"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function QuietBlockForm() {
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60); // default 60 mins
  const [error, setError] = useState("");
  const router = useRouter();
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
    const payload = {
      startTime,
      duration,
      userId,
      userEmail,
    };
    const res = await fetch("/api/blocks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
