"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login"); // redirect if not logged in
      } else {
        setUser(data.session.user);
      }
    });
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <p>Your quiet blocks will appear here.</p>
      <button onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}>
        Logout
      </button>
    </div>
  );
}
