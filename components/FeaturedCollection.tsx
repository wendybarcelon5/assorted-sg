"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard from "./ProductCard";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
};

export default function FeaturedCollection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error(error);
        return;
      }

      setProducts(data || []);
    }

    loadProducts();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#0b0b0b] py-32">

      {/* Background Glow */}
      <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-red-600/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}

        <div className="flex flex-col items-center justify-between gap-10 md:flex-row">

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-[#D4AF37]">

              <Sparkles size={14} />

              Featured Collection

            </div>

            <h2 className="text-5xl font-black uppercase leading-tight md:text-6xl">
              Discover Our
              <span className="block text-red-600">
                Best Sellers
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Explore premium streetwear designed with comfort,
              quality, and confidence in mind. Every piece is made to
              elevate your everyday style.
            </p>

          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 rounded-xl border border-red-600 px-8 py-4 font-bold uppercase tracking-wider transition hover:bg-red-600"
          >
            View All

            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </Link>

        </div>

        {/* Products */}

        <div className="mt-20 grid gap-10 md:grid-cols-2 xl:grid-cols-3">

          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </div>

    </section>
  );
}