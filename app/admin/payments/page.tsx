"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  Smartphone,
  Truck,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type PaymentRecord = {
  id: string | number;
  customer_name?: string | null;
  email?: string | null;
  total?: number | string | null;
  status?: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  reference_number?: string | null;
  receipt_url?: string | null;
  proof_of_payment?: string | null;
  created_at?: string | null;
};

type FilterType =
  | "all"
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizePaymentStatus(payment: PaymentRecord) {
  const paymentStatus = payment.payment_status?.trim().toLowerCase();

  if (paymentStatus) {
    return paymentStatus;
  }

  const orderStatus = payment.status?.trim().toLowerCase() ?? "";

  if (
    orderStatus.includes("paid") ||
    orderStatus.includes("confirmed") ||
    orderStatus.includes("processing") ||
    orderStatus.includes("shipped") ||
    orderStatus.includes("delivered") ||
    orderStatus.includes("completed")
  ) {
    return "paid";
  }

  if (
    orderStatus.includes("cancelled") ||
    orderStatus.includes("canceled") ||
    orderStatus.includes("failed") ||
    orderStatus.includes("rejected")
  ) {
    return "failed";
  }

  if (orderStatus.includes("refund")) {
    return "refunded";
  }

  return "pending";
}

function getStatusLabel(payment: PaymentRecord) {
  const status = normalizePaymentStatus(payment);

  if (status.includes("paid") || status.includes("approved")) {
    return "Paid";
  }

  if (
    status.includes("failed") ||
    status.includes("rejected") ||
    status.includes("cancel")
  ) {
    return "Failed";
  }

  if (status.includes("refund")) {
    return "Refunded";
  }

  return "Pending";
}

function getStatusStyle(payment: PaymentRecord) {
  const label = getStatusLabel(payment);

  if (label === "Paid") {
    return "border-green-500/30 bg-green-500/10 text-green-400";
  }

  if (label === "Failed") {
    return "border-red-500/30 bg-red-500/10 text-red-400";
  }

  if (label === "Refunded") {
    return "border-purple-500/30 bg-purple-500/10 text-purple-400";
  }

  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
}

function getPaymentIcon(method?: string | null) {
  const normalizedMethod = method?.toLowerCase() ?? "";

  if (
    normalizedMethod.includes("gcash") ||
    normalizedMethod.includes("maya")
  ) {
    return Smartphone;
  }

  if (
    normalizedMethod.includes("cash") ||
    normalizedMethod.includes("cod")
  ) {
    return Truck;
  }

  if (
    normalizedMethod.includes("bank") ||
    normalizedMethod.includes("transfer")
  ) {
    return Banknote;
  }

  return CreditCard;
}

