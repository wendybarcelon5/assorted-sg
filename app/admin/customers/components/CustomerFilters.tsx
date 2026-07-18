"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import {
  CustomerFilter,
  CustomerSort,
} from "./types";

type CustomerFiltersProps = {
  search: string;
  filter: CustomerFilter;
  sort: CustomerSort;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: CustomerFilter) => void;
  onSortChange: (value: CustomerSort) => void;
};

const filterOptions: {
  label: string;
  value: CustomerFilter;
}[] = [
  {
    label: "All Customers",
    value: "all",
  },
  {
    label: "New",
    value: "new",
  },
  {
    label: "Returning",
    value: "returning",
  },
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
];

export default function CustomerFilters({
  search,
  filter,
  sort,
  resultCount,
  onSearchChange,
  onFilterChange,
  onSortChange,
}: CustomerFiltersProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 shadow-xl md:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
              <SlidersHorizontal size={22} />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Search and Filter
              </h2>

              <p className="text-sm text-gray-400">
                {resultCount} customer
                {resultCount === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[620px]">
            <label className="relative block">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  onSearchChange(event.target.value)
                }
                placeholder="Search name, email, or phone..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              />
            </label>

            <select
              value={sort}
              onChange={(event) =>
                onSortChange(
                  event.target.value as CustomerSort
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-[#0B1120] px-4 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
            >
              <option value="newest">
                Sort: Newest Activity
              </option>

              <option value="oldest">
                Sort: Oldest Customer
              </option>

              <option value="highest-spending">
                Sort: Highest Spending
              </option>

              <option value="lowest-spending">
                Sort: Lowest Spending
              </option>

              <option value="most-orders">
                Sort: Most Orders
              </option>

              <option value="name">
                Sort: Customer Name
              </option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onFilterChange(option.value)
              }
              className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                filter === option.value
                  ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-red-500/60 hover:bg-white/10 hover:text-white"
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