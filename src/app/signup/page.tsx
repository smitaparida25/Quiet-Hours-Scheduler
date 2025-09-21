"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
    <form onSubmit={handleSignup}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">Sign Up</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </form>
  );
}
