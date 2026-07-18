"use client";

import {
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Star,
} from "lucide-react";

import type { ReviewSummary } from "./types";

type ReviewStatsProps = {
  summary: ReviewSummary;
};

export default function ReviewStats({
  summary,
}: ReviewStatsProps) {
  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-blue-500/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Total Reviews
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {summary.totalReviews}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
            <MessageSquareText size={28} />
          </div>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          All customer feedback received
        </p>
      </article>

      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-yellow-500/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Average Rating
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {summary.averageRating.toFixed(1)}
            </p>
          </div>

          <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-400">
            <Star size={28} fill="currentColor" />
          </div>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          {summary.fiveStarReviews} five-star review
          {summary.fiveStarReviews === 1 ? "" : "s"}
        </p>
      </article>

      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-green-500/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Approved
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {summary.approvedReviews}
            </p>
          </div>

          <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
            <CheckCircle2 size={28} />
          </div>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          Reviews visible on the storefront
        </p>
      </article>

      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-orange-500/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Pending
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {summary.pendingReviews}
            </p>
          </div>

          <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-400">
            <Clock3 size={28} />
          </div>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          {summary.rejectedReviews} rejected review
          {summary.rejectedReviews === 1 ? "" : "s"}
        </p>
      </article>
    </section>
  );
}