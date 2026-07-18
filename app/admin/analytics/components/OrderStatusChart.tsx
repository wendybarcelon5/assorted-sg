"use client";

import { ClipboardList } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Order, OrderStatusData } from "./types";

type OrderStatusChartProps = {
  orders: Order[];
};

const COLORS = [
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#6b7280",
];

function normalizeStatus(status?: string | null) {
  const value = status?.trim().toLowerCase();

  if (!value) return "Unknown";

  if (value.includes("deliver")) return "Delivered";
  if (value.includes("complete")) return "Completed";
  if (value.includes("ship")) return "Shipped";
  if (value.includes("process")) return "Processing";
  if (value.includes("pack")) return "Packing";
  if (value.includes("pend")) return "Pending";
  if (value.includes("cancel")) return "Cancelled";
  if (value.includes("refund")) return "Refunded";

  return status ?? "Unknown";
}

function createStatusData(
  orders: Order[]
): OrderStatusData[] {
  const counts = new Map<string, number>();

  orders.forEach((order) => {
    const status = normalizeStatus(order.status);

    counts.set(status, (counts.get(status) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

function StatusTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
  }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-gray-400">
        {payload[0].name}
      </p>

      <p className="mt-1 text-lg font-black text-white">
        {payload[0].value} orders
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20">
      <div className="text-center">
        <ClipboardList
          size={48}
          className="mx-auto text-gray-700"
        />

        <p className="mt-4 font-bold text-white">
          No orders available
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Order status statistics will appear here.
        </p>
      </div>
    </div>
  );
}

export default function OrderStatusChart({
  orders,
}: OrderStatusChartProps) {
  const data = createStatusData(orders);

  const totalOrders = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">
            Order Status Distribution
          </h2>

          <p className="mt-2 text-gray-400">
            Breakdown of all customer orders by status.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
          <ClipboardList size={27} />
        </div>
      </div>

      <div className="mt-8">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="relative h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={112}
                    paddingAngle={3}
                    stroke="transparent"
                  >
                    {data.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip content={<StatusTooltip />} />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-sm text-gray-300">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="-mt-8 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Orders
                  </p>

                  <p className="mt-1 text-2xl font-black text-white">
                    {totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {data.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[index % COLORS.length],
                      }}
                    />

                    <span className="font-semibold text-white">
                      {item.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-white">
                      {item.value}
                    </p>

                    <p className="text-xs text-gray-500">
                      {(
                        (item.value / totalOrders) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}