"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Banknote,
  Boxes,
  Clock3,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string | number;
  customer_name: string | null;
  email: string | null;
  total: number | string | null;
  status: string | null;
  payment_method: string | null;
  created_at: string | null;
};

type Product = {
  id: string | number;
  name: string | null;
  price: number | string | null;
  stock: number | string | null;
};

type DashboardData = {
  orders: Order[];
  products: Product[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusStyle(status: string | null) {
  const normalizedStatus = status?.toLowerCase() ?? "";

  if (
    normalizedStatus.includes("delivered") ||
    normalizedStatus.includes("completed")
  ) {
    return "border-green-500/30 bg-green-500/10 text-green-400";
  }

  if (
    normalizedStatus.includes("cancelled") ||
    normalizedStatus.includes("canceled")
  ) {
    return "border-red-500/30 bg-red-500/10 text-red-400";
  }

  if (
    normalizedStatus.includes("shipping") ||
    normalizedStatus.includes("shipped") ||
    normalizedStatus.includes("processing")
  ) {
    return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  }

  if (normalizedStatus.includes("verification")) {
    return "border-purple-500/30 bg-purple-500/10 text-purple-400";
  }

  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    orders: [],
    products: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard(showRefresh = false) {
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
          .select(
            "id, customer_name, email, total, status, payment_method, created_at"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("products")
          .select("id, name, price, stock")
          .order("id", { ascending: false }),
      ]);

      if (ordersResult.error) {
        throw ordersResult.error;
      }

      if (productsResult.error) {
        throw productsResult.error;
      }

      setData({
        orders: (ordersResult.data ?? []) as Order[],
        products: (productsResult.data ?? []) as Product[],
      });
    } catch (error) {
      console.error("Dashboard error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const dashboardSummary = useMemo(() => {
    const totalRevenue = data.orders.reduce(
      (sum, order) => sum + Number(order.total ?? 0),
      0
    );

    const uniqueCustomers = new Set(
      data.orders
        .map((order) => order.email?.trim().toLowerCase())
        .filter(Boolean)
    ).size;

    const lowStockProducts = data.products.filter(
      (product) => Number(product.stock ?? 0) <= 5
    );

    const pendingOrders = data.orders.filter((order) => {
      const status = order.status?.toLowerCase() ?? "";

      return (
        status.includes("pending") ||
        status.includes("verification") ||
        status.includes("processing")
      );
    }).length;

    return {
      totalRevenue,
      uniqueCustomers,
      lowStockProducts,
      pendingOrders,
    };
  }, [data.orders, data.products]);

  const recentOrders = data.orders.slice(0, 6);

  const monthlySales = useMemo(() => {
    const currentDate = new Date();

    return Array.from({ length: 6 }, (_, index) => {
      const targetDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - (5 - index),
        1
      );

      const total = data.orders.reduce((sum, order) => {
        if (!order.created_at) {
          return sum;
        }

        const orderDate = new Date(order.created_at);

        const isSameMonth =
          orderDate.getFullYear() === targetDate.getFullYear() &&
          orderDate.getMonth() === targetDate.getMonth();

        return isSameMonth ? sum + Number(order.total ?? 0) : sum;
      }, 0);

      return {
        label: targetDate.toLocaleDateString("en-PH", {
          month: "short",
        }),
        total,
      };
    });
  }, [data.orders]);

  const highestMonthlySale = Math.max(
    ...monthlySales.map((month) => month.total),
    1
  );

  if (loading) {
    return (
      <main className="admin-page">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-10 w-10 animate-spin text-red-500" />

            <p className="mt-4 font-semibold text-gray-300">
              Loading dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page space-y-8">
      {/* Welcome Header */}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] via-[#111827] to-black p-6 shadow-2xl md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Assorted SG Admin
            </p>

         <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
  Welcome to{" "}
  <span className="text-[#D4AF37]">Assorted SG</span>
</h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 md:text-lg">
              Monitor store performance, manage orders, and keep your products
              updated from one dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:border-red-500 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
          >
            <RefreshCw
              size={20}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Statistics */}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition hover:-translate-y-1 hover:border-green-500/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Total Revenue
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {formatCurrency(dashboardSummary.totalRevenue)}
              </p>
            </div>

            <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
              <Banknote size={28} />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-green-400">
            <TrendingUp size={17} />
            <span>From all recorded orders</span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition hover:-translate-y-1 hover:border-red-500/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Total Orders
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {data.orders.length}
              </p>
            </div>

            <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
              <ShoppingBag size={28} />
            </div>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            {dashboardSummary.pendingOrders} awaiting action
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition hover:-translate-y-1 hover:border-blue-500/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Customers
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {dashboardSummary.uniqueCustomers}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
              <Users size={28} />
            </div>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            Based on unique customer emails
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition hover:-translate-y-1 hover:border-yellow-500/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Products
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {data.products.length}
              </p>
            </div>

            <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-400">
              <Boxes size={28} />
            </div>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            {dashboardSummary.lowStockProducts.length} low-stock products
          </p>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">
        {/* Sales Overview */}

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white md:text-3xl">
                Sales Overview
              </h2>

              <p className="mt-2 text-gray-400">
                Revenue recorded over the last six months.
              </p>
            </div>

            <div className="rounded-xl bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
              {formatCurrency(dashboardSummary.totalRevenue)} total
            </div>
          </div>

          <div className="mt-10 flex h-72 items-end gap-3 sm:gap-5">
            {monthlySales.map((month) => {
              const height =
                month.total === 0
                  ? 6
                  : Math.max(
                      (month.total / highestMonthlySale) * 100,
                      12
                    );

              return (
                <div
                  key={month.label}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div className="mb-3 hidden text-xs font-semibold text-gray-300 sm:block">
                    {month.total > 0
                      ? formatCurrency(month.total)
                      : "₱0"}
                  </div>

                  <div className="flex h-[220px] w-full items-end rounded-2xl bg-white/5 p-1">
                    <div
                      className="w-full rounded-xl bg-gradient-to-t from-red-700 to-red-500 transition-all duration-500"
                      style={{ height: `${height}%` }}
                      title={`${month.label}: ${formatCurrency(
                        month.total
                      )}`}
                    />
                  </div>

                  <span className="mt-3 text-sm font-bold text-gray-400">
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Store Status */}

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-8">
          <h2 className="text-2xl font-black text-white">
            Store Status
          </h2>

          <p className="mt-2 text-gray-400">
            Items that may need your attention.
          </p>

          <div className="mt-8 space-y-4">
            <Link
              href="/admin/orders"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-red-500 hover:bg-red-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
                  <Clock3 size={24} />
                </div>

                <div>
                  <p className="font-bold text-white">
                    Pending Orders
                  </p>

                  <p className="text-sm text-gray-400">
                    Orders awaiting action
                  </p>
                </div>
              </div>

              <span className="text-2xl font-black text-red-400">
                {dashboardSummary.pendingOrders}
              </span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-yellow-500 hover:bg-yellow-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
                  <Package size={24} />
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
                {dashboardSummary.lowStockProducts.length}
              </span>
            </Link>

            <Link
              href="/admin/products/new"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-blue-500 hover:bg-blue-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <Boxes size={24} />
                </div>

                <div>
                  <p className="font-bold text-white">
                    Add New Product
                  </p>

                  <p className="text-sm text-gray-400">
                    Expand your collection
                  </p>
                </div>
              </div>

              <ArrowRight className="text-gray-400" size={22} />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Orders */}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
        <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              Recent Orders
            </h2>

            <p className="mt-2 text-gray-400">
              Your latest customer purchases.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="flex items-center gap-2 font-bold text-red-400 transition hover:text-red-300"
          >
            View All Orders
            <ArrowRight size={19} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag
              size={44}
              className="mx-auto text-gray-600"
            />

            <h3 className="mt-4 text-xl font-bold text-white">
              No orders yet
            </h3>

            <p className="mt-2 text-gray-400">
              New orders will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Orders */}

            <div className="divide-y divide-white/10 md:hidden">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-6 transition hover:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-white">
                        {order.customer_name || "Unknown Customer"}
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Order #{String(order.id).slice(0, 8)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </div>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        {order.payment_method || "No payment method"}
                      </p>
                    </div>

                    <p className="text-lg font-black text-[#D4AF37]">
                      {formatCurrency(Number(order.total ?? 0))}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop Orders */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px]">
                <thead className="bg-black/30">
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-8 py-5">Order</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5">Payment</th>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-white/5"
                    >
                      <td className="px-8 py-6">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-bold text-red-400 hover:text-red-300"
                        >
                          #{String(order.id).slice(0, 8)}
                        </Link>
                      </td>

                      <td className="px-6 py-6">
                        <p className="font-bold text-white">
                          {order.customer_name || "Unknown Customer"}
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          {order.email || "No email"}
                        </p>
                      </td>

                      <td className="px-6 py-6 text-gray-300">
                        {order.payment_method || "Not provided"}
                      </td>

                      <td className="px-6 py-6 text-gray-400">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="px-6 py-6">
                        <span
                          className={`rounded-full border px-3 py-2 text-xs font-bold ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>

                      <td className="px-8 py-6 text-right text-lg font-black text-[#D4AF37]">
                        {formatCurrency(Number(order.total ?? 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}