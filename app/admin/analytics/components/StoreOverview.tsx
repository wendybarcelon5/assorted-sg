"use client";

import {
  Crown,
  Package,
  ShoppingBag,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

import { TopCustomer, TopProduct } from "./types";
import { formatCurrency } from "./utils";

type StoreOverviewProps = {
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
};

function EmptyProducts() {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
      <div>
        <Package
          size={48}
          className="mx-auto text-gray-700"
        />

        <p className="mt-4 font-bold text-white">
          No product activity yet
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Your best-selling products will appear after customers
          place successful orders.
        </p>
      </div>
    </div>
  );
}

function EmptyCustomers() {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
      <div>
        <Users
          size={48}
          className="mx-auto text-gray-700"
        />

        <p className="mt-4 font-bold text-white">
          No customer activity yet
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Your top customers will appear when customer orders are
          available.
        </p>
      </div>
    </div>
  );
}

function RankBadge({
  rank,
}: {
  rank: number;
}) {
  if (rank === 1) {
    return (
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
        <Crown size={22} />
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-gray-400/10 font-black text-gray-300">
        2
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-orange-500/10 font-black text-orange-400">
        3
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white/5 font-black text-gray-500">
      {rank}
    </div>
  );
}

export default function StoreOverview({
  topProducts,
  topCustomers,
}: StoreOverviewProps) {
  const products = topProducts.slice(0, 5);
  const customers = topCustomers.slice(0, 5);

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="text-2xl font-black text-white">
              Top Products
            </h2>

            <p className="mt-2 text-gray-400">
              Products generating the highest sales revenue.
            </p>
          </div>

          <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
            <Trophy size={27} />
          </div>
        </div>

        <div className="mt-8">
          {products.length === 0 ? (
            <EmptyProducts />
          ) : (
            <div className="space-y-3">
              {products.map((product, index) => (
                <div
                  key={`${product.name}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-red-500/30 hover:bg-white/[0.07]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <RankBadge rank={index + 1} />

                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">
                        {product.name}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                        <ShoppingBag size={14} />

                        <span>
                          {product.quantity} item
                          {product.quantity === 1 ? "" : "s"} sold
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-none text-right">
                    <p className="font-black text-white">
                      {formatCurrency(product.revenue)}
                    </p>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-green-400">
                      Revenue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>

      <article className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl md:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="text-2xl font-black text-white">
              Top Customers
            </h2>

            <p className="mt-2 text-gray-400">
              Customers with the highest total spending.
            </p>
          </div>

          <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
            <UserRound size={27} />
          </div>
        </div>

        <div className="mt-8">
          {customers.length === 0 ? (
            <EmptyCustomers />
          ) : (
            <div className="space-y-3">
              {customers.map((customer, index) => (
                <div
                  key={`${customer.email}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-blue-500/30 hover:bg-white/[0.07]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <RankBadge rank={index + 1} />

                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">
                        {customer.name || "Customer"}
                      </p>

                      <p className="mt-1 truncate text-sm text-gray-500">
                        {customer.email || "No email available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex-none text-right">
                    <p className="font-black text-white">
                      {formatCurrency(customer.spent)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {customer.orders} order
                      {customer.orders === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </section>
  );
}