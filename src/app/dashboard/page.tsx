"use client";
import { useEffect, useState } from "react";
import QuietBlockForm from "@/components/QuietBlockForm";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Block = {
  _id: string;
  userId: string;
  userEmail?: string;
  startTime: string | Date;
  endTime?: string | Date;
  duration: number;
  notified?: boolean;
};

export default function DashboardPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchBlocks = async () => {
      const res = await fetch(`/api/blocks/index?userId=${userId}`);
      const data: unknown = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map((b: any) => ({
          ...b,
          _id: typeof b._id === "object" && b._id && "$oid" in b._id ? (b._id.$oid as string) : String(b._id),
        })) as Block[];
        setBlocks(normalized);
      } else {
        setBlocks([]);
      }
    };
    fetchBlocks();
  }, [userId]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
        >
          Logout
        </Button>
      </div>
      <QuietBlockForm
        onCreated={(block) => {
          setBlocks((prev) => {
            const normalized: Block = {
              ...block,
              _id:
                typeof (block as any)._id === "object" && (block as any)._id && "$oid" in (block as any)._id
                  ? ((block as any)._id.$oid as string)
                  : String((block as any)._id),
              startTime: block.startTime,
            } as Block;
            const next = [...prev, normalized];
            return next.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          });
        }}
      />
      <h2 className="text-xl mt-8 mb-3">Upcoming Blocks</h2>
      {blocks.length === 0 ? (
        <div className="text-sm text-muted-foreground border rounded-md p-4">
          No upcoming blocks. Create your first quiet block above.
        </div>
      ) : (
        <ul className="grid gap-3">
          {blocks.map((block) => (
            <li
              key={block._id}
              className="border rounded-md p-4 flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium">
                  {new Date(block.startTime).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Duration: {block.duration} mins
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
