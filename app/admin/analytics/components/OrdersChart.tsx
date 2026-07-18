"use client";

import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartData } from "./types";

type OrdersChartProps = {
  data: ChartData[];
};

function OrdersTooltip({
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
      <p className="text-sm font-semibold text-gray-400">{label}</p>

      <p className="mt-1 text-lg font-black text-red-400">
        {Number(payload[0]?.value ?? 0)} orders
      </p>
    </div>
  );
}

export default function OrdersChart({
  data,
}: OrdersChartProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h2 className="text-2xl font-black text-white">
            Order Activity
          </h2>

          <p className="mt-2 text-gray-400">
            Number of orders received during the selected period.
          </p>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
          <BarChart3 size={27} />
        </div>
      </div>

      <div className="mt-8 h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -25,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(255,255,255,0.08)"
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
              allowDecimals={false}
              stroke="#6B7280"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <Tooltip
              content={<OrdersTooltip />}
              cursor={{
                fill: "rgba(239,68,68,0.08)",
              }}
            />

            <Bar
              dataKey="orders"
              fill="#dc2626"
              radius={[8, 8, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}