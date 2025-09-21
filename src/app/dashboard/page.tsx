"use client";
import { useEffect, useState } from "react";
import QuietBlockForm from "@/components/QuietBlockForm";

export default function DashboardPage() {
  const [blocks, setBlocks] = useState([]);

  const fetchBlocks = async () => {
    const res = await fetch("/api/blocks/index");
    const data = await res.json();
    setBlocks(data);
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

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
