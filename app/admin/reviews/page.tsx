"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Loader2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import ReviewDetailsModal from "./components/ReviewDetailsModal";
import ReviewFilters from "./components/ReviewFilters";
import ReviewStats from "./components/ReviewStats";
import ReviewTable from "./components/ReviewTable";
import ReviewsHeader from "./components/ReviewsHeader";

import type {
  RatingFilter,
  Review,
  ReviewFilter,
  ReviewSort,
  ReviewStatus,
} from "./components/types";

import {
  filterReviews,
  getReviewSummary,
  normalizeRating,
  sortReviews,
} from "./components/utils";

type ReviewRow = {
  id?: string | number | null;
  created_at?: string | null;

  customer_name?: string | null;
  customer_email?: string | null;

  product_name?: string | null;
  product_id?: string | number | null;

  rating?: number | string | null;
  title?: string | null;
  comment?: string | null;
  review?: string | null;
  content?: string | null;

  status?: string | null;

  verified_purchase?: boolean | null;
  is_verified?: boolean | null;
};

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeStatus(
  value: unknown
): ReviewStatus {
  const status = String(value ?? "")
    .trim()
    .toLowerCase();

  if (status === "approved") {
    return "approved";
  }

  if (status === "rejected") {
    return "rejected";
  }

  return "pending";
}

function buildReviews(rows: ReviewRow[]) {
  return rows.map((row, index): Review => {
    const id =
      row.id ??
      `review-${index + 1}`;

    const customerName =
      normalizeText(row.customer_name) ||
      "Guest Customer";

    const customerEmail =
      normalizeText(row.customer_email);

    const productName =
      normalizeText(row.product_name) ||
      "Unknown Product";

    const title =
      normalizeText(row.title) ||
      "Customer Review";

    const comment =
      normalizeText(row.comment) ||
      normalizeText(row.review) ||
      normalizeText(row.content);

    return {
      id,
      created_at: row.created_at ?? null,
      customer_name: customerName,
      customer_email: customerEmail,
      product_name: productName,
      product_id: row.product_id ?? null,
      rating: normalizeRating(row.rating),
      title,
      comment,
      status: normalizeStatus(row.status),
      verified_purchase: Boolean(
        row.verified_purchase ??
          row.is_verified ??
          false
      ),
    };
  });
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<
    Review[]
  >([]);

  const [selectedReview, setSelectedReview] =
    useState<Review | null>(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<ReviewFilter>("all");

  const [ratingFilter, setRatingFilter] =
    useState<RatingFilter>("all");

  const [sort, setSort] =
    useState<ReviewSort>("newest");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] = useState("");

  const loadReviews = useCallback(
    async (showRefreshState = false) => {
      try {
        setError("");

        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const {
          data,
          error: reviewsError,
        } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

        if (reviewsError) {
          throw reviewsError;
        }

        const reviewData = buildReviews(
          (data ?? []) as ReviewRow[]
        );

        setReviews(reviewData);

        setSelectedReview((currentReview) => {
          if (!currentReview) {
            return null;
          }

          return (
            reviewData.find(
              (review) =>
                String(review.id) ===
                String(currentReview.id)
            ) ?? null
          );
        });
      } catch (loadError) {
        console.error(
          "Failed to load reviews:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load review information."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const summary = useMemo(
    () => getReviewSummary(reviews),
    [reviews]
  );

  const displayedReviews = useMemo(() => {
    const filteredReviews = filterReviews(
      reviews,
      search,
      statusFilter,
      ratingFilter
    );

    return sortReviews(
      filteredReviews,
      sort
    );
  }, [
    reviews,
    search,
    statusFilter,
    ratingFilter,
    sort,
  ]);

  async function handleStatusChange(
    review: Review,
    status: ReviewStatus
  ) {
    try {
      setUpdating(true);
      setError("");

      const {
        data,
        error: updateError,
      } = await supabase
        .from("reviews")
        .update({
          status,
        })
        .eq("id", review.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedReview = buildReviews([
        data as ReviewRow,
      ])[0];

      setReviews((currentReviews) =>
        currentReviews.map((item) =>
          String(item.id) ===
          String(review.id)
            ? updatedReview
            : item
        )
      );

      setSelectedReview(updatedReview);
    } catch (updateError) {
      console.error(
        "Failed to update review:",
        updateError
      );

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update this review."
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete(
    review: Review
  ) {
    const confirmed = window.confirm(
      `Delete the review from ${review.customer_name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const {
        error: deleteError,
      } = await supabase
        .from("reviews")
        .delete()
        .eq("id", review.id);

      if (deleteError) {
        throw deleteError;
      }

      setReviews((currentReviews) =>
        currentReviews.filter(
          (item) =>
            String(item.id) !==
            String(review.id)
        )
      );

      setSelectedReview(null);
    } catch (deleteError) {
      console.error(
        "Failed to delete review:",
        deleteError
      );

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete this review."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={42}
            className="mx-auto animate-spin text-yellow-500"
          />

          <p className="mt-4 font-bold text-white">
            Loading reviews...
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Collecting customer feedback and
            ratings.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="space-y-6">
        <ReviewsHeader
          refreshing={refreshing}
          onRefresh={() =>
            void loadReviews(true)
          }
        />

        {error && (
          <section className="flex flex-col gap-4 rounded-3xl border border-red-500/20 bg-red-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={22}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <div>
                <p className="font-bold text-red-300">
                  Review action failed
                </p>

                <p className="mt-1 text-sm text-red-200/70">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadReviews(true)
              }
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500"
            >
              Try Again
            </button>
          </section>
        )}

        <ReviewStats summary={summary} />

        <ReviewFilters
          search={search}
          statusFilter={statusFilter}
          ratingFilter={ratingFilter}
          sort={sort}
          resultCount={
            displayedReviews.length
          }
          onSearchChange={setSearch}
          onStatusFilterChange={
            setStatusFilter
          }
          onRatingFilterChange={
            setRatingFilter
          }
          onSortChange={setSort}
        />

        <ReviewTable
          reviews={displayedReviews}
          onSelectReview={
            setSelectedReview
          }
        />
      </main>

      <ReviewDetailsModal
        review={selectedReview}
        open={selectedReview !== null}
        updating={updating}
        onClose={() =>
          setSelectedReview(null)
        }
        onStatusChange={
          handleStatusChange
        }
        onDelete={handleDelete}
      />
    </>
  );
}