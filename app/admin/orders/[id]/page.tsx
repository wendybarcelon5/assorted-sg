"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  status: string;
};

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const id = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    loadOrder();
  }, []);
  async function updateStatus(status: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  setOrder((prev) =>
    prev ? { ...prev, status } : prev
  );

  alert("Order status updated!");
}

  async function loadOrder() {
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderData) {
      setOrder(orderData);
    }

    const { data: itemData } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id);

    if (itemData) {
      setItems(itemData);
    }
  }

  if (!order) {
    return <h1 className="text-3xl">Loading...</h1>;
  }

  return (
    <>
      <h1 className="text-5xl font-black">
        Order #{order.id}
      </h1>

      <div className="mt-8 rounded-xl bg-[#111] p-6 space-y-2">
        <p><strong>Customer:</strong> {order.customer_name}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p>
  <strong>Payment Method:</strong>{" "}
  {order.payment_method}
</p>
        <p><strong>Address:</strong> {order.address}</p>
        <div className="flex items-center gap-4">
  <strong>Status:</strong>

  <select
    value={order.status}
    onChange={(e) => updateStatus(e.target.value)}
    className="rounded-lg border border-gray-700 bg-[#111] p-2"
  >
    <option>Pending</option>
    <option>Processing</option>
    <option>Shipped</option>
    <option>Delivered</option>
    <option>Cancelled</option>
  </select>
</div>
        <p><strong>Total:</strong> ₱{Number(order.total).toLocaleString()}</p>
      </div>

      <div className="mt-10 rounded-xl bg-[#111] p-6">
        <h2 className="mb-6 text-2xl font-bold">
          Products
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Price</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-800">
                <td className="p-3">{item.product_name}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">
                  ₱{Number(item.price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}