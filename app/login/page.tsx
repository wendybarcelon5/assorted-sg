"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl bg-[#111] p-8"
      >
        <h1 className="mb-8 text-center text-4xl font-black text-white">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-lg border border-gray-700 bg-black p-4 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-6 w-full rounded-lg border border-gray-700 bg-black p-4 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-red-600 p-4 font-bold text-white hover:bg-red-700"
        >
          Login
        </button>
      </form>
    </main>
  );
}