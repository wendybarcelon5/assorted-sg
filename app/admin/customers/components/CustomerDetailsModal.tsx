"use client";

import { X, Mail, Phone, Calendar, ShoppingBag, CreditCard } from "lucide-react";

import { Customer } from "./types";
import { formatCurrency, formatDate } from "./utils";

type CustomerDetailsModalProps = {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
};

export default function CustomerDetailsModal({
  customer,
  open,
  onClose,
}: CustomerDetailsModalProps) {
  if (!open || !customer) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">

        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-2xl font-black text-white">
              {customer.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                {customer.name}
              </h2>

              <p className="text-gray-400">
                Customer Profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-3 text-gray-400 transition hover:border-red-500 hover:bg-red-600 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">

          <div className="grid gap-6 lg:grid-cols-2">

            <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="mb-5 text-lg font-black text-white">
                Contact Information
              </h3>

              <div className="space-y-4">

                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-red-400" />

                  <span className="text-gray-300">
                    {customer.email}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-red-400" />

                  <span className="text-gray-300">
                    {customer.phone || "-"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-red-400" />

                  <span className="text-gray-300">
                    First Order:
                    {" "}
                    {formatDate(customer.firstOrderDate)}
                  </span>
                </div>

              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="mb-5 text-lg font-black text-white">
                Customer Summary
              </h3>

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-gray-400">
                    Orders
                  </p>

                  <p className="mt-2 text-2xl font-black text-white">
                    {customer.totalOrders}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-gray-400">
                    Total Spent
                  </p>

                  <p className="mt-2 text-2xl font-black text-green-400">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-gray-400">
                    Average Order
                  </p>

                  <p className="mt-2 text-xl font-black text-white">
                    {formatCurrency(customer.averageOrderValue)}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-gray-400">
                    Status
                  </p>

                  <p className="mt-2 text-xl font-black capitalize text-blue-400">
                    {customer.status}
                  </p>
                </div>

              </div>
            </section>

          </div>

          <section className="mt-8">
            <h3 className="mb-5 text-xl font-black text-white">
              Order History
            </h3>

            <div className="space-y-3">

              {customer.orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center">
                  <ShoppingBag
                    size={42}
                    className="mx-auto text-gray-700"
                  />

                  <p className="mt-4 font-bold text-white">
                    No orders found
                  </p>
                </div>
              ) : (
                customer.orders.map((order) => (
                  <div
                    key={String(order.id)}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div>
                      <p className="font-bold text-white">
                        Order #{order.id}
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-8">

                      <div className="flex items-center gap-2">
                        <CreditCard
                          size={16}
                          className="text-red-400"
                        />

                        <span className="text-sm text-gray-300">
                          {order.payment_method || "-"}
                        </span>
                      </div>

                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-bold capitalize text-green-400">
                        {order.status}
                      </span>

                      <span className="font-black text-white">
                        {formatCurrency(Number(order.total ?? 0))}
                      </span>

                    </div>
                  </div>
                ))
              )}

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}