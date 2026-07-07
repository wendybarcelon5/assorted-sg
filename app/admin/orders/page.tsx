"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Eye,
  RefreshCw,
} from "lucide-react";

type Order = {
  id: number;
  customer_name: string;
  email: string;
  payment_method: string;
  total: number;
  status: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-500/20 text-yellow-400",
  "Awaiting Payment Verification":
    "bg-orange-500/20 text-orange-400",
  Preparing: "bg-blue-500/20 text-blue-400",
  Shipped: "bg-indigo-500/20 text-indigo-400",
  "Out for Delivery":
    "bg-cyan-500/20 text-cyan-400",
  Delivered: "bg-green-500/20 text-green-400",
  Cancelled: "bg-red-500/20 text-red-400",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);

    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    setOrders(data || []);

    setLoading(false);
  }

  async function updateStatus(
    id: number,
    status: string
  ) {
    await supabase
      .from("orders")
      .update({
        status,
      })
      .eq("id", id);

    loadOrders();
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customer_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        order.email
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        String(order.id).includes(search);

      const matchesStatus =
        statusFilter === "All"
          ? true
          : order.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  return (
    <main className="admin-page space-y-8">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-4xl font-black text-white">
            Orders
          </h1>

          <p className="mt-2 text-gray-400">
            Manage all customer orders.
          </p>

        </div>

        <button
          onClick={loadOrders}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
        >
          <RefreshCw size={18} />

          Refresh
        </button>

      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_220px]">

        <div className="flex items-center rounded-2xl bg-[#1E293B] px-4">

          <Search
            size={20}
            className="text-gray-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search customer, email or order ID..."
            className="h-14 w-full bg-transparent pl-3 text-white outline-none placeholder:text-gray-500"
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="h-14 rounded-2xl bg-[#1E293B] px-5 text-white outline-none"
        >
          <option>All</option>
          <option>Pending</option>
          <option>
            Awaiting Payment Verification
          </option>
          <option>Preparing</option>
          <option>Shipped</option>
          <option>
            Out for Delivery
          </option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>

      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1E293B]">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-[#111827]">

              <tr>

                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300">
                  Order
                </th>

                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300">
                  Customer
                </th>

                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300">
                  Payment
                </th>

                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300">
                  Total
                </th>

                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300">
                  Status
                </th>

                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>
                            {loading ? (

                <tr>

                  <td
                    colSpan={6}
                    className="py-14 text-center text-gray-400"
                  >
                    Loading orders...
                  </td>

                </tr>

              ) : filteredOrders.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="py-14 text-center text-gray-400"
                  >
                    No orders found.
                  </td>

                </tr>

              ) : (

                filteredOrders.map((order) => (

                  <tr
                    key={order.id}
                    className="border-t border-white/10 transition hover:bg-[#263247]"
                  >

                    <td className="px-6 py-5 font-bold text-red-500">
                      #{order.id}
                    </td>

                    <td className="px-6 py-5">

                      <p className="font-semibold text-white">
                        {order.customer_name}
                      </p>

                      <p className="text-sm text-gray-400">
                        {order.email}
                      </p>

                    </td>

                    <td className="px-6 py-5 text-white">
                      {order.payment_method}
                    </td>

                    <td className="px-6 py-5 font-black text-[#D4AF37]">
                      ₱
                      {Number(
                        order.total
                      ).toLocaleString()}
                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={`rounded-full px-4 py-2 text-xs font-bold ${
                          statusColors[
                            order.status
                          ] ||
                          "bg-gray-700 text-white"
                        }`}
                      >
                        {order.status}
                      </span>

                    </td>

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                          <Eye size={16} />

                          View
                        </Link>

                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(
                              order.id,
                              e.target.value
                            )
                          }
                          className="rounded-lg bg-[#111827] px-3 py-2 text-sm text-white outline-none"
                        >
                          <option>
                            Pending
                          </option>

                          <option>
                            Awaiting Payment Verification
                          </option>

                          <option>
                            Preparing
                          </option>

                          <option>
                            Shipped
                          </option>

                          <option>
                            Out for Delivery
                          </option>

                          <option>
                            Delivered
                          </option>

                          <option>
                            Cancelled
                          </option>

                        </select>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </main>

  );

}