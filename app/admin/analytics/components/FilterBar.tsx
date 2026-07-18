"use client";

import { CalendarDays } from "lucide-react";
import { DateFilter } from "./types";

type FilterBarProps = {
  value: DateFilter;
  onChange: (filter: DateFilter) => void;
};

const filters: {
  label: string;
  value: DateFilter;
}[] = [
  {
    label: "Today",
    value: "today",
  },
  {
    label: "Last 7 Days",
    value: "7days",
  },
  {
    label: "Last 30 Days",
    value: "30days",
  },
  {
    label: "This Year",
    value: "year",
  },
  {
    label: "All Time",
    value: "all",
  },
];

export default function FilterBar({
  value,
  onChange,
}: FilterBarProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 shadow-xl md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
            <CalendarDays size={22} />
          </div>

          <div>
            <h2 className="font-bold text-white">
              Analytics Period
            </h2>

            <p className="text-sm text-gray-400">
              Select the period you want to analyze.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              className={`rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-200 ${
                value === filter.value
                  ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-red-500/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}