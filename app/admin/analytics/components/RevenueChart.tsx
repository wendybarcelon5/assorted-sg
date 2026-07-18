"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartData } from "./types";
import {
  formatCompactCurrency,
  formatCurrency,
} from "./utils";

type RevenueChartProps = {
  data: ChartData[];
};

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-green-400">
        {formatCurrency(Number(payload[0]?.value ?? 0))}
      </p>
    </div>
  );
}

export default function RevenueChart({
  data,
}: RevenueChartProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">
            Revenue Performance
          </h2>

          <p className="mt-2 text-gray-400">
            Revenue generated during the selected period.
          </p>
        </div>
      </div>

      <div className="mt-8 h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#22c55e"
                  stopOpacity={0.45}
                />

                <stop
                  offset="95%"
                  stopColor="#22c55e"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(255,255,255,.08)"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              stroke="#6B7280"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              minTickGap={20}
            />

            <YAxis
              stroke="#6B7280"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={formatCompactCurrency}
            />

            <Tooltip
              content={<RevenueTooltip />}
              cursor={{
                stroke: "rgba(255,255,255,.15)",
                strokeWidth: 1,
              }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              activeDot={{
                r: 6,
                fill: "#22c55e",
                stroke: "#111827",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}