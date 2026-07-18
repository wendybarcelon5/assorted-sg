"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Profile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export default function AccountPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, email, phone, address")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "Unable to load customer profile:",
            profileError
          );
        }

        setProfile({
          full_name:
            data?.full_name ??
            user.user_metadata?.full_name ??
            null,
          email: data?.email ?? user.email ?? null,
          phone:
            data?.phone ??
            user.user_metadata?.phone ??
            null,
          address:
            data?.address ??
            user.user_metadata?.address ??
            null,
        });
      } catch (error) {
        console.error("Account loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadAccount();
  }, [router]);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        alert(error.message);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to log out.");
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-gray-400">
          Loading your account...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
                Assorted SG
              </p>

              <h1 className="mt-3 text-3xl font-black">
                Welcome, {profile?.full_name || "Customer"}
              </h1>

              <p className="mt-2 text-gray-400">
                Manage your orders, profile, and reviews.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-bold text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Log Out"}
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              href="/my-orders"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-red-500 hover:bg-red-500/5"
            >
              <p className="text-xl font-black">
                My Orders
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                View your purchases and order status.
              </p>
            </Link>

            <Link
              href="/account/profile"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-red-500 hover:bg-red-500/5"
            >
              <p className="text-xl font-black">
                My Profile
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                View and update your customer information.
              </p>
            </Link>

            <Link
              href="/my-reviews"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-red-500 hover:bg-red-500/5"
            >
              <p className="text-xl font-black">
                My Reviews
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                View reviews you have submitted.
              </p>
            </Link>
          </div>

          <section className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-xl font-black">
              Account Information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Full name
                </p>

                <p className="mt-1 text-white">
                  {profile?.full_name || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Email
                </p>

                <p className="mt-1 text-white">
                  {profile?.email || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Phone
                </p>

                <p className="mt-1 text-white">
                  {profile?.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Delivery address
                </p>

                <p className="mt-1 text-white">
                  {profile?.address || "Not provided"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}