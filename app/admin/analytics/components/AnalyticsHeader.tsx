"use client";

import { RefreshCw } from "lucide-react";

type AnalyticsHeaderProps = {
  refreshing: boolean;
  onRefresh: () => void;
};

export default function AnalyticsHeader({
  refreshing,
  onRefresh,
}: AnalyticsHeaderProps) {
  return (
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
            Monitor revenue, customer activity, inventory performance,
            and business growth across Assorted SG.
          </p>
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

          {refreshing ? "Refreshing..." : "Refresh Analytics"}
        </button>
      </div>
    </section>
  );
}