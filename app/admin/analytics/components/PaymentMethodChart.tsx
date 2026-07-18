"use client";

import { CreditCard } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Order, PaymentMethodData } from "./types";
import { formatCurrency, isSuccessfulOrder } from "./utils";

type PaymentMethodChartProps = {
  orders: Order[];
};

const COLORS = [
  "#dc2626",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

function normalizePaymentMethod(value?: string | null) {
  const method = value?.trim().toLowerCase();

  if (!method) {
    return "Unknown";
  }

  if (method.includes("gcash")) {
    return "GCash";
  }

  if (method.includes("maya") || method.includes("paymaya")) {
    return "Maya";
  }

  if (
    method.includes("cash") ||
    method.includes("cod") ||
    method.includes("delivery")
  ) {
    return "Cash on Delivery";
  }

  if (
    method.includes("bank") ||
    method.includes("transfer")
  ) {
    return "Bank Transfer";
  }

  if (
    method.includes("card") ||
    method.includes("visa") ||
    method.includes("mastercard")
  ) {
    return "Card";
  }

  return value?.trim() || "Unknown";
}

function createPaymentMethodData(
  orders: Order[]
): PaymentMethodData[] {
  const totals = new Map<string, number>();

  orders
    .filter(isSuccessfulOrder)
    .forEach((order) => {
      const method = normalizePaymentMethod(
        order.payment_method
      );

      const currentValue = totals.get(method) ?? 0;

      totals.set(
        method,
        currentValue + Number(order.total ?? 0)
      );
    });

  return Array.from(totals.entries())
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

function PaymentTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: PaymentMethodData;
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold text-gray-400">
        {item.payload?.name ?? item.name}
      </p>

      <p className="mt-1 text-lg font-black text-white">
        {formatCurrency(Number(item.value ?? 0))}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
      <div>
        <CreditCard
          size={48}
          className="mx-auto text-gray-700"
        />

        <p className="mt-4 font-bold text-white">
          No payment data yet
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Payment method revenue will appear when successful
          orders are available.
        </p>
      </div>
    </div>
  );
}

export default function PaymentMethodChart({
  orders,
}: PaymentMethodChartProps) {
  const data = createPaymentMethodData(orders);

  const totalRevenue = data.reduce(
    (total, item) => total + item.value,
    0
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h2 className="text-2xl font-black text-white">
            Revenue by Payment Method
          </h2>

          <p className="mt-2 text-gray-400">
            See which payment options generate the most revenue.
          </p>
        </div>

        <div className="rounded-2xl bg-[#D4AF37]/10 p-3 text-[#D4AF37]">
          <CreditCard size={27} />
        </div>
      </div>

      <div className="mt-8">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="relative h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={112}
                    paddingAngle={4}
                    stroke="transparent"
                  >
                    {data.map((item, index) => (
                      <Cell
                        key={`${item.name}-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip content={<PaymentTooltip />} />

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
                    Total
                  </p>

                  <p className="mt-1 text-xl font-black text-white">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {data.map((item, index) => {
                const percentage =
                  totalRevenue > 0
                    ? (item.value / totalRevenue) * 100
                    : 0;

                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-3 w-3 flex-none rounded-full"
                        style={{
                          backgroundColor:
                            COLORS[index % COLORS.length],
                        }}
                      />

                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">
                          {item.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {percentage.toFixed(1)}% of revenue
                        </p>
                      </div>
                    </div>

                    <p className="flex-none font-black text-white">
                      {formatCurrency(item.value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}