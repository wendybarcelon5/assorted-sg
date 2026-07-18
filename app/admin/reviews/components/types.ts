export type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

export type Review = {
  id: string | number;
  created_at?: string | null;
  customer_name: string;
  customer_email: string;
  product_name: string;
  product_id?: string | number | null;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  verified_purchase: boolean;
};

export type ReviewSummary = {
  totalReviews: number;
  averageRating: number;
  approvedReviews: number;
  pendingReviews: number;
  rejectedReviews: number;
  fiveStarReviews: number;
};

export type ReviewFilter =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "verified";

export type RatingFilter =
  | "all"
  | "5"
  | "4"
  | "3"
  | "2"
  | "1";

export type ReviewSort =
  | "newest"
  | "oldest"
  | "highest-rating"
  | "lowest-rating"
  | "customer"
  | "product";