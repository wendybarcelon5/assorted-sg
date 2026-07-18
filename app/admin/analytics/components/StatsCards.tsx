"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnalyticsSummary, DateFilter } from "./types";
import { formatCurrency, getPeriodLabel } from "./utils";

type StatsCardsProps = {
  analytics: AnalyticsSummary;
  dateFilter: DateFilter;
};

type ChangeIndicatorProps = {
  value: number;
  label: string;
};

function ChangeIndicator({
  value,
  label,
}: ChangeIndicatorProps) {
  const positive = value >= 0;

  return (
    <div
      className={`mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold ${
        positive ? "text-green-400" : "text-red-400"
      }`}
    >
      {positive ? (
        <ArrowUpRight size={17} />
      ) : (
        <ArrowDownRight size={17} />
      )}

      <span>{Math.abs(value).toFixed(1)}%</span>

      <span className="font-normal text-gray-500">
        {label}
      </span>
    </div>
  );
}

export default function StatsCards({
  analytics,
  dateFilter,
}: StatsCardsProps) {
  const periodLabel = getPeriodLabel(dateFilter);

  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-green-500/40">
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
            Revenue from successful orders
          </p>
        ) : (
          <ChangeIndicator
            value={analytics.revenueChange}
            label={periodLabel}
          />
        )}
      </article>

      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-red-500/40">
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

      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-blue-500/40">
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

      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-[#D4AF37]/50">
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
  );
}