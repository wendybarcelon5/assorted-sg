"use client";

import { MessageSquareText, RefreshCw } from "lucide-react";

type ReviewsHeaderProps = {
  refreshing: boolean;
  onRefresh: () => void;
};

export default function ReviewsHeader({
  refreshing,
  onRefresh,
}: ReviewsHeaderProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] via-[#111827] to-black p-6 shadow-2xl md:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-yellow-500/10 p-4 text-yellow-400">
            <MessageSquareText size={34} />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-500">
              Review Management
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
              Reviews
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-gray-300">
              Manage customer feedback, review ratings, verify purchases,
              approve helpful comments, and protect the quality of your
              Assorted SG storefront.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:border-yellow-500 hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={20}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh Reviews"}
        </button>
      </div>
    </section>
  );
}