function getReceiptUrl(payment: PaymentRecord) {
  return payment.receipt_url || payment.proof_of_payment || null;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<FilterType>("all");
  const [errorMessage, setErrorMessage] = useState("");

  const loadPayments = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setPayments((data ?? []) as PaymentRecord[]);
    } catch (error) {
      console.error("Payments error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load payment records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const paymentSummary = useMemo(() => {
    const paidPayments = payments.filter(
      (payment) => getStatusLabel(payment) === "Paid"
    );

    const pendingPayments = payments.filter(
      (payment) => getStatusLabel(payment) === "Pending"
    );

    const failedPayments = payments.filter(
      (payment) => getStatusLabel(payment) === "Failed"
    );

    const paidRevenue = paidPayments.reduce(
      (total, payment) => total + Number(payment.total ?? 0),
      0
    );

    return {
      paidRevenue,
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
      failedCount: failedPayments.length,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return payments.filter((payment) => {
      const statusLabel = getStatusLabel(payment).toLowerCase();

      const matchesFilter =
        activeFilter === "all" ||
        statusLabel === activeFilter ||
        (activeFilter === "failed" &&
          statusLabel === "failed");

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        String(payment.id),
        payment.customer_name,
        payment.email,
        payment.payment_method,
        payment.payment_status,
        payment.reference_number,
        payment.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [activeFilter, payments, searchTerm]);

  const filterItems: Array<{
    label: string;
    value: FilterType;
    count: number;
  }> = [
    {
      label: "All",
      value: "all",
      count: payments.length,
    },
    {
      label: "Pending",
      value: "pending",
      count: paymentSummary.pendingCount,
    },
    {
      label: "Paid",
      value: "paid",
      count: paymentSummary.paidCount,
    },
    {
      label: "Failed",
      value: "failed",
      count: paymentSummary.failedCount,
    },
    {
      label: "Refunded",
      value: "refunded",
      count: payments.filter(
        (payment) => getStatusLabel(payment) === "Refunded"
      ).length,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-red-500" />

          <p className="mt-4 font-semibold text-gray-300">
            Loading payments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="admin-page space-y-8">
      {/* Header */}

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] via-[#111827] to-black p-6 shadow-2xl md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Financial Management
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
              Payments
            </h1>

            <p className="mt-4 max-w-2xl text-gray-300">
              Review customer payments, payment methods, references,
              receipts, and transaction statuses.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadPayments(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:border-red-500 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={20}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh Payments"}
          </button>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Summary Cards */}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Paid Revenue
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {formatCurrency(paymentSummary.paidRevenue)}
              </p>
            </div>

            <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
              <Banknote size={28} />
            </div>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            Confirmed payment revenue
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Paid
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {paymentSummary.paidCount}
              </p>
            </div>

            <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
              <CheckCircle2 size={28} />
            </div>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            Successfully confirmed
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Pending
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {paymentSummary.pendingCount}
              </p>
            </div>

            <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-400">
              <Clock3 size={28} />
            </div>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            Awaiting verification
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Failed
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {paymentSummary.failedCount}
              </p>
            </div>

            <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
              <XCircle size={28} />
            </div>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            Failed or rejected payments
          </p>
        </div>
      </section>

      {/* Search and Filters */}

      <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 shadow-xl md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search customer, order, method, or reference..."
              className="w-full rounded-2xl border border-white/10 bg-[#0B1120] py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-red-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filterItems.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                  activeFilter === filter.value
                    ? "border-red-500 bg-red-600 text-white"
                    : "border-white/10 bg-white/5 text-gray-300 hover:border-red-500/60 hover:text-white"
                }`}
              >
                {filter.label}
                <span className="ml-2 rounded-full bg-black/20 px-2 py-1 text-xs">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Records */}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
        <div className="border-b border-white/10 p-6 md:p-8">
          <h2 className="text-2xl font-black text-white md:text-3xl">
            Payment Records
          </h2>

          <p className="mt-2 text-gray-400">
            Showing {filteredPayments.length} of {payments.length}{" "}
            transactions.
          </p>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard
              size={48}
              className="mx-auto text-gray-600"
            />

            <h3 className="mt-5 text-xl font-bold text-white">
              No payments found
            </h3>

            <p className="mt-2 text-gray-400">
              Try changing your search or payment filter.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}

            <div className="divide-y divide-white/10 lg:hidden">
              {filteredPayments.map((payment) => {
                const PaymentIcon = getPaymentIcon(
                  payment.payment_method
                );

                const receiptUrl = getReceiptUrl(payment);

                return (
                  <article
                    key={payment.id}
                    className="p-6 transition hover:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
                          <PaymentIcon size={24} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold text-white">
                            {payment.customer_name ||
                              "Unknown Customer"}
                          </p>

                          <p className="mt-1 text-sm text-gray-400">
                            Order #{String(payment.id).slice(0, 8)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(
                          payment
                        )}`}
                      >
                        {getStatusLabel(payment)}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Amount
                        </p>

                        <p className="mt-1 font-black text-[#D4AF37]">
                          {formatCurrency(
                            Number(payment.total ?? 0)
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Method
                        </p>

                        <p className="mt-1 font-semibold text-white">
                          {payment.payment_method ||
                            "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Reference
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-300">
                          {payment.reference_number || "None"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Date
                        </p>

                        <p className="mt-1 text-sm text-gray-300">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Link
                        href={`/admin/orders/${payment.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                      >
                        <Eye size={17} />
                        View Order
                      </Link>

                      {receiptUrl && (
                        <a
                          href={receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
                        >
                          <ExternalLink size={17} />
                          Receipt
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Desktop Table */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-black/30">
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-8 py-5">Order</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5">Payment Method</th>
                    <th className="px-6 py-5">Reference</th>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Amount</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {filteredPayments.map((payment) => {
                    const PaymentIcon = getPaymentIcon(
                      payment.payment_method
                    );

                    const receiptUrl = getReceiptUrl(payment);

                    return (
                      <tr
                        key={payment.id}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-8 py-6">
                          <Link
                            href={`/admin/orders/${payment.id}`}
                            className="font-bold text-red-400 transition hover:text-red-300"
                          >
                            #{String(payment.id).slice(0, 8)}
                          </Link>
                        </td>

                        <td className="px-6 py-6">
                          <p className="font-bold text-white">
                            {payment.customer_name ||
                              "Unknown Customer"}
                          </p>

                          <p className="mt-1 text-sm text-gray-400">
                            {payment.email || "No email"}
                          </p>
                        </td>

                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/5 p-2 text-gray-300">
                              <PaymentIcon size={19} />
                            </div>

                            <span className="font-semibold text-gray-200">
                              {payment.payment_method ||
                                "Not provided"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-6">
                          <span className="text-sm text-gray-300">
                            {payment.reference_number || "None"}
                          </span>
                        </td>

                        <td className="px-6 py-6 text-sm text-gray-400">
                          {formatDate(payment.created_at)}
                        </td>

                        <td className="px-6 py-6">
                          <span
                            className={`rounded-full border px-3 py-2 text-xs font-bold ${getStatusStyle(
                              payment
                            )}`}
                          >
                            {getStatusLabel(payment)}
                          </span>
                        </td>

                        <td className="px-6 py-6 text-right text-lg font-black text-[#D4AF37]">
                          {formatCurrency(
                            Number(payment.total ?? 0)
                          )}
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/orders/${payment.id}`}
                              className="rounded-xl border border-white/10 bg-white/5 p-3 text-gray-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
                              title="View order"
                            >
                              <Eye size={18} />
                            </Link>

                            {receiptUrl && (
                              <a
                                href={receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl border border-white/10 bg-white/5 p-3 text-gray-300 transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                                title="View receipt"
                              >
                                <ExternalLink size={18} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}