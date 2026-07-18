"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import {
  RatingFilter,
  ReviewFilter,
  ReviewSort,
} from "./types";

type ReviewFiltersProps = {
  search: string;
  statusFilter: ReviewFilter;
  ratingFilter: RatingFilter;
  sort: ReviewSort;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: ReviewFilter) => void;
  onRatingFilterChange: (value: RatingFilter) => void;
  onSortChange: (value: ReviewSort) => void;
};

const statusOptions: {
  label: string;
  value: ReviewFilter;
}[] = [
  {
    label: "All Reviews",
    value: "all",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
  {
    label: "Verified",
    value: "verified",
  },
];

export default function ReviewFilters({
  search,
  statusFilter,
  ratingFilter,
  sort,
  resultCount,
  onSearchChange,
  onStatusFilterChange,
  onRatingFilterChange,
  onSortChange,
}: ReviewFiltersProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 shadow-xl md:p-6">
      <div className="flex flex-col gap-5">

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-400">
              <SlidersHorizontal size={22} />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Search & Filter
              </h2>

              <p className="text-sm text-gray-400">
                {resultCount} review
                {resultCount === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-4 xl:w-[900px]">

            <label className="relative lg:col-span-2">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="search"
                value={search}
                onChange={(e) =>
                  onSearchChange(e.target.value)
                }
                placeholder="Search customer, product..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-500"
              />
            </label>

            <select
              value={ratingFilter}
              onChange={(e) =>
                onRatingFilterChange(
                  e.target.value as RatingFilter
                )
              }
              className="rounded-2xl border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
            >
              <option value="all">
                All Ratings
              </option>

              <option value="5">
                ⭐ 5 Stars
              </option>

              <option value="4">
                ⭐ 4 Stars
              </option>

              <option value="3">
                ⭐ 3 Stars
              </option>

              <option value="2">
                ⭐ 2 Stars
              </option>

              <option value="1">
                ⭐ 1 Star
              </option>
            </select>

            <select
              value={sort}
              onChange={(e) =>
                onSortChange(
                  e.target.value as ReviewSort
                )
              }
              className="rounded-2xl border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="highest-rating">
                Highest Rating
              </option>

              <option value="lowest-rating">
                Lowest Rating
              </option>

              <option value="customer">
                Customer
              </option>

              <option value="product">
                Product
              </option>
            </select>

          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onStatusFilterChange(option.value)
              }
              className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                statusFilter === option.value
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-yellow-500 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}