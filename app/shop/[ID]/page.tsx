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
      return;
    }

    setProduct(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-black pt-32 text-white text-center">
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
        <main className="min-h-screen bg-black pt-32 text-white text-center">
          Product not found.
        </main>
        <Footer />
      </>
    );
  }

  function addProduct() {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: `${product.name} (${selectedSize})`,
        price: product.price,
        image: product.image,
      });
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black pt-32 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-8 md:grid-cols-2">

          <div>
            <img
              src={product.image || "/placeholder.jpg"}
              alt={product.name}
              className="w-full rounded-2xl"
            />
          </div>

          <div>

            <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold uppercase">
              {product.category}
            </span>

            <h1 className="mt-6 text-5xl font-black">
              {product.name}
            </h1>

            <p className="mt-6 text-4xl font-black text-red-500">
              ₱{Number(product.price).toLocaleString()}
            </p>

            <p className="mt-8 text-lg leading-8 text-gray-300">
              {product.description}
            </p>

            <h2 className="mt-8 text-xl font-bold">
              Size
            </h2>

            <div className="mt-4 flex gap-3">
              {["S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg px-6 py-3 border ${
                    selectedSize === size
                      ? "border-red-600 bg-red-600"
                      : "border-gray-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

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

            <div className="mt-10 grid grid-cols-2 gap-4">

              <button
                onClick={() => {
                  addProduct();
                  alert("Added to cart!");
                }}
                className="rounded-xl border border-red-600 py-4 font-bold hover:bg-red-600"
              >
                🛒 Add to Cart
              </button>

              <button
                onClick={() => {
                  addProduct();
                  router.push("/checkout");
                }}
                className="rounded-xl bg-red-600 py-4 font-bold hover:bg-red-700"
              >
                ⚡ Buy Now
              </button>

            </div>

            <p className="mt-8 text-green-400 font-semibold">
              Stock Available: {product.stock}
            </p>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}