"use client";

import Image from "next/image";
import { AlertTriangle, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

type Product = {
  id: string | number;
  name: string;
  category: string | null;
  image: string | null;
  stock: number | string | null;
};

const LOW_STOCK_LIMIT = 5;

function getStockClasses(stock: number) {
  if (stock === 0) {
    return "border-red-500/30 bg-red-500/10 text-red-400";
  }

  if (stock <= 2) {
    return "border-orange-500/30 bg-orange-500/10 text-orange-400";
  }

  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
}

function getStockLabel(stock: number) {
  if (stock === 0) {
    return "Out of stock";
  }

  if (stock === 1) {
    return "1 item left";
  }

  return `${stock} items left`;
}

export default function LowStockProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadLowStockProducts = useCallback(async () => {
    try {
      setErrorMessage("");

      const { data, error } = await supabase
        .from("products")
        .select(
          `
            id,
            name,
            category,
            image,
            stock
          `
        )
        .lte("stock", LOW_STOCK_LIMIT)
        .order("stock", {
          ascending: true,
        })
        .limit(5);

      if (error) {
        throw error;
      }

      const normalizedProducts = (data ?? []).map((product) => ({
        ...product,
        stock: Number(product.stock ?? 0),
      }));

      setProducts(normalizedProducts as Product[]);
    } catch (error) {
      console.error("Unable to load low-stock products:", error);

      setErrorMessage("Unable to load low-stock products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLowStockProducts();
  }, [loadLowStockProducts]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-low-stock-products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          void loadLowStockProducts();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadLowStockProducts]);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#1E293B] shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 p-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Low Stock Products
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Products with {LOW_STOCK_LIMIT} or fewer items remaining
          </p>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-3">
          <AlertTriangle
            className="text-yellow-400"
            size={22}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      ) : errorMessage ? (
        <div className="p-6">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="font-medium text-red-400">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadLowStockProducts();
              }}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
            <Package
              className="text-green-400"
              size={24}
            />
          </div>

          <p className="mt-4 font-semibold text-white">
            Stock levels look good
          </p>

          <p className="mt-1 text-sm text-gray-400">
            No products are currently low in stock.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {products.map((product) => {
            const stock = Number(product.stock ?? 0);

            return (
              <div
                key={product.id}
                className="flex items-center gap-4 p-5 transition hover:bg-white/[0.03]"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package
                        className="text-gray-500"
                        size={22}
                      />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-white">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    {product.category || "Uncategorized"}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${getStockClasses(
                    stock
                  )}`}
                >
                  {getStockLabel(stock)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}