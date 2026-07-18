"use client";

import {
  BadgeCheck,
  ChevronRight,
  MessageSquareText,
  Star,
} from "lucide-react";

import type {
  Review,
  ReviewStatus,
} from "./types";

import { formatReviewDate } from "./utils";

type ReviewTableProps = {
  reviews: Review[];
  onSelectReview: (review: Review) => void;
};

function getStatusClasses(status: ReviewStatus) {
  switch (status) {
    case "approved":
      return "border-green-500/20 bg-green-500/10 text-green-400";

    case "pending":
      return "border-orange-500/20 bg-orange-500/10 text-orange-400";

    case "rejected":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    default:
      return "border-gray-500/20 bg-gray-500/10 text-gray-400";
  }
}

function RatingStars({
  rating,
}: {
  rating: number;
}) {
  const roundedRating = Math.round(rating);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < roundedRating;

        return (
          <Star
            key={index}
            size={16}
            className={
              filled
                ? "text-yellow-400"
                : "text-gray-700"
            }
            fill={filled ? "currentColor" : "none"}
          />
        );
      })}

      <span className="ml-2 text-sm font-bold text-white">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-80 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#111827]">
      <div className="text-center">
        <MessageSquareText
          size={48}
          className="mx-auto text-gray-700"
        />

        <p className="mt-4 font-bold text-white">
          No reviews found
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your search or filters.
        </p>
      </div>
    </div>
  );
}

export default function ReviewTable({
  reviews,
  onSelectReview,
}: ReviewTableProps) {
  if (reviews.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-white/10 bg-black/20">
            <tr>
              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Customer
              </th>

              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Product
              </th>

              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Rating
              </th>

              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Review
              </th>

              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Date
              </th>

              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Status
              </th>

              <th className="px-6 py-5" />
            </tr>
          </thead>

          <tbody>
            {reviews.map((review) => (
              <tr
                key={String(review.id)}
                className="border-b border-white/5 transition hover:bg-white/[0.03]"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 text-lg font-black text-black">
                      {review.customer_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">
                        {review.customer_name}
                      </p>

                      <p className="mt-1 truncate text-sm text-gray-400">
                        {review.customer_email ||
                          "No email"}
                      </p>

                      {review.verified_purchase && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
                          <BadgeCheck size={13} />
                          Verified purchase
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <p className="max-w-[220px] truncate font-bold text-white">
                    {review.product_name}
                  </p>

                  {review.product_id !== null &&
                    review.product_id !== undefined && (
                      <p className="mt-1 text-xs text-gray-500">
                        Product #{review.product_id}
                      </p>
                    )}
                </td>

                <td className="px-6 py-5">
                  <RatingStars
                    rating={review.rating}
                  />
                </td>

                <td className="px-6 py-5">
                  <div className="max-w-[300px]">
                    <p className="truncate font-bold text-white">
                      {review.title ||
                        "Customer Review"}
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-400">
                      {review.comment ||
                        "No written comment."}
                    </p>
                  </div>
                </td>

                <td className="whitespace-nowrap px-6 py-5 text-gray-300">
                  {formatReviewDate(
                    review.created_at
                  )}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
                      review.status
                    )}`}
                  >
                    {review.status}
                  </span>
                </td>

                <td className="px-6 py-5 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectReview(review)
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:border-yellow-500 hover:bg-yellow-500 hover:text-black"
                  >
                    View
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}