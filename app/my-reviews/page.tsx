"use client";

import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Loader2,
  MessageSquareText,
  Pencil,
  RefreshCw,
  ShoppingBag,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ReviewRow = {
  id: string | number;
  user_id: string;
  order_id: string | number;
  product_id: string | number;
  rating: number | string;
  comment: string | null;
  created_at: string | null;
  updated_at?: string | null;
};

type ProductRow = {
  id: string | number;
  name: string | null;
  image: string | null;
};

type ReviewItem = ReviewRow & {
  product_name: string;
  product_image: string;
};

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          className={star <= rating ? "text-[#D4AF37]" : "text-gray-700"}
          fill={star <= rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadReviews(showRefresh = false) {
    try {
      showRefresh ? setRefreshing(true) : setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login?redirect=/my-reviews");
        return;
      }

      const { data: reviewData, error: reviewError } = await supabase
        .from("reviews")
        .select("id, user_id, order_id, product_id, rating, comment, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (reviewError) throw reviewError;

      const reviewRows = (reviewData ?? []) as ReviewRow[];

      if (reviewRows.length === 0) {
        setReviews([]);
        return;
      }

      const productIds = Array.from(new Set(reviewRows.map((review) => review.product_id)));

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("id, name, image")
        .in("id", productIds);

      if (productError) throw productError;

      const productMap = new Map(
        ((productData ?? []) as ProductRow[]).map((product) => [String(product.id), product])
      );

      setReviews(
        reviewRows.map((review) => {
          const product = productMap.get(String(review.product_id));
          return {
            ...review,
            product_name: product?.name ?? "Unavailable Product",
            product_image: product?.image ?? "/placeholder.jpg",
          };
        })
      );
    } catch (error) {
      console.error("My reviews loading error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to load your reviews.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) / reviews.length;
  }, [reviews]);

  async function deleteReview(review: ReviewItem) {
    const confirmed = window.confirm(
      `Delete your review for "${review.product_name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(review.id);
      setErrorMessage("");
      setSuccessMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login?redirect=/my-reviews");
        return;
      }

      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", review.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setReviews((current) => current.filter((item) => String(item.id) !== String(review.id)));
      setSuccessMessage("Your review was deleted.");
      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Review deletion error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete this review.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-11 w-11 animate-spin text-red-500" />
          <p className="mt-4 font-bold text-gray-300">Loading your reviews...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/account" className="inline-flex items-center gap-2 font-bold text-gray-400 transition hover:text-white">
              <ArrowLeft size={18} />
              Back to Account
            </Link>
            <p className="mt-7 text-sm font-black uppercase tracking-[0.3em] text-red-500">Your Feedback</p>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">My Reviews</h1>
            <p className="mt-3 max-w-2xl text-gray-400">
              View, edit, or remove the product reviews you have submitted.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadReviews(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-black transition hover:border-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-bold text-red-200">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 font-bold text-green-200">
            {successMessage}
          </div>
        )}

        {reviews.length > 0 && (
          <section className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#111827] p-6 shadow-xl">
              <p className="text-sm font-black uppercase tracking-wider text-gray-500">Total Reviews</p>
              <p className="mt-3 text-4xl font-black text-white">{reviews.length}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#111827] p-6 shadow-xl">
              <p className="text-sm font-black uppercase tracking-wider text-gray-500">Average Rating</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-4xl font-black text-[#D4AF37]">{averageRating.toFixed(1)}</p>
                <RatingStars rating={Math.round(averageRating)} />
              </div>
            </div>
          </section>
        )}

        {reviews.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-[#111827] px-6 py-16 text-center shadow-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <MessageSquareText size={38} />
            </div>
            <h2 className="mt-6 text-3xl font-black">No reviews yet</h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-400">
              Once an order has been delivered, open its details and select “Leave Review” beside the product you want to review.
            </p>
            <Link href="/my-orders" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black transition hover:bg-red-500">
              <ShoppingBag size={19} />
              View My Orders
            </Link>
          </section>
        ) : (
          <section className="space-y-6">
            {reviews.map((review) => {
              const numericRating = Math.max(1, Math.min(5, Number(review.rating ?? 0)));
              const isDeleting = String(deletingId) === String(review.id);

              return (
                <article key={review.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
                  <div className="grid md:grid-cols-[220px_1fr]">
                    <Link href={`/shop/${review.product_id}`} className="block overflow-hidden bg-black/30">
                      <img
                        src={review.product_image}
                        alt={review.product_name}
                        className="h-64 w-full object-cover transition duration-500 hover:scale-105 md:h-full"
                      />
                    </Link>

                    <div className="p-6 md:p-8">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <Link href={`/shop/${review.product_id}`} className="text-2xl font-black transition hover:text-red-500">
                            {review.product_name}
                          </Link>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <RatingStars rating={numericRating} />
                            <span className="font-black text-[#D4AF37]">{numericRating}.0</span>
                          </div>
                          <p className="mt-3 text-sm text-gray-500">Reviewed on {formatDate(review.created_at)}</p>
                        </div>

                        <span className="inline-flex w-fit rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-green-400">
                          Verified Purchase
                        </span>
                      </div>

                      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                        {review.comment?.trim() ? (
                          <p className="whitespace-pre-line leading-7 text-gray-200">{review.comment}</p>
                        ) : (
                          <p className="italic text-gray-500">No written comment was added.</p>
                        )}
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link
                          href={`/review?order=${review.order_id}&product=${review.product_id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-5 py-3 font-black text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
                        >
                          <Pencil size={18} />
                          Edit Review
                        </Link>

                        <button
                          type="button"
                          onClick={() => void deleteReview(review)}
                          disabled={isDeleting}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-black text-red-300 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={18} />
                              Delete Review
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}