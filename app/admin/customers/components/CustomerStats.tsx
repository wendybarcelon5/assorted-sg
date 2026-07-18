"use client";

import {
  Banknote,
  Repeat2,
  UserPlus,
  Users,
} from "lucide-react";

import { CustomerSummary } from "./types";
import { formatCurrency } from "./utils";

type CustomerStatsProps = {
  summary: CustomerSummary;
};

export default function CustomerStats({
  summary,
}: CustomerStatsProps) {
  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-blue-500/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Total Customers
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {summary.totalCustomers}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
            <Users size={28} />
          </div>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          All customers who have placed an order
        </p>
      </article>

      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-green-500/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              New Customers
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {summary.newCustomers}
            </p>
          </div>

          <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
            <UserPlus size={28} />
          </div>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          Customers with their first recent order
        </p>
      </article>

      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-purple-500/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Returning Customers
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {summary.returningCustomers}
            </p>
          </div>

          <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-400">
            <Repeat2 size={28} />
          </div>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          Customers with multiple orders
        </p>
      </article>

      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-[#D4AF37]/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Customer Revenue
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {formatCurrency(summary.totalCustomerRevenue)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#D4AF37]/10 p-3 text-[#D4AF37]">
            <Banknote size={28} />
          </div>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          Average value:{" "}
          <span className="font-semibold text-white">
            {formatCurrency(summary.averageCustomerValue)}
          </span>
        </p>
      </article>
    </section>
  );
}