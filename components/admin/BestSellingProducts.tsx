"use client";

import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

type Product = {
  id: string | number;
  name: string;
  image: string | null;
  price: number;
};

type OrderItem = {
  product_id: string | number | null;
  product_name: string;
  quantity: number;
};

type BestSeller = {
  id: string | number;
  name: string;
  image: string | null;
  price: number;
  quantitySold: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function BestSellingProducts() {
  const [products, setProducts] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);

    const [
      productsResult,
      orderItemsResult,
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id,name,image,price"),

      supabase
        .from("order_items")
        .select(
          "product_id,product_name,quantity"
        ),
    ]);

    if (
      productsResult.error ||
      orderItemsResult.error
    ) {
      console.error(
        productsResult.error ||
          orderItemsResult.error
      );

      setLoading(false);
      return;
    }

    const productMap = new Map<
      string,
      Product
    >();

    (productsResult.data ?? []).forEach(
      (product) => {
        productMap.set(
          String(product.id),
          {
            ...product,
            price: Number(product.price),
          }
        );
      }
    );

    const sales = new Map<
      string,
      BestSeller
    >();

    (
      orderItemsResult.data ?? []
    ).forEach((item: OrderItem) => {
      const key = String(item.product_id);

      const product =
        productMap.get(key);

      if (!product) return;

      if (!sales.has(key)) {
        sales.set(key, {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantitySold: 0,
        });
      }

      sales.get(key)!.quantitySold +=
        Number(item.quantity);
    });

    setProducts(
      Array.from(sales.values())
        .sort(
          (a, b) =>
            b.quantitySold -
            a.quantitySold
        )
        .slice(0, 5)
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const channel = supabase
      .channel("best-selling-products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
        },
        () => {
          void loadProducts();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(
        channel
      );
    };
  }, [loadProducts]);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#1E293B] shadow-xl">
      <div className="border-b border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white">
          Best Selling Products
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Top 5 products by quantity sold
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 p-6">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-10 text-center text-gray-400">
          No sales yet.
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {products.map(
            (product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-5"
              >
                <div className="text-lg font-bold text-red-500 w-8">
                  #{index + 1}
                </div>

                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-white">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {formatCurrency(
                      product.price
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-white">
                    {product.quantitySold}
                  </p>

                  <p className="text-xs text-gray-500">
                    Sold
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}