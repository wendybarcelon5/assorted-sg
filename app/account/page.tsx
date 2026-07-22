"use client";

import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  Heart,
  Mail,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Profile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

export default function AccountPage() {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [totalOrders, setTotalOrders] =
    useState(0);

  const [completedOrders, setCompletedOrders] =
    useState(0);

  useEffect(() => {
    loadAccount();
  }, []);

 async function loadAccount() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name,email,phone")
      .eq("id", user.id)
      .maybeSingle();

    setProfile({
  full_name:
    profileData?.full_name ??
    (user.user_metadata?.full_name as string) ??
    null,

  email:
    profileData?.email ??
    user.email ??
    null,

  phone:
    profileData?.phone ??
    null,
});

    const { count: total } = await supabase
      .from("orders")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

    const { count: delivered } = await supabase
      .from("orders")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .eq("status", "Delivered");

    setTotalOrders(total ?? 0);
    setCompletedOrders(delivered ?? 0);
  } finally {
    setLoading(false);
  }
}

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-5 py-12">
      <div className="max-w-7xl mx-auto">

        <div className="rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#111827] to-black border border-white/10 p-8 shadow-2xl">

          <div className="flex flex-col md:flex-row md:items-center gap-6">

            <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center">

              <UserCircle2 size={60} />

            </div>

            <div>
<h1 className="text-4xl font-black">
  {profile?.full_name ||
    profile?.email?.split("@")[0] ||
    "Customer"}
</h1>

             <p className="mt-2 text-gray-400 flex items-center gap-2">
  <Mail size={16} />
  {profile?.email || "No email available"}
</p>

              <p className="mt-2 text-gray-400 flex items-center gap-2">

                <ShieldCheck size={16} />

                Verified Customer

              </p>
              

            <Link
  href="/profile"
  className="mt-5 inline-flex items-center rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
>
  Edit Profile
</Link>

            </div>

          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-8">

          <div className="rounded-2xl bg-[#111827] border border-white/10 p-6">

            <p className="text-gray-400">

              Total Orders

            </p>

            <h2 className="text-4xl font-black mt-3">

              {totalOrders}

            </h2>

          </div>

          <div className="rounded-2xl bg-[#111827] border border-white/10 p-6">

            <p className="text-gray-400">

              Completed Orders

            </p>

            <h2 className="text-4xl font-black mt-3">

              {completedOrders}

            </h2>

          </div>

          <div className="rounded-2xl bg-[#111827] border border-white/10 p-6">

            <p className="text-gray-400">

              Wishlist

            </p>

            <h2 className="text-4xl font-black mt-3">

              Soon

            </h2>

          </div>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

          <Link
            href="/my-orders"
            className="rounded-2xl border border-white/10 bg-[#111827] p-6 hover:border-red-600 transition"
          >
            <ShoppingBag
              className="text-red-500"
              size={32}
            />

            <h3 className="mt-5 text-xl font-black">

              My Orders

            </h3>

            <p className="mt-2 text-gray-400">

              View all purchases and order status.

            </p>

            <div className="mt-5 flex items-center gap-2 font-bold text-red-500">

              Open

              <ArrowRight size={18} />

            </div>

          </Link>

          <Link
            href="/wishlist"
            className="rounded-2xl border border-white/10 bg-[#111827] p-6 hover:border-red-600 transition"
          >
            <Heart
              className="text-red-500"
              size={32}
            />

            <h3 className="mt-5 text-xl font-black">

              Wishlist

            </h3>

            <p className="mt-2 text-gray-400">

              Save your favorite products.

            </p>

          </Link>

          <Link
            href="/my-reviews"
            className="rounded-2xl border border-white/10 bg-[#111827] p-6 hover:border-red-600 transition"
          >
            <Star
              className="text-red-500"
              size={32}
            />

            <h3 className="mt-5 text-xl font-black">

              My Reviews

            </h3>

            <p className="mt-2 text-gray-400">

              Manage all your product reviews.

            </p>

          </Link>

          <Link
            href="/addresses"
            className="rounded-2xl border border-white/10 bg-[#111827] p-6 hover:border-red-600 transition"
          >
            <MapPin
              className="text-red-500"
              size={32}
            />

            <h3 className="mt-5 text-xl font-black">

              Addresses

            </h3>

            <p className="mt-2 text-gray-400">

              Manage delivery addresses.

            </p>

          </Link>

          <Link
            href="/account/settings"
            className="rounded-2xl border border-white/10 bg-[#111827] p-6 hover:border-red-600 transition"
          >
            <Settings
              className="text-red-500"
              size={32}
            />

            <h3 className="mt-5 text-xl font-black">

              Settings

            </h3>

            <p className="mt-2 text-gray-400">

              Update account preferences.

            </p>

          </Link>

          <div className="rounded-2xl border border-dashed border-white/20 bg-[#111827] p-6">

            <Package
              className="text-gray-500"
              size={32}
            />

            <h3 className="mt-5 text-xl font-black">

              More Features

            </h3>

            <p className="mt-2 text-gray-500">

              Notifications, Coupons, Loyalty Points and more are coming soon.

            </p>

          </div>

        </div>

      </div>
    </main>
  );
}