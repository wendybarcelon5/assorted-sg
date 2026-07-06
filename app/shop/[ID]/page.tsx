"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/app/context/CartContext";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", Number(params.id))
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setProduct(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-black pt-32 text-center text-white">
          Loading...
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-black pt-32 text-center text-white">
          Product not found.
        </main>
        <Footer />
      </>
    );
  }

  // Product is guaranteed to exist after the check above
  const currentProduct = product;

  function addProduct() {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: currentProduct.id,
        name: `${currentProduct.name} (${selectedSize})`,
        price: currentProduct.price,
        image: currentProduct.image,
      });
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black pt-32 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-8 md:grid-cols-2">

          {/* Product Image */}
          <div>
            <img
              src={currentProduct.image || "/placeholder.jpg"}
              alt={currentProduct.name}
              className="w-full rounded-2xl"
            />
          </div>

          {/* Product Details */}
          <div>

            <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold uppercase">
              {currentProduct.category}
            </span>

            <h1 className="mt-6 text-5xl font-black">
              {currentProduct.name}
            </h1>

            <p className="mt-6 text-4xl font-black text-red-500">
              ₱{Number(currentProduct.price).toLocaleString()}
            </p>

            <p className="mt-8 text-lg leading-8 text-gray-300">
              {currentProduct.description}
            </p>

            {/* Size */}
            <h2 className="mt-8 text-xl font-bold">
              Size
            </h2>

            <div className="mt-4 flex gap-3">
              {["S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg border px-6 py-3 ${
                    selectedSize === size
                      ? "border-red-600 bg-red-600"
                      : "border-gray-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Quantity */}
            <h2 className="mt-8 text-xl font-bold">
              Quantity
            </h2>

            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="rounded-lg border border-gray-700 px-5 py-2"
              >
                -
              </button>

              <span className="text-2xl font-bold">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="rounded-lg border border-gray-700 px-5 py-2"
              >
                +
              </button>
            </div>

            {/* Buttons */}
            <div className="mt-10 grid grid-cols-2 gap-4">

              <button
                onClick={() => {
                  addProduct();
                  alert("Added to cart!");
                }}
                className="rounded-xl border border-red-600 py-4 font-bold transition hover:bg-red-600"
              >
                🛒 Add to Cart
              </button>

              <button
                onClick={() => {
                  addProduct();
                  router.push("/checkout");
                }}
                className="rounded-xl bg-red-600 py-4 font-bold text-white transition hover:bg-red-700"
              >
                ⚡ Buy Now
              </button>

            </div>

            <p className="mt-8 font-semibold text-green-400">
              Stock Available: {currentProduct.stock}
            </p>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}