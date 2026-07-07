"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Package,
  Printer,
  Save,
} from "lucide-react";

type Order = {
  id: number;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  payment_method: string;
  payment_reference: string | null;
  receipt_url: string | null;
  total: number;
  status: string;
  created_at: string;
};

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [order, setOrder] =
    useState<Order | null>(null);

  const [items, setItems] = useState<
    OrderItem[]
  >([]);

  const [status, setStatus] =
    useState("");

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    setLoading(true);

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .single();

    if (data) {
      setOrder(data);
      setStatus(data.status);
    }

    const { data: orderItems } =
      await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", params.id);

    setItems(orderItems || []);

    setLoading(false);
  }

  async function saveStatus() {
    if (!order) return;

    await supabase
      .from("orders")
      .update({
        status,
      })
      .eq("id", order.id);

    loadOrder();

    alert("Order updated.");
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-white text-xl">
        Order not found.
      </div>
    );
  }

  return (
    <main className="space-y-8">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <Link
            href="/admin/orders"
            className="rounded-xl bg-[#1E293B] p-3 transition hover:bg-red-600"
          >
            <ArrowLeft />
          </Link>

          <div>

            <h1 className="text-4xl font-black text-white">
              Order #{order.id}
            </h1>

            <p className="mt-2 text-gray-400">
              {new Date(
                order.created_at
              ).toLocaleString()}
            </p>

          </div>

        </div>

        <div className="flex gap-3">

          <button
            onClick={() =>
              window.print()
            }
            className="flex items-center gap-2 rounded-xl bg-[#1E293B] px-6 py-3 font-bold text-white hover:bg-[#263247]"
          >
            <Printer size={18} />

            Print
          </button>

          <button
            onClick={saveStatus}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
          >
            <Save size={18} />

            Save
          </button>

        </div>

      </div>
```
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Customer */}

        <div className="rounded-3xl bg-[#1E293B] p-8 lg:col-span-2">

          <h2 className="mb-6 flex items-center gap-3 text-2xl font-black text-white">

            <User className="text-red-500" />

            Customer Information

          </h2>

          <div className="space-y-5">

            <div className="flex items-center gap-3 text-gray-300">

              <User size={18} />

              <span>{order.customer_name}</span>

            </div>

            <div className="flex items-center gap-3 text-gray-300">

              <Mail size={18} />

              <span>{order.email}</span>

            </div>

            <div className="flex items-center gap-3 text-gray-300">

              <Phone size={18} />

              <span>{order.phone}</span>

            </div>

            <div className="flex items-start gap-3 text-gray-300">

              <MapPin size={18} className="mt-1" />

              <span>{order.address}</span>

            </div>

          </div>

        </div>

        {/* Payment */}

        <div className="rounded-3xl bg-[#1E293B] p-8">

          <h2 className="mb-6 flex items-center gap-3 text-2xl font-black text-white">

            <CreditCard className="text-red-500" />

            Payment

          </h2>

          <div className="space-y-5">

            <div>

              <p className="text-sm text-gray-400">
                Method
              </p>

              <p className="font-bold text-white">
                {order.payment_method}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-400">
                Reference
              </p>

              <p className="font-bold text-white">
                {order.payment_reference || "-"}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-400">
                Total
              </p>

              <p className="text-3xl font-black text-[#D4AF37]">
                ₱
                {Number(
                  order.total
                ).toLocaleString()}
              </p>

            </div>

            <div>

              <p className="mb-2 text-sm text-gray-400">
                Status
              </p>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full rounded-xl bg-[#111827] px-4 py-3 text-white outline-none"
              >
                <option>Pending</option>

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

          </div>

        </div>

      </div>

      {/* Products */}

      <div className="rounded-3xl bg-[#1E293B] p-8">

        <h2 className="mb-8 flex items-center gap-3 text-2xl font-black text-white">

          <Package className="text-red-500" />

          Ordered Products

        </h2>

        <div className="space-y-4">

          {items.map((item) => (

            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-[#111827] p-5"
            >

              <div>

                <h3 className="font-bold text-white">
                  {item.product_name}
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Quantity: {item.quantity}
                </p>

              </div>

              <div className="text-right">

                <p className="text-xl font-black text-[#D4AF37]">

                  ₱
                  {Number(
                    item.price
                  ).toLocaleString()}

                </p>

              </div>

            </div>

          ))}

        </div>

      </div>
      
