"use client";

import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Order = {
  id: string | number;
  user_id: string | null;
  customer_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  total: number | string | null;
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  created_at: string | null;
};

type OrderItem = {
  id?: string | number;
  order_id: string | number;
  product_id: string | number | null;
  product_name: string | null;
  quantity: number | string | null;
  price: number | string | null;
};

type ReviewRow = {
  id: string;
  product_id: string | number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadOrder(showRefresh = false) {
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

      if (!orderId) {
        setErrorMessage("Invalid order ID.");
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          "id, user_id, customer_name, email, phone, address, total, status, payment_status, payment_method, receipt_url, created_at"
        )
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (orderError) {
        throw orderError;
      }

      if (!orderData) {
        setErrorMessage(
          "Order not found or you do not have permission to view it."
        );
        setOrder(null);
        setItems([]);
        setReviewedProductIds(new Set());
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select("id, order_id, product_id, product_name, quantity, price")
        .eq("order_id", orderId)
        .order("id", { ascending: true });

      if (itemError) {
        throw itemError;
      }

      const normalizedItems = (itemData ?? []) as OrderItem[];
      setOrder(orderData as Order);
      setItems(normalizedItems);

      const productIds = normalizedItems
        .map((item) => item.product_id)
        .filter(
          (productId): productId is string | number =>
            productId !== null && productId !== undefined
        );

      if (productIds.length === 0) {
        setReviewedProductIds(new Set());
        return;
      }

      const { data: reviewData, error: reviewError } = await supabase
        .from("reviews")
        .select("id, product_id")
        .eq("user_id", user.id)
        .in("product_id", productIds);

      if (reviewError) {
        throw reviewError;
      }

      const reviewedIds = new Set(
        ((reviewData ?? []) as ReviewRow[]).map((review) =>
          String(review.product_id)
        )
      );

      setReviewedProductIds(reviewedIds);
    } catch (error) {
      console.error("Order details error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load this order."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  const itemsSubtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return (
        sum +
        Number(item.price ?? 0) *
          Number(item.quantity ?? 0)
      );
    }, 0);
  }, [items]);

  const orderTotal = Number(order?.total ?? 0);
  const shippingFee = Math.max(orderTotal - itemsSubtotal, 0);
  const isDelivered =
    order?.status?.toLowerCase().includes("delivered") ?? false;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-red-500" />
          <p className="mt-4 font-bold text-gray-300">
            Loading order details...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/my-orders"
            className="inline-flex items-center gap-2 font-bold text-gray-300 transition hover:text-white"
          >
            <ArrowLeft size={19} />
            Back to My Orders
          </Link>

          <button
            type="button"
            onClick={() => void loadOrder(true)}
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

        {errorMessage && (
          <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <Package size={48} className="mx-auto text-red-400" />
            <h1 className="mt-4 text-2xl font-black">
              Unable to open order
            </h1>
            <p className="mt-3 text-red-200">{errorMessage}</p>
            <Link
              href="/my-orders"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-black transition hover:bg-red-500"
            >
              <ArrowLeft size={18} />
              Return to My Orders
            </Link>
          </section>
        )}

        {!errorMessage && order && (
          <>
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] via-[#111827] to-black p-6 shadow-2xl md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-red-500">
                    Order Details
                  </p>
                  <h1 className="mt-3 text-4xl font-black md:text-5xl">
                    Order #{String(order.id).slice(0, 8)}
                  </h1>
                  <div className="mt-4 flex items-center gap-2 text-gray-400">
                    <CalendarDays size={18} />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                      Payment Status
                    </p>
                    <span
                      className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${getPaymentStatusStyle(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-8">
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
                  <div className="border-b border-white/10 p-6 md:p-7">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
                        <ShoppingBag size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black">Products</h2>
                        <p className="mt-1 text-sm text-gray-400">
                          {items.length} item
                          {items.length === 1 ? "" : "s"} in this order
                        </p>
                      </div>
                    </div>
                  </div>

                  {items.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      No products were found for this order.
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {items.map((item, index) => {
                        const quantity = Number(item.quantity ?? 0);
                        const price = Number(item.price ?? 0);
                        const subtotal = quantity * price;
                        const reviewed =
                          item.product_id !== null &&
                          reviewedProductIds.has(String(item.product_id));

                        return (
                          <article
                            key={item.id ?? `${item.product_id}-${index}`}
                            className="p-6 md:p-7"
                          >
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-lg font-black">
                                  {item.product_name || "Unnamed Product"}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-400">
                                  <span>
                                    Quantity:{" "}
                                    <strong className="text-white">
                                      {quantity}
                                    </strong>
                                  </span>
                                  <span>
                                    Price:{" "}
                                    <strong className="text-white">
                                      {formatCurrency(price)}
                                    </strong>
                                  </span>
                                </div>

                                {isDelivered && item.product_id !== null && (
                                  <Link
                                    href={`/review?order=${order.id}&product=${item.product_id}`}
                                    className={`mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-black transition ${
                                      reviewed
                                        ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20"
                                        : "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-600 hover:text-white"
                                    }`}
                                  >
                                    <Star
                                      size={18}
                                      fill={reviewed ? "currentColor" : "none"}
                                    />
                                    {reviewed
                                      ? "Edit Review"
                                      : "Leave Review (Optional)"}
                                  </Link>
                                )}
                              </div>

                              <div className="sm:text-right">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                  Subtotal
                                </p>
                                <p className="mt-2 text-xl font-black text-[#D4AF37]">
                                  {formatCurrency(subtotal)}
                                </p>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-7">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">
                        Delivery Information
                      </h2>
                      <p className="mt-1 text-sm text-gray-400">
                        Shipping details used for this order
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <div className="flex items-center gap-2 text-gray-500">
                        <User size={17} />
                        <p className="text-xs font-bold uppercase tracking-wider">
                          Customer
                        </p>
                      </div>
                      <p className="mt-3 font-bold">
                        {order.customer_name || "Not provided"}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {order.email || "No email"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone size={17} />
                        <p className="text-xs font-bold uppercase tracking-wider">
                          Phone
                        </p>
                      </div>
                      <p className="mt-3 font-bold">
                        {order.phone || "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:col-span-2">
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin size={17} />
                        <p className="text-xs font-bold uppercase tracking-wider">
                          Delivery Address
                        </p>
                      </div>
                      <p className="mt-3 whitespace-pre-line leading-7 text-gray-200">
                        {order.address || "No delivery address provided"}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-7">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">Payment</h2>
                      <p className="mt-1 text-sm text-gray-400">
                        Payment details for this order
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <span className="text-gray-400">Method</span>
                      <span className="text-right font-bold">
                        {order.payment_method || "Not provided"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <span className="text-gray-400">Status</span>
                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-black ${getPaymentStatusStyle(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status || "Pending"}
                      </span>
                    </div>

                    {order.receipt_url && (
                      <a
                        href={order.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-black text-white transition hover:border-red-500 hover:bg-red-500/10"
                      >
                        View Payment Receipt
                      </a>
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-7">
                  <h2 className="text-2xl font-black">Order Summary</h2>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="text-gray-400">Items subtotal</span>
                      <span className="font-bold">
                        {formatCurrency(itemsSubtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="text-gray-400">Shipping</span>
                      <span className="font-bold">
                        {formatCurrency(shippingFee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-lg font-black">Total</span>
                      <span className="text-2xl font-black text-[#D4AF37]">
                        {formatCurrency(orderTotal)}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-7">
                  <h2 className="text-xl font-black">Order Actions</h2>
                  <div className="mt-5 grid gap-3">
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-gray-500 opacity-60"
                    >
                      Track Order — Coming Soon
                    </button>

                    {isDelivered && (
                      <Link
                        href="/my-reviews"
                        className="rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-3 text-center font-bold text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
                      >
                        View My Reviews
                      </Link>
                    )}

                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-gray-500 opacity-60"
                    >
                      Buy Again — Coming Soon
                    </button>
                  </div>
                </section>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}