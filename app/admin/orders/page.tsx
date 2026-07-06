"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Order = {
  id: number;
  customer_name: string;
  email: string;
  phone: string;
  total: number;
  status: string;
  created_at: string;
  payment_method: string;
  receipt_url: string | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setOrders(data || []);
  }

  async function updateStatus(id: number, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
  }

  return (
    <>
      <h1 className="text-5xl font-black">Orders</h1>

      <div className="mt-10 overflow-hidden rounded-xl border border-gray-800 bg-[#111]">
        <table className="w-full">
          <thead className="bg-black">
            <tr>
              <th className="p-4 text-left">Order #</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Payment</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-gray-800 hover:bg-gray-900"
              >
                <td className="p-4 font-bold">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-red-500 hover:underline"
                  >
                    #{order.id}
                  </Link>
                </td>

                <td className="p-4">{order.customer_name}</td>

                <td className="p-4">{order.email}</td>

                <td className="p-4">{order.phone}</td>

                <td className="p-4">
                  ₱{Number(order.total).toLocaleString()}
                </td>

                <td className="p-4">
                  <div className="space-y-1">
                    <p>{order.payment_method}</p>

                    {order.receipt_url && (
                      <a
                        href={order.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View Receipt
                      </a>
                    )}
                  </div>
                </td>

                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(order.id, e.target.value)
                    }
                    className="rounded border border-gray-700 bg-[#111] px-3 py-2"
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </td>

                <td className="p-4">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-gray-400"
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}