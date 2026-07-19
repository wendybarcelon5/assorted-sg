"use client";

import { supabase } from "@/lib/supabase";
import {
  CalendarDays,
  ChevronRight,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Order = {
  id: string | number;
  total: number | string | null;
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string | null;
};

function formatCurrency(value: number | string | null) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatDate(value: string | null) {
  if (!value) {
    return "No date available";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getOrderStatusStyle(status: string | null) {
  const normalized = status?.toLowerCase() ?? "";

  if (normalized.includes("delivered")) {
    return "border-green-500/30 bg-green-500/10 text-green-400";
  }

  if (
    normalized.includes("cancelled") ||
    normalized.includes("canceled")
  ) {
    return "border-red-500/30 bg-red-500/10 text-red-400";
  }

  if (
    normalized.includes("delivery") ||
    normalized.includes("shipped")
  ) {
    return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  }

  if (
    normalized.includes("confirmed") ||
    normalized.includes("preparing") ||
    normalized.includes("processing")
  ) {
    return "border-purple-500/30 bg-purple-500/10 text-purple-400";
  }

  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
}

function getPaymentStatusStyle(status: string | null) {
  const normalized = status?.toLowerCase() ?? "";

  if (normalized === "paid") {
    return "border-green-500/30 bg-green-500/10 text-green-400";
  }

  if (normalized.includes("verification")) {
    return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  }

  if (normalized.includes("refund")) {
    return "border-purple-500/30 bg-purple-500/10 text-purple-400";
  }

  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
}

export default function MyOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOrders = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        const { data, error } = await supabase
          .from("orders")
          .select(
            "id, total, status, payment_status, payment_method, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setOrders((data ?? []) as Order[]);
      } catch (error) {
        console.error("My orders error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your orders."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-red-500" />
          <p className="mt-4 font-bold text-gray-300">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] via-[#111827] to-black p-6 shadow-2xl md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-red-500">
                Customer Account
              </p>

              <h1 className="mt-3 text-4xl font-black md:text-5xl">
                My Orders
              </h1>

              <p className="mt-3 text-gray-400">
                View your purchases and order status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadOrders(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold transition hover:border-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        {errorMessage && (
          <section className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <Package size={48} className="mx-auto text-red-400" />
            <h2 className="mt-4 text-2xl font-black">
              Unable to load orders
            </h2>
            <p className="mt-3 text-red-200">{errorMessage}</p>
          </section>
        )}

        {!errorMessage && orders.length === 0 && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-[#111827] p-10 text-center shadow-xl">
            <ShoppingBag size={52} className="mx-auto text-gray-500" />
            <h2 className="mt-5 text-2xl font-black">
              You have no orders yet
            </h2>
            <p className="mt-3 text-gray-400">
              Your completed purchases will appear here.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-xl bg-red-600 px-6 py-3 font-black transition hover:bg-red-500"
            >
              Shop Now
            </Link>
          </section>
        )}

        {!errorMessage && orders.length > 0 && (
          <section className="mt-8 space-y-5">
            {orders.map((order) => (
              <article
                key={String(order.id)}
                className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition hover:border-red-500/50 md:p-7"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-500">
                      Order
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      #{String(order.id).slice(0, 8)}
                    </h2>

                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                      <CalendarDays size={17} />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[540px]">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500">
                        Order Status
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${getOrderStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500">
                        Payment
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${getPaymentStatusStyle(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status || "Pending"}
                      </span>

                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <CreditCard size={14} />
                        <span>{order.payment_method || "Not provided"}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500">
                        Total
                      </p>

                      <p className="mt-3 text-xl font-black text-[#D4AF37]">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <Link
                    href={`/my-orders/${order.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-black transition hover:bg-red-500"
                  >
                    View Order
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}