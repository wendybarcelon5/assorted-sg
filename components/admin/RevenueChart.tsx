"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";

type RevenuePoint = {
  date: string;
  revenue: number;
};

type OrderRow = {
  created_at: string;
  total: number | string;
  payment_status: string | null;
};

const paidStatuses = [
  "paid",
  "received",
  "confirmed",
  "completed",
  "successful",
  "success",
];

function normalizeStatus(value: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export default function RevenueChart() {
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenue();

    const channel = supabase
      .channel("admin-revenue-chart")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          void loadRevenue();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  async function loadRevenue() {
    setLoading(true);

    const start = new Date();
    start.setDate(start.getDate() - 29);

    const { data: orders } = await supabase
      .from("orders")
      .select("created_at,total,payment_status")
      .gte("created_at", start.toISOString());

    const map = new Map<string, number>();

    for (let i = 29; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);

      const key = day.toLocaleDateString("en-CA", {
        timeZone: "Asia/Manila",
      });

      map.set(key, 0);
    }

    (orders as OrderRow[] | null)?.forEach((order) => {
      if (
        !paidStatuses.includes(
          normalizeStatus(order.payment_status)
        )
      ) {
        return;
      }

      const key = new Date(
        order.created_at
      ).toLocaleDateString("en-CA", {
        timeZone: "Asia/Manila",
      });

      map.set(
        key,
        (map.get(key) ?? 0) +
          Number(order.total)
      );
    });

    setData(
      Array.from(map.entries()).map(
        ([date, revenue]) => ({
          date,
          revenue,
        })
      )
    );

    setLoading(false);
  }

  const maxRevenue = useMemo(() => {
    return Math.max(
      ...data.map((d) => d.revenue),
      1
    );
  }, [data]);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#1E293B] p-6 shadow-xl">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            Revenue
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Last 30 Days
          </p>

        </div>

      </div>

      {loading ? (
        <div className="mt-8 h-72 animate-pulse rounded-xl bg-white/5" />
      ) : (
        <div className="mt-8 flex h-72 items-end gap-2">

          {data.map((item) => (
            <div
              key={item.date}
              className="group flex flex-1 flex-col justify-end"
            >
              <div
                className="rounded-t-xl bg-gradient-to-t from-red-600 to-red-400 transition-all duration-300 group-hover:opacity-80"
                style={{
                  height: `${
                    (item.revenue /
                      maxRevenue) *
                    100
                  }%`,
                  minHeight:
                    item.revenue > 0
                      ? 6
                      : 2,
                }}
              />

              <span className="mt-2 text-center text-[10px] text-gray-500">
                {new Date(item.date).getDate()}
              </span>
            </div>
          ))}

        </div>
      )}

    </section>
  );
}