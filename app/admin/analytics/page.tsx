"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  Boxes,
  CalendarDays,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string | number;
  customer_name?: string | null;
  email?: string | null;
  total?: number | string | null;
  status?: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
  created_at?: string | null;
};

type Product = {
  id: string | number;
  name?: string | null;
  price?: number | string | null;
  stock?: number | string | null;
  created_at?: string | null;
};

type DateFilter = "today" | "7days" | "30days" | "year" | "all";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function isSuccessfulOrder(order: Order) {
  const combinedStatus = `${order.payment_status ?? ""} ${
    order.status ?? ""
  }`.toLowerCase();

  if (
    combinedStatus.includes("cancel") ||
    combinedStatus.includes("failed") ||
    combinedStatus.includes("rejected") ||
    combinedStatus.includes("refund")
  ) {
    return false;
  }

  return true;
}

function getFilterStartDate(filter: DateFilter) {
  const now = new Date();

  if (filter === "today") {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
  }

  if (filter === "7days") {
    const date = new Date(now);
    date.setDate(date.getDate() - 6);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  if (filter === "30days") {
    const date = new Date(now);
    date.setDate(date.getDate() - 29);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  if (filter === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }

  return null;
}

function getPreviousPeriod(
  filter: DateFilter
): { start: Date; end: Date } | null {
  const now = new Date();

  if (filter === "today") {
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const start = new Date(end);
    start.setDate(start.getDate() - 1);

    return { start, end };
  }

  if (filter === "7days") {
    const end = new Date(now);
    end.setDate(end.getDate() - 6);
    end.setHours(0, 0, 0, 0);

    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    return { start, end };
  }

  if (filter === "30days") {
    const end = new Date(now);
    end.setDate(end.getDate() - 29);
    end.setHours(0, 0, 0, 0);

    const start = new Date(end);
    start.setDate(start.getDate() - 30);

    return { start, end };
  }

  if (filter === "year") {
    return {
      start: new Date(now.getFullYear() - 1, 0, 1),
      end: new Date(now.getFullYear(), 0, 1),
    };
  }

  return null;
}

function calculatePercentageChange(
  current: number,
  previous: number
) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function ChangeIndicator({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const positive = value >= 0;

  return (
    <div
      className={`mt-5 flex items-center gap-2 text-sm font-semibold ${
        positive ? "text-green-400" : "text-red-400"
      }`}
    >
      {positive ? (
        <ArrowUpRight size={17} />
      ) : (
        <ArrowDownRight size={17} />
      )}

      <span>{Math.abs(value).toFixed(1)}%</span>

      <span className="font-normal text-gray-500">{label}</span>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dateFilter, setDateFilter] =
    useState<DateFilter>("30days");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAnalytics = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        const [ordersResult, productsResult] = await Promise.all([
          supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false }),

          supabase
            .from("products")
            .select("*")
            .order("id", { ascending: false }),
        ]);

        if (ordersResult.error) {
          throw ordersResult.error;
        }

        if (productsResult.error) {
          throw productsResult.error;
        }

        setOrders((ordersResult.data ?? []) as Order[]);
        setProducts((productsResult.data ?? []) as Product[]);
      } catch (error) {
        console.error("Analytics error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load analytics."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const filteredOrders = useMemo(() => {
    const startDate = getFilterStartDate(dateFilter);

    if (!startDate) {
      return orders;
    }

    return orders.filter((order) => {
      if (!order.created_at) {
        return false;
      }

      const orderDate = new Date(order.created_at);

      return (
        !Number.isNaN(orderDate.getTime()) &&
        orderDate >= startDate
      );
    });
  }, [dateFilter, orders]);

  const previousOrders = useMemo(() => {
    const period = getPreviousPeriod(dateFilter);

    if (!period) {
      return [];
    }

    return orders.filter((order) => {
      if (!order.created_at) {
        return false;
      }

      const orderDate = new Date(order.created_at);

      return (
        !Number.isNaN(orderDate.getTime()) &&
        orderDate >= period.start &&
        orderDate < period.end
      );
    });
  }, [dateFilter, orders]);

  const analytics = useMemo(() => {
    const successfulOrders =
      filteredOrders.filter(isSuccessfulOrder);

    const previousSuccessfulOrders =
      previousOrders.filter(isSuccessfulOrder);

    const revenue = successfulOrders.reduce(
      (total, order) => total + Number(order.total ?? 0),
      0
    );

    const previousRevenue = previousSuccessfulOrders.reduce(
      (total, order) => total + Number(order.total ?? 0),
      0
    );

    const customerEmails = new Set(
      filteredOrders
        .map((order) => order.email?.trim().toLowerCase())
        .filter(Boolean)
    );

    const previousCustomerEmails = new Set(
      previousOrders
        .map((order) => order.email?.trim().toLowerCase())
        .filter(Boolean)
    );

    const averageOrderValue =
      successfulOrders.length > 0
        ? revenue / successfulOrders.length
        : 0;

    const previousAverageOrderValue =
      previousSuccessfulOrders.length > 0
        ? previousRevenue / previousSuccessfulOrders.length
        : 0;

    const lowStockProducts = products.filter(
      (product) => Number(product.stock ?? 0) <= 5
    ).length;

    return {
      revenue,
      totalOrders: filteredOrders.length,
      successfulOrders: successfulOrders.length,
      customers: customerEmails.size,
      averageOrderValue,
      lowStockProducts,

      revenueChange: calculatePercentageChange(
        revenue,
        previousRevenue
      ),

      ordersChange: calculatePercentageChange(
        filteredOrders.length,
        previousOrders.length
      ),

      customersChange: calculatePercentageChange(
        customerEmails.size,
        previousCustomerEmails.size
      ),

      averageOrderChange: calculatePercentageChange(
        averageOrderValue,
        previousAverageOrderValue
      ),
    };
  }, [filteredOrders, previousOrders, products]);

  const filterButtons: Array<{
    label: string;
    value: DateFilter;
  }> = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "7days" },
    { label: "Last 30 Days", value: "30days" },
    { label: "This Year", value: "year" },
    { label: "All Time", value: "all" },
  ];

  const periodLabel =
    dateFilter === "today"
      ? "compared with yesterday"
      : dateFilter === "7days"
        ? "compared with previous 7 days"
        : dateFilter === "30days"
          ? "compared with previous 30 days"
          : dateFilter === "year"
            ? "compared with last year"
            : "all recorded data";

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-red-500" />

          <p className="mt-4 font-semibold text-gray-300">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="admin-page space-y-8">
      {/* Header */}

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] via-[#111827] to-black p-6 shadow-2xl md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Business Intelligence
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
              Analytics
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-gray-300">
              Track revenue, customer activity, order performance,
              and store growth for Assorted SG.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:border-red-500 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={20}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh Analytics"}
          </button>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Date Filters */}

      <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 shadow-xl md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
              <CalendarDays size={23} />
            </div>

            <div>
              <p className="font-bold text-white">Analytics Period</p>

              <p className="text-sm text-gray-400">
                Choose the data range you want to review.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterButtons.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setDateFilter(filter.value)}
                className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                  dateFilter === filter.value
                    ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "border-white/10 bg-white/5 text-gray-300 hover:border-red-500/60 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Cards */}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition hover:-translate-y-1 hover:border-green-500/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Revenue
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {formatCurrency(analytics.revenue)}
              </p>
            </div>

            <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
              <Banknote size={28} />
            </div>
          </div>

          {dateFilter === "all" ? (
            <p className="mt-5 text-sm text-gray-500">
              Revenue from all successful orders
            </p>
          ) : (
            <ChangeIndicator
              value={analytics.revenueChange}
              label={periodLabel}
            />
          )}
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition hover:-translate-y-1 hover:border-red-500/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Orders
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {analytics.totalOrders}
              </p>
            </div>

            <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
              <ShoppingBag size={28} />
            </div>
          </div>

          {dateFilter === "all" ? (
            <p className="mt-5 text-sm text-gray-500">
              {analytics.successfulOrders} successful orders
            </p>
          ) : (
            <ChangeIndicator
              value={analytics.ordersChange}
              label={periodLabel}
            />
          )}
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition hover:-translate-y-1 hover:border-blue-500/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Customers
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {analytics.customers}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
              <Users size={28} />
            </div>
          </div>

          {dateFilter === "all" ? (
            <p className="mt-5 text-sm text-gray-500">
              Based on unique customer emails
            </p>
          ) : (
            <ChangeIndicator
              value={analytics.customersChange}
              label={periodLabel}
            />
          )}
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition hover:-translate-y-1 hover:border-[#D4AF37]/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Average Order
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {formatCurrency(analytics.averageOrderValue)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#D4AF37]/10 p-3 text-[#D4AF37]">
              <TrendingUp size={28} />
            </div>
          </div>

          {dateFilter === "all" ? (
            <p className="mt-5 text-sm text-gray-500">
              Average value per successful order
            </p>
          ) : (
            <ChangeIndicator
              value={analytics.averageOrderChange}
              label={periodLabel}
            />
          )}
        </article>
      </section>

      {/* Foundation Preview */}

      <section className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">
        <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <h2 className="text-2xl font-black text-white md:text-3xl">
                Revenue Performance
              </h2>

              <p className="mt-2 text-gray-400">
                The revenue chart will be added in the next step.
              </p>
            </div>

            <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
              <BarChart3 size={27} />
            </div>
          </div>

          <div className="mt-8 flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <div>
              <BarChart3
                size={54}
                className="mx-auto text-gray-700"
              />

              <p className="mt-5 text-lg font-bold text-white">
                Monthly revenue chart
              </p>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                We will add monthly revenue bars, order trends, and
                hover values here next.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-8">
          <h2 className="text-2xl font-black text-white">
            Store Overview
          </h2>

          <p className="mt-2 text-gray-400">
            Current inventory information.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <Boxes size={23} />
                </div>

                <div>
                  <p className="font-bold text-white">
                    Total Products
                  </p>

                  <p className="text-sm text-gray-400">
                    Products in your catalog
                  </p>
                </div>
              </div>

              <span className="text-2xl font-black text-white">
                {products.length}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
                  <Boxes size={23} />
                </div>

                <div>
                  <p className="font-bold text-white">
                    Low Stock
                  </p>

                  <p className="text-sm text-gray-400">
                    Five or fewer remaining
                  </p>
                </div>
              </div>

              <span className="text-2xl font-black text-yellow-400">
                {analytics.lowStockProducts}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
                  <ShoppingBag size={23} />
                </div>

                <div>
                  <p className="font-bold text-white">
                    Successful Orders
                  </p>

                  <p className="text-sm text-gray-400">
                    Excludes rejected and cancelled
                  </p>
                </div>
              </div>

              <span className="text-2xl font-black text-green-400">
                {analytics.successfulOrders}
              </span>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}