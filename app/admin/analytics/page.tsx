"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import { supabase } from "@/lib/supabase";

import AnalyticsHeader from "./components/AnalyticsHeader";
import FilterBar from "./components/FilterBar";
import OrderStatusChart from "./components/OrderStatusChart";
import OrdersChart from "./components/OrdersChart";
import PaymentMethodChart from "./components/PaymentMethodChart";
import RevenueChart from "./components/RevenueChart";
import StatsCards from "./components/StatsCards";
import StoreOverview from "./components/StoreOverview";

import {
  AnalyticsSummary,
  ChartData,
  DateFilter,
  Order,
  Product,
  TopCustomer,
  TopProduct,
} from "./components/types";

type OrderRecord = Order &
  Record<string, unknown> & {
    created_at?: string;
    customer_name?: string;
    customer_email?: string;
    email?: string;
    total?: number;
    status?: string;
    items?: unknown;
    order_items?: unknown;
  };

type ProductRecord = Product &
  Record<string, unknown> & {
    id?: string | number;
    name?: string;
    title?: string;
    price?: number;
  };

type OrderItemRecord = Record<string, unknown> & {
  product_id?: string | number;
  product_name?: string;
  name?: string;
  title?: string;
  quantity?: number;
  price?: number;
  subtotal?: number;
  total?: number;
  products?: ProductRecord | null;
};

function getOrderDate(order: OrderRecord) {
  const value = order.created_at;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isSuccessfulOrder(order: OrderRecord) {
  const status = String(order.status ?? "")
    .trim()
    .toLowerCase();

  return (
    status.includes("paid") ||
    status.includes("complete") ||
    status.includes("deliver") ||
    status.includes("ship") ||
    status.includes("process") ||
    status.includes("pack")
  );
}

function getStartOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getStartDate(filter: DateFilter, now: Date) {
  const start = getStartOfDay(now);

  if (filter === "today") {
    return start;
  }

  if (filter === "7days") {
    start.setDate(start.getDate() - 6);
    return start;
  }

  if (filter === "30days") {
    start.setDate(start.getDate() - 29);
    return start;
  }

  if (filter === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }

  return null;
}

function filterOrders(
  orders: OrderRecord[],
  filter: DateFilter
) {
  const startDate = getStartDate(filter, new Date());

  if (!startDate) {
    return orders;
  }

  return orders.filter((order) => {
    const date = getOrderDate(order);

    return date ? date >= startDate : false;
  });
}

function getPreviousPeriodOrders(
  orders: OrderRecord[],
  filter: DateFilter
) {
  if (filter === "all") {
    return [];
  }

  const now = new Date();
  const currentStart = getStartDate(filter, now);

  if (!currentStart) {
    return [];
  }

  const previousEnd = new Date(currentStart);
  previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);

  let previousStart: Date;

  if (filter === "today") {
    previousStart = getStartOfDay(previousEnd);
  } else if (filter === "7days") {
    previousStart = getStartOfDay(previousEnd);
    previousStart.setDate(previousStart.getDate() - 6);
  } else if (filter === "30days") {
    previousStart = getStartOfDay(previousEnd);
    previousStart.setDate(previousStart.getDate() - 29);
  } else {
    previousStart = new Date(
      previousEnd.getFullYear(),
      0,
      1
    );
  }

  return orders.filter((order) => {
    const date = getOrderDate(order);

    return date
      ? date >= previousStart && date <= previousEnd
      : false;
  });
}

function getRevenue(orders: OrderRecord[]) {
  return orders
    .filter(isSuccessfulOrder)
    .reduce(
      (sum, order) => sum + Number(order.total ?? 0),
      0
    );
}

function getUniqueCustomers(orders: OrderRecord[]) {
  const customers = new Set<string>();

  orders.forEach((order) => {
    const email = String(
      order.customer_email ?? order.email ?? ""
    )
      .trim()
      .toLowerCase();

    if (email) {
      customers.add(email);
    }
  });

  return customers.size;
}

function calculateChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function createSummary(
  currentOrders: OrderRecord[],
  previousOrders: OrderRecord[]
): AnalyticsSummary {
  const revenue = getRevenue(currentOrders);
  const previousRevenue = getRevenue(previousOrders);

  const successfulOrders =
    currentOrders.filter(isSuccessfulOrder).length;

  const previousSuccessfulOrders =
    previousOrders.filter(isSuccessfulOrder).length;

  const customers = getUniqueCustomers(currentOrders);
  const previousCustomers =
    getUniqueCustomers(previousOrders);

  const averageOrderValue =
    successfulOrders > 0 ? revenue / successfulOrders : 0;

  const previousAverageOrderValue =
    previousSuccessfulOrders > 0
      ? previousRevenue / previousSuccessfulOrders
      : 0;

  return {
    revenue,
    totalOrders: currentOrders.length,
    successfulOrders,
    customers,
    averageOrderValue,
    revenueChange: calculateChange(
      revenue,
      previousRevenue
    ),
    ordersChange: calculateChange(
      currentOrders.length,
      previousOrders.length
    ),
    customersChange: calculateChange(
      customers,
      previousCustomers
    ),
    averageOrderChange: calculateChange(
      averageOrderValue,
      previousAverageOrderValue
    ),
  };
}

function formatChartLabel(date: Date, filter: DateFilter) {
  if (filter === "today") {
    return date.toLocaleTimeString("en-PH", {
      hour: "numeric",
    });
  }

  if (filter === "year" || filter === "all") {
    return date.toLocaleDateString("en-PH", {
      month: "short",
    });
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

function createChartData(
  orders: OrderRecord[],
  filter: DateFilter
): ChartData[] {
  const grouped = new Map<
    string,
    {
      date: Date;
      revenue: number;
      orders: number;
    }
  >();

  orders.forEach((order) => {
    const date = getOrderDate(order);

    if (!date) {
      return;
    }

    let groupDate: Date;

    if (filter === "today") {
      groupDate = new Date(date);
      groupDate.setMinutes(0, 0, 0);
    } else if (filter === "year" || filter === "all") {
      groupDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      );
    } else {
      groupDate = getStartOfDay(date);
    }

    const key = groupDate.toISOString();
    const current = grouped.get(key) ?? {
      date: groupDate,
      revenue: 0,
      orders: 0,
    };

    current.orders += 1;

    if (isSuccessfulOrder(order)) {
      current.revenue += Number(order.total ?? 0);
    }

    grouped.set(key, current);
  });

  return Array.from(grouped.values())
    .sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )
    .map((item) => ({
      label: formatChartLabel(item.date, filter),
      revenue: item.revenue,
      orders: item.orders,
    }));
}

