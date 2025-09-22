"use client";
import { useEffect, useState } from "react";
import QuietBlockForm from "@/components/QuietBlockForm";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Block = {
  _id: string;
  userId: string;
  userEmail?: string;
  startTime: string | Date;
  endTime?: string | Date;
  duration: number;
  notified?: boolean;
  timeZone?: string;
};

// Shape returned by the API for a block document
type ApiBlock = Omit<Block, "_id"> & {
  _id: string | { $oid: string };
};

function getStringId(id: string | { $oid: string }): string {
  return typeof id === "string" ? id : id.$oid;
}

function formatInZone(date: Date, zone?: string) {
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: zone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

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
        const normalized = (data as ApiBlock[]).map((b) => ({
          ...b,
          _id: getStringId(b._id),
        })) as Block[];
        setBlocks(normalized);
      } else {
        setBlocks([]);
      }
    };
    fetchBlocks();
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (!userId) return;
    const res = await fetch(`/api/blocks/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, userId }),
    });
    if (res.ok) {
      setBlocks((prev) => prev.filter((b) => b._id !== id));
    } else {
      const data = await res.json().catch(() => null);
      alert((data && data.error) || "Failed to delete block");
    }
  };

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
        onCreated={(block: {
          _id: unknown;
          userId: string;
          userEmail?: string;
          startTime: string | Date;
          endTime?: string | Date;
          duration: number;
          notified?: boolean;
          timeZone?: string;
        }) => {
          setBlocks((prev) => {
            const normalized: Block = {
              ...block,
              _id:
                typeof block._id === "object" && block._id !== null && "$oid" in (block._id as Record<string, unknown>)
                  ? (block._id as { $oid: string }).$oid
                  : String(block._id),
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
          {blocks.map((block: Block) => (
            <li
              key={String(block._id)}
              className="border rounded-md p-4 flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium">
                  {formatInZone(new Date(block.startTime), block.timeZone)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Duration: {block.duration} mins
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    aria-label="Delete block"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete block?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(block._id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
