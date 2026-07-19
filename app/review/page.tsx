"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  image: string | null;
  price: number | null;
};

type ExistingReview = {
  id: string;
  rating: number;
  comment: string | null;
};

function ReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const orderId = searchParams.get("order");
  const productId = searchParams.get("product");

  const [product, setProduct] = useState<Product | null>(null);
  const [review, setReview] = useState<ExistingReview | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadReviewPage() {
      setLoading(true);
      setError("");

      if (!orderId || !productId) {
        setError("The review link is incomplete.");
        setLoading(false);
        return;
      }

      const numericOrderId = Number(orderId);
      const numericProductId = Number(productId);

      if (
        !Number.isInteger(numericOrderId) ||
        numericOrderId <= 0 ||
        !Number.isInteger(numericProductId) ||
        numericProductId <= 0
      ) {
        setError("The review link contains an invalid order or product.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        const returnTo = encodeURIComponent(
          `/review?order=${numericOrderId}&product=${numericProductId}`,
        );
        router.replace(`/login?redirect=${returnTo}`);
        return;
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("id, name, image, price")
        .eq("id", numericProductId)
        .maybeSingle();

      if (productError || !productData) {
        setError(productError?.message || "This product could not be found.");
        setLoading(false);
        return;
      }

      setProduct({
        id: Number(productData.id),
        name: String(productData.name ?? "Product"),
        image: productData.image ? String(productData.image) : null,
        price:
          productData.price === null || productData.price === undefined
            ? null
            : Number(productData.price),
      });

      /*
       * Confirm that:
       * 1. The order belongs to the signed-in customer.
       * 2. The order has been delivered.
       * 3. The product is included in that order.
       *
       * Your database RLS remains the final security layer.
       */
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id, status, order_items(product_id)")
        .eq("id", numericOrderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (orderError || !orderData) {
        setError(
          orderError?.message ||
            "This order was not found or does not belong to your account.",
        );
        setLoading(false);
        return;
      }

      const orderItems = Array.isArray(orderData.order_items)
        ? orderData.order_items
        : [];

      const productIsInOrder = orderItems.some(
        (item: { product_id?: number | string | null }) =>
          Number(item.product_id) === numericProductId,
      );

      const delivered =
        String(orderData.status ?? "").trim().toLowerCase() === "delivered";

      if (!productIsInOrder) {
        setError("This product is not included in the selected order.");
        setLoading(false);
        return;
      }

      if (!delivered) {
        setError("You can review this product after the order is delivered.");
        setLoading(false);
        return;
      }

      setEligible(true);

      const { data: existingReview, error: reviewError } = await supabase
        .from("reviews")
        .select("id, rating, comment")
        .eq("user_id", user.id)
        .eq("product_id", numericProductId)
        .maybeSingle();

      if (reviewError) {
        setError(reviewError.message);
        setLoading(false);
        return;
      }

      if (existingReview) {
        const normalizedReview: ExistingReview = {
          id: String(existingReview.id),
          rating: Number(existingReview.rating),
          comment: existingReview.comment
            ? String(existingReview.comment)
            : null,
        };

        setReview(normalizedReview);
        setRating(normalizedReview.rating);
        setComment(normalizedReview.comment ?? "");
      }

      setLoading(false);
    }

    void loadReviewPage();
  }, [orderId, productId, router, supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!eligible || !orderId || !productId) {
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please choose a star rating.");
      return;
    }

    const cleanComment = comment.trim();

    if (cleanComment.length > 0 && cleanComment.length < 5) {
      setError(
        "Write at least 5 characters, or leave the written review empty.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setSaving(false);
      router.replace("/login");
      return;
    }

    const payload = {
      user_id: user.id,
      product_id: Number(productId),
      order_id: Number(orderId),
      rating,
      comment: cleanComment || null,
    };

    let saveError: { message: string } | null = null;

    if (review) {
      const { error: updateError } = await supabase
        .from("reviews")
        .update({
          rating: payload.rating,
          comment: payload.comment,
          order_id: payload.order_id,
        })
        .eq("id", review.id)
        .eq("user_id", user.id);

      saveError = updateError;
    } else {
      const { data: insertedReview, error: insertError } = await supabase
        .from("reviews")
        .insert(payload)
        .select("id, rating, comment")
        .single();

      saveError = insertError;

      if (insertedReview) {
        setReview({
          id: String(insertedReview.id),
          rating: Number(insertedReview.rating),
          comment: insertedReview.comment
            ? String(insertedReview.comment)
            : null,
        });
      }
    }

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setSuccess(review ? "Your review was updated." : "Your review was saved.");
    setSaving(false);

    window.setTimeout(() => {
      router.push(`/my-orders/${orderId}`);
      router.refresh();
    }, 900);
  }

  const displayedRating = hoveredRating || rating;

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-4 py-24 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="animate-pulse rounded-3xl border border-white/10 bg-zinc-950 p-8">
            <div className="h-8 w-48 rounded bg-white/10" />
            <div className="mt-8 h-28 rounded-2xl bg-white/10" />
            <div className="mt-8 h-14 rounded-2xl bg-white/10" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !eligible) {
    return (
      <main className="min-h-screen bg-black px-4 py-24 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-500/30 bg-zinc-950 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-3xl font-black">Review unavailable</h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">{error}</p>

          <Link
            href={orderId ? `/my-orders/${orderId}` : "/my-orders"}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-6 font-bold transition hover:bg-red-500"
          >
            Return to My Orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-3xl">
        <Link
          href={orderId ? `/my-orders/${orderId}` : "/my-orders"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to order
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
          <div className="border-b border-white/10 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-red-500">
              Verified purchase
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              {review ? "Edit your review" : "Leave a review"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Reviewing this purchase is optional. A star rating is required
              only when you decide to submit, and the written comment can be
              left empty.
            </p>
          </div>

          {product && (
            <div className="flex items-center gap-4 border-b border-white/10 p-6 sm:p-8">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                {product.image ? (
                  // A normal img element supports both remote and local product URLs
                  // without requiring changes to next.config.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-extrabold">
                  {product.name}
                </h2>

                {product.price !== null && Number.isFinite(product.price) && (
                  <p className="mt-2 text-sm font-semibold text-zinc-400">
                    ₱
                    {product.price.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}

                <p className="mt-2 text-xs text-zinc-500">Order #{orderId}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-8">
            <fieldset>
              <legend className="text-sm font-extrabold">
                How would you rate this product?
              </legend>

              <div
                className="mt-4 flex flex-wrap gap-2"
                onMouseLeave={() => setHoveredRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= displayedRating;

                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} star${star === 1 ? "" : "s"}`}
                      aria-pressed={rating === star}
                      onMouseEnter={() => setHoveredRating(star)}
                      onFocus={() => setHoveredRating(star)}
                      onBlur={() => setHoveredRating(0)}
                      onClick={() => {
                        setRating(star);
                        setError("");
                      }}
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl transition focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        active
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                          : "border-white/10 bg-white/[0.03] text-zinc-600 hover:border-white/20 hover:text-zinc-400"
                      }`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 min-h-5 text-sm text-zinc-400">
                {displayedRating === 1 && "Poor"}
                {displayedRating === 2 && "Fair"}
                {displayedRating === 3 && "Good"}
                {displayedRating === 4 && "Very good"}
                {displayedRating === 5 && "Excellent"}
                {displayedRating === 0 && "Choose from 1 to 5 stars."}
              </p>
            </fieldset>

            <div>
              <label
                htmlFor="review-comment"
                className="text-sm font-extrabold"
              >
                Written review{" "}
                <span className="font-normal text-zinc-500">(optional)</span>
              </label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                  setError("");
                }}
                rows={6}
                maxLength={1000}
                placeholder="Tell other customers what you liked about the product..."
                className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />

              <div className="mt-2 flex items-center justify-between gap-4 text-xs text-zinc-500">
                <span>Leave empty for a star-only review.</span>
                <span>{comment.length}/1000</span>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
              >
                {success}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
              <Link
                href={orderId ? `/my-orders/${orderId}` : "/my-orders"}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 font-bold text-zinc-200 transition hover:border-white/30 hover:bg-white/5"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || rating === 0}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-7 font-extrabold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : review
                    ? "Update Review"
                    : "Submit Review"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black px-4 py-24 text-white">
          <div className="mx-auto max-w-3xl animate-pulse rounded-3xl border border-white/10 bg-zinc-950 p-8">
            <div className="h-8 w-48 rounded bg-white/10" />
            <div className="mt-8 h-28 rounded-2xl bg-white/10" />
          </div>
        </main>
      }
    >
      <ReviewPageContent />
    </Suspense>
  );
}