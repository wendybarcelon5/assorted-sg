"use client";

import { RefreshCw, Settings } from "lucide-react";

type SettingsHeaderProps = {
  refreshing: boolean;
  onRefresh: () => void;
};

export default function SettingsHeader({
  refreshing,
  onRefresh,
}: SettingsHeaderProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-yellow-500/10 p-4 text-yellow-400">
            <Settings size={28} />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-500">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-black text-white">
              Store Settings
            </h1>

            <p className="mt-2 text-gray-400">
              Configure your store preferences and business information.
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:opacity-60"
        >
          <RefreshCw
            size={18}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>
    </section>
  );
}