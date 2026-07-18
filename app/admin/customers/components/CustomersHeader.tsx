"use client";

import { RefreshCw, Users } from "lucide-react";

type CustomersHeaderProps = {
  refreshing: boolean;
  onRefresh: () => void;
};

export default function CustomersHeader({
  refreshing,
  onRefresh,
}: CustomersHeaderProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] via-[#111827] to-black p-6 shadow-2xl md:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-red-500/10 p-4 text-red-400">
            <Users size={34} />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Customer Management
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
              Customers
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-gray-300">
              Manage customer accounts, monitor spending habits,
              review purchase history, and build stronger customer
              relationships for Assorted SG.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:border-red-500 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={20}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Customers"}
        </button>
      </div>
    </section>
  );
}