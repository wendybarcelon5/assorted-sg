"use client";

import {
  ChevronRight,
  Mail,
  Phone,
  ShoppingBag,
} from "lucide-react";

import type {
  Customer,
  CustomerStatus,
} from "./types";

import {
  formatCurrency,
  formatDate,
} from "./utils";

type CustomerTableProps = {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
};

function getStatusClasses(status: CustomerStatus) {
  switch (status) {
    case "active":
      return "border-green-500/20 bg-green-500/10 text-green-400";

    case "new":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";

    case "returning":
      return "border-purple-500/20 bg-purple-500/10 text-purple-400";

    default:
      return "border-gray-500/20 bg-gray-500/10 text-gray-400";
  }
}

function EmptyState() {
  return (
    <div className="flex h-80 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#111827]">
      <div className="text-center">
        <ShoppingBag
          size={48}
          className="mx-auto text-gray-700"
        />

        <p className="mt-4 font-bold text-white">
          No customers found
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your search or filters.
        </p>
      </div>
    </div>
  );
}

export default function CustomerTable({
  customers,
  onSelectCustomer,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-white/10 bg-black/20">
            <tr>
              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Customer
              </th>

              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Orders
              </th>

              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Total Spent
              </th>

              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Average Order
              </th>

              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Last Order
              </th>

              <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                Status
              </th>

              <th className="px-6 py-5" />
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-white/5 transition hover:bg-white/[0.03]"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-lg font-black text-white">
                      {customer.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">
                        {customer.name}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                        <Mail size={14} />

                        <span className="truncate">
                          {customer.email || "No email"}
                        </span>
                      </div>

                      {customer.phone && (
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          <Phone size={14} />

                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5 font-bold text-white">
                  {customer.totalOrders}
                </td>

                <td className="px-6 py-5 font-black text-green-400">
                  {formatCurrency(customer.totalSpent)}
                </td>

                <td className="px-6 py-5 text-white">
                  {formatCurrency(
                    customer.averageOrderValue
                  )}
                </td>

                <td className="px-6 py-5 text-gray-300">
                  {formatDate(customer.lastOrderDate)}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
                      customer.status
                    )}`}
                  >
                    {customer.status}
                  </span>
                </td>

                <td className="px-6 py-5 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectCustomer(customer)
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:border-red-500 hover:bg-red-600"
                  >
                    View
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}