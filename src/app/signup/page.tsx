"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setMessage("");

  const trimmedEmail = email.trim().toLowerCase();


  if (!trimmedEmail || password.length < 6) {
    setError("Please enter a valid email and password (6+ chars).");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
  });

  if (error) {
    console.log(error);
    setError(error.message);
  } else {
    setMessage("Signup successful! Check your email to confirm.");
  }
};


  return (
    <form onSubmit={handleSignup} className="space-y-4 w-full max-w-sm mx-auto mt-24">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" className="w-full">
        Sign Up
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        Already have an account? <a className="underline" href="/login">Log in</a>
      </p>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}
    </form>
  );
}
