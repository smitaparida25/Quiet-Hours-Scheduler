"use client";
import { useEffect, useState } from "react";
import QuietBlockForm from "@/components/QuietBlockForm";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchBlocks = async () => {
      const res = await fetch(`/api/blocks/index?userId=${userId}`);
      const data = await res.json();
      setBlocks(Array.isArray(data) ? data : []);
    };
    fetchBlocks();
  }, [userId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <QuietBlockForm />
      <h2 className="text-xl mt-6 mb-2">Upcoming Blocks</h2>
      <ul>
        {blocks.map((block: any) => (
          <li key={block._id}>
            {new Date(block.startTime).toLocaleString()} — {block.duration} mins
          </li>
        ))}
      </ul>
    </div>
  );
}