function extractOrderItems(order: OrderRecord) {
  const source = order.order_items ?? order.items;

  if (Array.isArray(source)) {
    return source as OrderItemRecord[];
  }

  if (typeof source === "string") {
    try {
      const parsed = JSON.parse(source);

      return Array.isArray(parsed)
        ? (parsed as OrderItemRecord[])
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

function createTopProducts(
  orders: OrderRecord[],
  products: ProductRecord[]
): TopProduct[] {
  const productLookup = new Map<string, ProductRecord>();

  products.forEach((product) => {
    if (product.id !== undefined) {
      productLookup.set(String(product.id), product);
    }
  });

  const totals = new Map<
    string,
    {
      name: string;
      quantity: number;
      revenue: number;
    }
  >();

  orders
    .filter(isSuccessfulOrder)
    .forEach((order) => {
      extractOrderItems(order).forEach((item) => {
        const linkedProduct =
          item.product_id !== undefined
            ? productLookup.get(String(item.product_id))
            : undefined;

        const name = String(
          item.product_name ??
            item.name ??
            item.title ??
            item.products?.name ??
            item.products?.title ??
            linkedProduct?.name ??
            linkedProduct?.title ??
            "Product"
        );

        const quantity = Math.max(
          Number(item.quantity ?? 1),
          1
        );

        const unitPrice = Number(
          item.price ??
            item.products?.price ??
            linkedProduct?.price ??
            0
        );

        const revenue = Number(
          item.subtotal ?? item.total ?? unitPrice * quantity
        );

        const current = totals.get(name) ?? {
          name,
          quantity: 0,
          revenue: 0,
        };

        current.quantity += quantity;
        current.revenue += revenue;

        totals.set(name, current);
      });
    });

  return Array.from(totals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function createTopCustomers(
  orders: OrderRecord[]
): TopCustomer[] {
  const customers = new Map<
    string,
    {
      name: string;
      email: string;
      spent: number;
      orders: number;
    }
  >();

  orders
    .filter(isSuccessfulOrder)
    .forEach((order) => {
      const email = String(
        order.customer_email ?? order.email ?? ""
      )
        .trim()
        .toLowerCase();

      const name = String(
        order.customer_name ?? "Customer"
      ).trim();

      const key = email || name || "customer";
      const current = customers.get(key) ?? {
        name: name || "Customer",
        email,
        spent: 0,
        orders: 0,
      };

      current.spent += Number(order.total ?? 0);
      current.orders += 1;

      customers.set(key, current);
    });

  return Array.from(customers.values())
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>(
    []
  );

  const [dateFilter, setDateFilter] =
    useState<DateFilter>("30days");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [ordersResult, productsResult] =
          await Promise.all([
            supabase
              .from("orders")
              .select("*")
              .order("created_at", {
                ascending: true,
              }),

            supabase.from("products").select("*"),
          ]);

        if (ordersResult.error) {
          throw ordersResult.error;
        }

        if (productsResult.error) {
          console.warn(
            "Products could not be loaded:",
            productsResult.error.message
          );
        }

        setOrders(
          (ordersResult.data ?? []) as OrderRecord[]
        );

        setProducts(
          (productsResult.data ?? []) as ProductRecord[]
        );
      } catch (caughtError) {
        console.error(caughtError);

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load analytics data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const filteredOrders = useMemo(
    () => filterOrders(orders, dateFilter),
    [orders, dateFilter]
  );

  const previousOrders = useMemo(
    () => getPreviousPeriodOrders(orders, dateFilter),
    [orders, dateFilter]
  );

  const analytics = useMemo(
    () => createSummary(filteredOrders, previousOrders),
    [filteredOrders, previousOrders]
  );

  const chartData = useMemo(
    () => createChartData(filteredOrders, dateFilter),
    [filteredOrders, dateFilter]
  );

  const topProducts = useMemo(
    () => createTopProducts(filteredOrders, products),
    [filteredOrders, products]
  );

  const topCustomers = useMemo(
    () => createTopCustomers(filteredOrders),
    [filteredOrders]
  );

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={48}
            className="mx-auto animate-spin text-red-500"
          />

          <p className="mt-5 font-bold text-white">
            Loading analytics...
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Preparing your latest store insights.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 pb-10">
      <AnalyticsHeader
        refreshing={refreshing}
        onRefresh={() => void loadAnalytics(true)}
      />

      {error && (
        <section className="flex items-start gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
          <AlertCircle
            size={22}
            className="mt-0.5 flex-none text-red-400"
          />

          <div>
            <p className="font-bold text-red-300">
              Analytics could not be refreshed
            </p>

            <p className="mt-1 text-sm text-red-200/70">
              {error}
            </p>
          </div>
        </section>
      )}

      <FilterBar
        value={dateFilter}
        onChange={setDateFilter}
      />

      <StatsCards
        analytics={analytics}
        dateFilter={dateFilter}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <RevenueChart data={chartData} />
        <OrdersChart data={chartData} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PaymentMethodChart orders={filteredOrders} />
        <OrderStatusChart orders={filteredOrders} />
      </section>

      <StoreOverview
        topProducts={topProducts}
        topCustomers={topCustomers}
      />
    </main>
  );
}