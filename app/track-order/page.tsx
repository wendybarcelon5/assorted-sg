"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Package,
  Home,
  CheckCircle2,
  Truck,
  Clock,
} from "lucide-react";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  async function trackOrder() {
    if (!orderNumber.trim()) {
      alert("Please enter your order number.");
      return;
    }

    setLoading(true);

    const id = Number(orderNumber.replace("ASG-", ""));

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    setLoading(false);

    if (error) {
      alert("Order not found.");
      return;
    }

    setOrder(data);
  }

  const status = order?.status || "";

  return (
    <main className="min-h-screen bg-black py-32 px-6 text-white">

      <div className="mx-auto max-w-3xl">

        <h1 className="text-center text-5xl font-black uppercase">
          Track Order
        </h1>

        <p className="mt-4 text-center text-gray-400">
          Enter your order number below.
        </p>

        <div className="mt-12 flex gap-4">

          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="ASG-123"
            className="flex-1 rounded-xl border border-gray-700 bg-[#111] p-4"
          />

          <button
            onClick={trackOrder}
            className="rounded-xl bg-red-600 px-8 font-bold hover:bg-red-700"
          >
            {loading ? "Searching..." : <Search />}
          </button>

        </div>

        {order && (

          <div className="mt-12 rounded-3xl border border-white/10 bg-[#111] p-8">

            <h2 className="text-3xl font-black">
              Order #{order.id}
            </h2>

            <p className="mt-2 text-gray-400">
              {order.customer_name}
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">

              <div className="rounded-xl bg-black p-5">

                <Package className="text-red-500" />

                <p className="mt-3 text-gray-400">
                  Payment Method
                </p>

                <h3 className="text-xl font-bold">
                  {order.payment_method}
                </h3>

              </div>

              <div className="rounded-xl bg-black p-5">

                <Clock className="text-red-500" />

                <p className="mt-3 text-gray-400">
                  Total
                </p>

                <h3 className="text-xl font-bold">
                  ₱{Number(order.total).toLocaleString()}
                </h3>

              </div>

            </div>

            <div className="mt-10">

              <h3 className="text-2xl font-bold">
                Order Status
              </h3>

              <div className="mt-8 space-y-5">

                <Status
                  active={true}
                  done={true}
                  title="Order Received"
                />

                <Status
                  active={
                    status !== "Pending"
                  }
                  done={
                    status !== "Pending"
                  }
                  title="Payment Verified"
                />

                <Status
                  active={
                    status === "Preparing" ||
                    status === "Shipped" ||
                    status === "Out for Delivery" ||
                    status === "Delivered"
                  }
                  done={
                    status === "Shipped" ||
                    status === "Out for Delivery" ||
                    status === "Delivered"
                  }
                  title="Preparing Order"
                />

                <Status
                  active={
                    status === "Shipped" ||
                    status === "Out for Delivery" ||
                    status === "Delivered"
                  }
                  done={
                    status === "Out for Delivery" ||
                    status === "Delivered"
                  }
                  title="Shipped"
                />

                <Status
                  active={
                    status === "Out for Delivery" ||
                    status === "Delivered"
                  }
                  done={
                    status === "Delivered"
                  }
                  title="Out for Delivery"
                />

                <Status
                  active={
                    status === "Delivered"
                  }
                  done={
                    status === "Delivered"
                  }
                  title="Delivered"
                />

              </div>

            </div>

          </div>

        )}

        <Link
          href="/"
          className="mx-auto mt-12 flex w-fit items-center gap-3 rounded-xl border border-white/10 px-8 py-4 font-bold hover:border-red-600"
        >
          <Home />
          Back to Home
        </Link>

      </div>

    </main>
  );
}

function Status({
  title,
  active,
  done,
}: {
  title: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-4">

      {done ? (
        <CheckCircle2 className="text-green-500" />
      ) : active ? (
        <Truck className="text-yellow-500" />
      ) : (
        <div className="h-6 w-6 rounded-full border border-gray-600" />
      )}

      <span
        className={
          active
            ? "font-bold"
            : "text-gray-500"
        }
      >
        {title}
      </span>

    </div>
  );
}