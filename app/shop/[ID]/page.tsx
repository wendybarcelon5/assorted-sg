"use client";

import { useCart } from "@/app/context/CartContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import {
  Heart,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  const productId = Array.isArray(params.id)
    ? Number(params.id[0])
    : Number(params.id);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [quantity, setQuantity] =
    useState(1);

  const [selectedSize, setSelectedSize] =
    useState("M");

  const [wishlistId, setWishlistId] =
    useState<string | null>(null);

  const [wishlistLoading, setWishlistLoading] =
    useState(true);

  const [wishlistUpdating, setWishlistUpdating] =
    useState(false);

  const [addingToCart, setAddingToCart] =
    useState(false);

  const [buyingNow, setBuyingNow] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setErrorMessage("Invalid product ID.");
      setLoading(false);
      setWishlistLoading(false);
      return;
    }

    void loadProduct();
    void loadWishlistStatus();
  }, [productId]);

  async function loadProduct() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, price, category, image, stock"
        )
        .eq("id", productId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setProduct(null);
        setErrorMessage("Product not found.");
        return;
      }

      const normalizedProduct: Product = {
        id: Number(data.id),
        name: data.name ?? "Unnamed Product",
        description: data.description ?? "",
        price: Number(data.price ?? 0),
        category: data.category ?? "Product",
        image: data.image ?? "",
        stock: Number(data.stock ?? 0),
      };

      setProduct(normalizedProduct);
    } catch (error) {
      console.error(
        "Product loading error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load this product."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadWishlistStatus() {
    try {
      setWishlistLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setWishlistId(null);
        return;
      }

      const { data, error } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setWishlistId(data?.id ?? null);
    } catch (error) {
      console.error(
        "Wishlist status error:",
        error
      );

      setWishlistId(null);
    } finally {
      setWishlistLoading(false);
    }
  }

  async function toggleWishlist() {
    if (
      wishlistUpdating ||
      wishlistLoading
    ) {
      return;
    }

    try {
      setWishlistUpdating(true);
      setMessage("");
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push(
          `/login?redirect=/shop/${productId}`
        );
        return;
      }

      if (wishlistId) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("id", wishlistId)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        setWishlistId(null);
        setMessage(
          "Removed from your wishlist."
        );
      } else {
        const { data, error } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: productId,
          })
          .select("id")
          .single();

        if (error) {
          throw error;
        }

        setWishlistId(data.id);
        setMessage(
          "Added to your wishlist."
        );
      }
    } catch (error) {
      console.error(
        "Wishlist update error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your wishlist."
      );
    } finally {
      setWishlistUpdating(false);
    }
  }

  function addSelectedProductToCart() {
    if (!product) {
      return;
    }

    if (product.stock <= 0) {
      setErrorMessage(
        "This product is currently out of stock."
      );
      return;
    }

    if (quantity > product.stock) {
      setErrorMessage(
        `Only ${product.stock} item${
          product.stock === 1 ? "" : "s"
        } are available.`
      );
      return;
    }

    for (
      let index = 0;
      index < quantity;
      index++
    ) {
      addToCart({
        id: product.id,
        name: `${product.name} (${selectedSize})`,
        price: product.price,
        image: product.image,
      });
    }
  }

  async function handleAddToCart() {
    try {
      setAddingToCart(true);
      setMessage("");
      setErrorMessage("");

      addSelectedProductToCart();

      if (
        product &&
        product.stock > 0 &&
        quantity <= product.stock
      ) {
        setMessage(
          `${quantity} item${
            quantity === 1 ? "" : "s"
          } added to your cart.`
        );
      }
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleBuyNow() {
    try {
      setBuyingNow(true);
      setMessage("");
      setErrorMessage("");

      if (
        !product ||
        product.stock <= 0 ||
        quantity > product.stock
      ) {
        addSelectedProductToCart();
        return;
      }

      addSelectedProductToCart();
      router.push("/checkout");
    } finally {
      setBuyingNow(false);
    }
  }

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  }

  function increaseQuantity() {
    if (!product) {
      return;
    }

    setQuantity((current) =>
      Math.min(
        Math.max(product.stock, 1),
        current + 1
      )
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-black px-4 pt-32 text-white">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-red-500" />

            <p className="mt-4 font-bold text-gray-300">
              Loading product...
            </p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-black px-4 pt-32 text-white">
          <div className="max-w-lg rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <h1 className="text-3xl font-black">
              Product Not Found
            </h1>

            <p className="mt-4 text-red-200">
              {errorMessage ||
                "This product does not exist or is no longer available."}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/shop")
              }
              className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-black transition hover:bg-red-500"
            >
              Return to Shop
            </button>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const outOfStock =
    product.stock <= 0;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black px-4 pb-16 pt-40 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Product Image */}

          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
            <div className="relative aspect-square overflow-hidden bg-black/30">
              <img
                src={
                  product.image ||
                  "/placeholder.jpg"
                }
                alt={product.name}
                className="h-full w-full object-cover"
              />

              <button
                type="button"
                onClick={() =>
                  void toggleWishlist()
                }
                disabled={
                  wishlistLoading ||
                  wishlistUpdating
                }
                aria-label={
                  wishlistId
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                className={`absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-full border shadow-xl backdrop-blur transition ${
                  wishlistId
                    ? "border-red-500 bg-red-600 text-white"
                    : "border-white/20 bg-black/70 text-white hover:border-red-500 hover:text-red-400"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {wishlistLoading ||
                wishlistUpdating ? (
                  <Loader2
                    size={24}
                    className="animate-spin"
                  />
                ) : (
                  <Heart
                    size={25}
                    fill={
                      wishlistId
                        ? "currentColor"
                        : "none"
                    }
                  />
                )}
              </button>

              {outOfStock && (
                <div className="absolute bottom-5 left-5 rounded-full bg-red-600 px-4 py-2 text-sm font-black uppercase tracking-wider text-white">
                  Out of Stock
                </div>
              )}
            </div>
          </section>

          {/* Product Details */}

          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] via-[#111827] to-black p-6 shadow-2xl md:p-8">
            <span className="inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-black uppercase tracking-wider">
              {product.category}
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-6 text-4xl font-black text-[#D4AF37]">
              ₱
              {product.price.toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>

            <p className="mt-8 text-lg leading-8 text-gray-300">
              {product.description ||
                "No description is available for this product."}
            </p>

            {message && (
              <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 font-bold text-green-300">
                {message}
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-bold text-red-300">
                {errorMessage}
              </div>
            )}

            {/* Size */}

            <div className="mt-9">
              <h2 className="text-xl font-black">
                Select Size
              </h2>

              <div className="mt-4 flex flex-wrap gap-3">
                {["S", "M", "L", "XL"].map(
                  (size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setSelectedSize(
                          size
                        )
                      }
                      className={`min-w-16 rounded-xl border px-5 py-3 font-black transition ${
                        selectedSize ===
                        size
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-white/10 bg-black/20 text-gray-300 hover:border-red-500"
                      }`}
                    >
                      {size}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Quantity */}

            <div className="mt-9">
              <h2 className="text-xl font-black">
                Quantity
              </h2>

              <div className="mt-4 inline-flex items-center overflow-hidden rounded-xl border border-white/10 bg-black/20">
                <button
                  type="button"
                  onClick={
                    decreaseQuantity
                  }
                  disabled={
                    quantity <= 1
                  }
                  className="flex h-12 w-12 items-center justify-center transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={20} />
                </button>

                <span className="flex h-12 min-w-16 items-center justify-center border-x border-white/10 text-xl font-black">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={
                    increaseQuantity
                  }
                  disabled={
                    outOfStock ||
                    quantity >=
                      product.stock
                  }
                  className="flex h-12 w-12 items-center justify-center transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Buttons */}

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  void handleAddToCart()
                }
                disabled={
                  outOfStock ||
                  addingToCart ||
                  buyingNow
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-red-600 px-5 py-4 font-black transition hover:bg-red-600 disabled:cursor-not-allowed disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-500"
              >
                {addingToCart ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart
                      size={20}
                    />
                    {outOfStock
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleBuyNow()
                }
                disabled={
                  outOfStock ||
                  addingToCart ||
                  buyingNow
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-4 font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
              >
                {buyingNow ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    Loading...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Buy Now
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
              <p
                className={`font-black ${
                  outOfStock
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {outOfStock
                  ? "Currently unavailable"
                  : `Stock Available: ${product.stock}`}
              </p>

              <button
                type="button"
                onClick={() =>
                  void toggleWishlist()
                }
                disabled={
                  wishlistLoading ||
                  wishlistUpdating
                }
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 font-black transition ${
                  wishlistId
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-white/10 bg-white/5 text-gray-300 hover:border-red-500 hover:text-red-400"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {wishlistLoading ||
                wishlistUpdating ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Heart
                    size={19}
                    fill={
                      wishlistId
                        ? "currentColor"
                        : "none"
                    }
                  />
                )}

                {wishlistId
                  ? "Saved to Wishlist"
                  : "Add to Wishlist"}
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}