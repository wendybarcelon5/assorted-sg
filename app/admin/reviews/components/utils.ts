import {
  RatingFilter,
  Review,
  ReviewFilter,
  ReviewSort,
  ReviewSummary,
} from "./types";

export function formatReviewDate(
  date?: string | null
) {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function normalizeRating(value: unknown) {
  const rating = Number(value ?? 0);

  if (!Number.isFinite(rating)) {
    return 0;
  }

  return Math.min(5, Math.max(0, rating));
}

export function getReviewSummary(
  reviews: Review[]
): ReviewSummary {
  const totalReviews = reviews.length;

  const totalRating = reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  const averageRating =
    totalReviews > 0
      ? totalRating / totalReviews
      : 0;

  const approvedReviews = reviews.filter(
    (review) => review.status === "approved"
  ).length;

  const pendingReviews = reviews.filter(
    (review) => review.status === "pending"
  ).length;

  const rejectedReviews = reviews.filter(
    (review) => review.status === "rejected"
  ).length;

  const fiveStarReviews = reviews.filter(
    (review) => review.rating === 5
  ).length;

  return {
    totalReviews,
    averageRating,
    approvedReviews,
    pendingReviews,
    rejectedReviews,
    fiveStarReviews,
  };
}

export function filterReviews(
  reviews: Review[],
  search: string,
  statusFilter: ReviewFilter,
  ratingFilter: RatingFilter
) {
  const normalizedSearch = search
    .trim()
    .toLowerCase();

  return reviews.filter((review) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      review.customer_name
        .toLowerCase()
        .includes(normalizedSearch) ||
      review.customer_email
        .toLowerCase()
        .includes(normalizedSearch) ||
      review.product_name
        .toLowerCase()
        .includes(normalizedSearch) ||
      review.title
        .toLowerCase()
        .includes(normalizedSearch) ||
      review.comment
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "verified"
          ? review.verified_purchase
          : review.status === statusFilter;

    const matchesRating =
      ratingFilter === "all"
        ? true
        : review.rating === Number(ratingFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRating
    );
  });
}

export function sortReviews(
  reviews: Review[],
  sort: ReviewSort
) {
  return [...reviews].sort((a, b) => {
    switch (sort) {
      case "oldest":
        return (
          new Date(a.created_at ?? 0).getTime() -
          new Date(b.created_at ?? 0).getTime()
        );

      case "highest-rating":
        return b.rating - a.rating;

      case "lowest-rating":
        return a.rating - b.rating;

      case "customer":
        return a.customer_name.localeCompare(
          b.customer_name
        );

      case "product":
        return a.product_name.localeCompare(
          b.product_name
        );

      default:
        return (
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
        );
    }
  });
}