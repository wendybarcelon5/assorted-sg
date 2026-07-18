"use client";

import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Mail,
  Package,
  Star,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import type {
  Review,
  ReviewStatus,
} from "./types";

import { formatReviewDate } from "./utils";

type ReviewDetailsModalProps = {
  review: Review | null;
  open: boolean;
  updating: boolean;
  onClose: () => void;
  onStatusChange: (
    review: Review,
    status: ReviewStatus
  ) => void;
  onDelete: (review: Review) => void;
};

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
            size={20}
            className={
              filled
                ? "text-yellow-400"
                : "text-gray-700"
            }
            fill={filled ? "currentColor" : "none"}
          />
        );
      })}

      <span className="ml-2 font-black text-white">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

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

function getStatusIcon(status: ReviewStatus) {
  switch (status) {
    case "approved":
      return <CheckCircle2 size={16} />;

    case "pending":
      return <Clock3 size={16} />;

    case "rejected":
      return <XCircle size={16} />;
  }
}

export default function ReviewDetailsModal({
  review,
  open,
  updating,
  onClose,
  onStatusChange,
  onDelete,
}: ReviewDetailsModalProps) {
  if (!open || !review) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm md:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
        <header className="flex items-start justify-between gap-5 border-b border-white/10 p-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-500">
              Review Details
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {review.title || "Customer Review"}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <RatingStars rating={review.rating} />

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
                  review.status
                )}`}
              >
                {getStatusIcon(review.status)}
                {review.status}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close review details"
            disabled={updating}
            className="rounded-xl border border-white/10 p-3 text-gray-400 transition hover:border-yellow-500 hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <div className="max-h-[calc(92vh-190px)] overflow-y-auto p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-lg font-black text-white">
                Customer Information
              </h3>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Customer
                  </p>

                  <p className="mt-1 font-bold text-white">
                    {review.customer_name}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Mail
                    size={18}
                    className="mt-0.5 shrink-0 text-yellow-400"
                  />

                  <div>
                    <p className="text-sm text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 break-all text-gray-300">
                      {review.customer_email ||
                        "No email available"}
                    </p>
                  </div>
                </div>

                {review.verified_purchase && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-400">
                    <BadgeCheck size={18} />
                    Verified purchase
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-lg font-black text-white">
                Product Information
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Package
                    size={18}
                    className="mt-0.5 shrink-0 text-yellow-400"
                  />

                  <div>
                    <p className="text-sm text-gray-500">
                      Product
                    </p>

                    <p className="mt-1 font-bold text-white">
                      {review.product_name}
                    </p>
                  </div>
                </div>

                {review.product_id !== null &&
                  review.product_id !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Product ID
                      </p>

                      <p className="mt-1 text-gray-300">
                        {String(review.product_id)}
                      </p>
                    </div>
                  )}

                <div>
                  <p className="text-sm text-gray-500">
                    Submitted
                  </p>

                  <p className="mt-1 text-gray-300">
                    {formatReviewDate(
                      review.created_at
                    )}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg font-black text-white">
              Customer Feedback
            </h3>

            <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <p className="whitespace-pre-wrap break-words leading-7 text-gray-300">
                {review.comment ||
                  "The customer did not provide a written comment."}
              </p>
            </div>
          </section>
        </div>

        <footer className="flex flex-col gap-3 border-t border-white/10 bg-black/20 p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => onDelete(review)}
            disabled={updating}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 font-bold text-red-400 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={18} />
            Delete Review
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                onStatusChange(review, "rejected")
              }
              disabled={
                updating ||
                review.status === "rejected"
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 font-bold text-red-400 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle size={18} />
              Reject
            </button>

            <button
              type="button"
              onClick={() =>
                onStatusChange(review, "pending")
              }
              disabled={
                updating ||
                review.status === "pending"
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-5 py-3 font-bold text-orange-400 transition hover:bg-orange-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Clock3 size={18} />
              Mark Pending
            </button>

            <button
              type="button"
              onClick={() =>
                onStatusChange(review, "approved")
              }
              disabled={
                updating ||
                review.status === "approved"
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-3 font-bold text-green-400 transition hover:bg-green-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              Approve
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}