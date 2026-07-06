"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const categories = [
  "All",
  "Jackets",
  "Shirts",
  "Pants",
  "Shorts",
];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  }

  fetchProducts();
}, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black pt-32 text-white">
        <div className="mx-auto max-w-7xl px-8">

          <h1 className="text-center text-6xl font-black uppercase">
            Shop
          </h1>

          <p className="mt-4 text-center text-gray-400">
            Discover our latest collection.
          </p>

          {/* Search */}
          <div className="mx-auto mt-10 max-w-xl">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-[#111] px-5 py-4 text-white outline-none focus:border-red-600"
            />
          </div>

          {/* Categories */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-6 py-2 font-semibold uppercase transition ${
                  selectedCategory === category
                    ? "bg-red-600 text-white"
                    : "border border-red-600 text-white hover:bg-red-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))
            ) : (
              <div className="col-span-3 text-center">
                <p className="text-xl text-gray-400">
                  No products found.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}