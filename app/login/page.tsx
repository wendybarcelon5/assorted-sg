"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";

type ProfileRole = {
  role: string | null;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const {
        data: loginData,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        alert(loginError.message);
        return;
      }

      if (!loginData.user) {
        alert(
          "Login succeeded, but the account could not be loaded."
        );
        return;
      }

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", loginData.user.id)
        .maybeSingle<ProfileRole>();

      if (profileError) {
        console.error(
          "Unable to load profile role:",
          profileError
        );
      }

      const role =
        profileData?.role
          ?.trim()
          .toLowerCase() ?? "customer";

      const requestedPath =
        searchParams.get("redirect") ||
        searchParams.get("redirectTo") ||
        searchParams.get("next");

      if (
        role === "admin" ||
        role === "administrator"
      ) {
        const adminDestination =
          requestedPath?.startsWith("/admin")
            ? requestedPath
            : "/admin";

        router.replace(adminDestination);
        router.refresh();
        return;
      }

      const customerDestination =
        requestedPath &&
        !requestedPath.startsWith("/admin")
          ? requestedPath
          : "/";

      router.replace(customerDestination);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      alert(
        "Something went wrong while logging in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl sm:p-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
              Assorted SG
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Account Login
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Log in to access your Assorted
              SG account.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 px-5 py-4 font-black transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Logging in..."
                : "Log In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-red-500 hover:text-red-400"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}