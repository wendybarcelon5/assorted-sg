"use client";

import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  Clock3,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type OrderRow = {
  total: number | string | null;
  status: string | null;
  payment_status: string | null;
  created_at: string;
};

type DashboardStatsData = {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  pendingOrders: number;
  lowStock: number;
  todaySales: number;
};

const initialStats: DashboardStatsData = {
  revenue: 0,
  orders: 0,
  customers: 0,
  products: 0,
  pendingOrders: 0,
  lowStock: 0,
  todaySales: 0,
};

const paidStatuses = [
  "paid",
  "received",
  "confirmed",
  "completed",
  "successful",
  "success",
];

const pendingStatuses = [
  "pending",
  "new",
  "placed",
  "awaiting payment",
  "awaiting_payment",
];

function normalizeStatus(value: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function isPaidOrder(order: OrderRow) {
  return paidStatuses.includes(
    normalizeStatus(order.payment_status)
  );
}

function isPendingOrder(order: OrderRow) {
  return pendingStatuses.includes(
    normalizeStatus(order.status)
  );
}

function isTodayInPhilippines(dateValue: string) {
  const orderDate = new Date(dateValue);

  const orderDateInPhilippines =
    orderDate.toLocaleDateString("en-CA", {
      timeZone: "Asia/Manila",
    });

  const todayInPhilippines =
    new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Manila",
    });

  return (
    orderDateInPhilippines ===
    todayInPhilippines
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function DashboardStats() {
  const [stats, setStats] =
    useState<DashboardStatsData>(
      initialStats
    );

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadDashboard =
    useCallback(async () => {
      try {
        setErrorMessage("");

        const [
          ordersResult,
          customersResult,
          productsResult,
          lowStockResult,
        ] = await Promise.all([
          supabase
            .from("orders")
            .select(
              `
                total,
                status,
                payment_status,
                created_at
              `
            ),

          supabase
            .from("profiles")
            .select("*", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("products")
            .select("*", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("products")
            .select("id", {
              count: "exact",
              head: true,
            })
            .lte("stock", 5),
        ]);

        if (ordersResult.error) {
          throw ordersResult.error;
        }

        if (customersResult.error) {
          throw customersResult.error;
        }

        if (productsResult.error) {
          throw productsResult.error;
        }

        if (lowStockResult.error) {
          throw lowStockResult.error;
        }

        const orders = (
          ordersResult.data ?? []
        ).map((order) => ({
          ...order,
          total: Number(order.total ?? 0),
        })) as OrderRow[];

        const paidOrders =
          orders.filter(isPaidOrder);

        const revenue =
          paidOrders.reduce(
            (total, order) =>
              total +
              Number(order.total ?? 0),
            0
          );

        const todaySales =
          paidOrders
            .filter((order) =>
              isTodayInPhilippines(
                order.created_at
              )
            )
            .reduce(
              (total, order) =>
                total +
                Number(order.total ?? 0),
              0
            );

        const pendingOrders =
          orders.filter(
            isPendingOrder
          ).length;

        setStats({
          revenue,
          orders: orders.length,
          customers:
            customersResult.count ?? 0,
          products:
            productsResult.count ?? 0,
          pendingOrders,
          lowStock:
            lowStockResult.count ?? 0,
          todaySales,
        });
      } catch (error) {
        console.error(
          "Unable to load dashboard statistics:",
          error
        );

        setErrorMessage(
          "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const ordersChannel = supabase
      .channel("admin-dashboard-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          void loadDashboard();
        }
      )
      .subscribe();

    const productsChannel = supabase
      .channel("admin-dashboard-products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          void loadDashboard();
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel("admin-dashboard-profiles")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          void loadDashboard();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(
        ordersChannel
      );

      void supabase.removeChannel(
        productsChannel
      );

      void supabase.removeChannel(
        profilesChannel
      );
    };
  }, [loadDashboard]);

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(
        stats.revenue
      ),
      subtitle: "Paid orders",
      icon: DollarSign,
      iconColor: "bg-green-600",
    },
    {
      title: "Total Orders",
      value: stats.orders.toLocaleString(),
      subtitle: "All customer orders",
      icon: ShoppingBag,
      iconColor: "bg-blue-600",
    },
    {
      title: "Total Customers",
      value:
        stats.customers.toLocaleString(),
      subtitle: "Registered customers",
      icon: Users,
      iconColor: "bg-purple-600",
    },
    {
      title: "Total Products",
      value:
        stats.products.toLocaleString(),
      subtitle: "Products in your store",
      icon: Package,
      iconColor: "bg-red-600",
    },
    {
      title: "Pending Orders",
      value:
        stats.pendingOrders.toLocaleString(),
      subtitle: "Waiting to be processed",
      icon: Clock3,
      iconColor: "bg-orange-600",
    },
    {
      title: "Low Stock",
      value:
        stats.lowStock.toLocaleString(),
      subtitle: "Five items or fewer",
      icon: AlertTriangle,
      iconColor: "bg-yellow-600",
    },
    {
      title: "Today's Sales",
      value: formatCurrency(
        stats.todaySales
      ),
      subtitle: "Paid sales today",
      icon: TrendingUp,
      iconColor: "bg-emerald-600",
    },
  ];

  if (errorMessage) {
    return (
      <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-semibold text-red-400">
          {errorMessage}
        </p>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void loadDashboard();
          }}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className="group rounded-3xl border border-white/10 bg-[#1E293B] p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-red-500/60 hover:shadow-red-600/10"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-400">
                  {card.title}
                </p>

                {loading ? (
                  <div className="mt-3 h-9 w-28 animate-pulse rounded-lg bg-white/10" />
                ) : (
                  <h2 className="mt-3 truncate text-3xl font-black text-white">
                    {card.value}
                  </h2>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  {card.subtitle}
                </p>
              </div>

              <div
                className={`${card.iconColor} shrink-0 rounded-2xl p-4 shadow-lg transition-transform duration-300 group-hover:scale-105`}
              >
                <Icon
                  className="text-white"
                  size={28}
                />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}