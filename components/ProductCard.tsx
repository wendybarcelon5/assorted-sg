"use client";

import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import {
  Heart,
  Loader2,
  ShoppingCart,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  stock?: number;
};

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();
  const router = useRouter();

  const image =
    product.image || "/placeholder.jpg";

  const stock = product.stock ?? 999;
  const outOfStock = stock <= 0;

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

  useEffect(() => {
    void loadWishlistStatus();
  }, [product.id]);

  async function loadWishlistStatus() {
    try {
      setWishlistLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setWishlistId(null);
        return;
      }

      const { data, error } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setWishlistId(data?.id ?? null);
    } catch (error) {
      console.error(
        "Unable to load wishlist status:",
        error
      );

      setWishlistId(null);
    } finally {
      setWishlistLoading(false);
    }
  }

  async function toggleWishlist() {
    if (
      wishlistLoading ||
      wishlistUpdating
    ) {
      return;
    }

    try {
      setWishlistUpdating(true);
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push(
          `/login?redirect=/shop`
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
        setMessage("Removed from wishlist.");
      } else {
        const { data, error } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: product.id,
          })
          .select("id")
          .single();

        if (error) {
          throw error;
        }

        setWishlistId(data.id);
        setMessage("Saved to wishlist.");
      }

      window.setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error(
        "Wishlist update error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update your wishlist."
      );
    } finally {
      setWishlistUpdating(false);
    }
  }

  function addProductToCart() {
    if (outOfStock) {
      alert(
        "This product is currently out of stock."
      );
      return false;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image,
    });

    return true;
  }

  async function handleAddToCart() {
    if (addingToCart || buyingNow) {
      return;
    }

    try {
      setAddingToCart(true);

      const added = addProductToCart();

      if (added) {
        alert("Added to cart!");
      }
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleBuyNow() {
    if (addingToCart || buyingNow) {
      return;
    }

    try {
      setBuyingNow(true);

      const added = addProductToCart();

      if (added) {
        router.push("/checkout");
      }
    } finally {
      setBuyingNow(false);
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#121212] transition-all duration-500 hover:-translate-y-3 hover:border-red-600 hover:shadow-[0_20px_60px_rgba(220,38,38,0.20)]">
      {/* Product Image */}

      <div className="relative overflow-hidden">
        <Link
          href={`/shop/${product.id}`}
          className="block"
        >
          <img
            src={image}
            alt={product.name}
            className="h-[420px] w-full cursor-pointer object-cover transition duration-700 group-hover:scale-110"
          />
        </Link>

        {/* New Badge */}

        <div className="absolute left-5 top-5 rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-bold uppercase tracking-widest text-black shadow-lg">
          New
        </div>

        {/* Wishlist Button */}

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
          className={`absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border shadow-xl backdrop-blur-md transition ${
            wishlistId
              ? "border-red-500 bg-red-600 text-white"
              : "border-white/20 bg-black/70 text-white hover:border-red-500 hover:text-red-400"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {wishlistLoading ||
          wishlistUpdating ? (
            <Loader2
              size={21}
              className="animate-spin"
            />
          ) : (
            <Heart
              size={22}
              fill={
                wishlistId
                  ? "currentColor"
                  : "none"
              }
            />
          )}
        </button>

        {/* Category */}

        <div className="absolute bottom-5 right-5 rounded-full bg-black/70 px-4 py-2 text-xs font-bold uppercase text-white backdrop-blur-md">
          {product.category}
        </div>

        {outOfStock && (
          <div className="absolute bottom-5 left-5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase text-white shadow-lg">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Content */}

      <div className="space-y-5 p-6">
        <Link href={`/shop/${product.id}`}>
          <h3 className="text-2xl font-black text-white transition group-hover:text-red-500">
            {product.name}
          </h3>
        </Link>

        {/* Wishlist Message */}

        {message && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-bold text-green-300">
            {message}
          </div>
        )}

        {/* Stock */}

        {stock > 10 ? (
          <p className="text-sm font-semibold text-green-400">
            ● In Stock
          </p>
        ) : stock > 0 ? (
          <p className="text-sm font-semibold text-yellow-400">
            ● Only {stock} Left
          </p>
        ) : (
          <p className="text-sm font-semibold text-red-500">
            ● Out of Stock
          </p>
        )}

        {/* Price */}

        <div className="flex items-center justify-between gap-4">
          <p className="text-3xl font-black text-red-500">
            ₱{" "}
            {Number(
              product.price
            ).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <div className="rounded-full border border-[#D4AF37] px-3 py-1 text-xs font-bold uppercase text-[#D4AF37]">
            Premium
          </div>
        </div>
      </div>

      {/* Buttons */}

      <div className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
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
          className="flex items-center justify-center gap-2 rounded-xl border border-red-600 py-4 font-bold uppercase text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-500"
        >
          {addingToCart ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
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
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-4 font-bold uppercase text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
        >
          {buyingNow ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Loading...
            </>
          ) : (
            <>
              <Zap size={18} />
              Buy Now
            </>
          )}
        </button>
      </div>
    </article>
  );
}