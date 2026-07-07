"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
} from "lucide-react";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const { data: orders } = await supabase
      .from("orders")
      .select("total,email");

    const { count: products } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    const revenue =
      orders?.reduce(
        (sum, order) => sum + Number(order.total),
        0
      ) || 0;

    const uniqueCustomers = new Set(
      orders?.map((o) => o.email)
    ).size;

    setStats({
      revenue,
      orders: orders?.length || 0,
      customers: uniqueCustomers,
      products: products || 0,
    });
  }

  const cards = [
    {
      title: "Revenue",
      value: `₱${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-600",
    },
    {
      title: "Orders",
      value: stats.orders,
      icon: ShoppingBag,
      color: "bg-blue-600",
    },
    {
      title: "Customers",
      value: stats.customers,
      icon: Users,
      color: "bg-purple-600",
    },
    {
      title: "Products",
      value: stats.products,
      icon: Package,
      color: "bg-red-600",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-3xl bg-[#1E293B] p-6 shadow-lg transition hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-400">
                  {card.title}
                </p>

                <h2 className="mt-3 text-3xl font-black text-white">
                  {card.value}
                </h2>

              </div>

              <div className={`${card.color} rounded-2xl p-4`}>
                <Icon className="text-white" size={28} />
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}