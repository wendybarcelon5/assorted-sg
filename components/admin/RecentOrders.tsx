"use client";

import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

type Order = {
  id: string | number;
  customer_name: string | null;
  total: number | string | null;
  status: string | null;
  payment_status: string | null;
  created_at: string;
};

function formatCurrency(value: number | string | null) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatStatus(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split(/[_\s-]+/)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}

function getOrderStatusClasses(status: string | null) {
  const normalized = status?.trim().toLowerCase() ?? "";

  if (
    ["completed", "delivered", "fulfilled"].includes(
      normalized
    )
  ) {
    return "border-green-500/20 bg-green-500/10 text-green-400";
  }

  if (
    ["cancelled", "canceled", "refunded"].includes(
      normalized
    )
  ) {
    return "border-red-500/20 bg-red-500/10 text-red-400";
  }

  if (
    ["processing", "shipped", "confirmed"].includes(
      normalized
    )
  ) {
    return "border-blue-500/20 bg-blue-500/10 text-blue-400";
  }

  return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
}

function getPaymentStatusClasses(
  status: string | null
) {
  const normalized = status?.trim().toLowerCase() ?? "";

  if (
    [
      "paid",
      "received",
      "confirmed",
      "completed",
      "successful",
      "success",
    ].includes(normalized)
  ) {
    return "border-green-500/20 bg-green-500/10 text-green-400";
  }

  if (
    ["failed", "cancelled", "canceled", "refunded"].includes(
      normalized
    )
  ) {
    return "border-red-500/20 bg-red-500/10 text-red-400";
  }

  return "border-orange-500/20 bg-orange-500/10 text-orange-400";
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadRecentOrders = useCallback(async () => {
    try {
      setErrorMessage("");

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
            id,
            customer_name,
            total,
            status,
            payment_status,
            created_at
          `
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(5);

      if (error) {
        throw error;
      }

      setOrders((data ?? []) as Order[]);
    } catch (error) {
      console.error(
        "Unable to load recent orders:",
        error
      );

      setErrorMessage(
        "Unable to load recent orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecentOrders();
  }, [loadRecentOrders]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-recent-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          void loadRecentOrders();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadRecentOrders]);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#1E293B] shadow-xl">
      <div className="border-b border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white">
          Recent Orders
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          The five newest customer orders
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 p-6">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl bg-white/5"
              />
            )
          )}
        </div>
      ) : errorMessage ? (
        <div className="p-6">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="font-medium text-red-400">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadRecentOrders();
              }}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-semibold text-white">
            No orders yet
          </p>

          <p className="mt-1 text-sm text-gray-400">
            New customer orders will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-white/[0.03]">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 font-semibold">
                  Order
                </th>

                <th className="px-6 py-4 font-semibold">
                  Customer
                </th>

                <th className="px-6 py-4 font-semibold">
                  Total
                </th>

                <th className="px-6 py-4 font-semibold">
                  Payment
                </th>

                <th className="px-6 py-4 font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 font-semibold">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition hover:bg-white/[0.03]"
                >
                  <td className="px-6 py-5">
                    <span className="font-bold text-white">
                      #{String(order.id).slice(0, 8)}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <p className="font-semibold text-white">
                      {order.customer_name ||
                        "Guest Customer"}
                    </p>
                  </td>

                  <td className="px-6 py-5 font-bold text-white">
                    {formatCurrency(order.total)}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getPaymentStatusClasses(
                        order.payment_status
                      )}`}
                    >
                      {formatStatus(
                        order.payment_status
                      )}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getOrderStatusClasses(
                        order.status
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-400">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}