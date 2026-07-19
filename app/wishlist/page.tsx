"use client";

import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  Heart,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  price: number | string;
  image: string | null;
  stock: number | null;
};

type WishlistRow = {
  id: string;
  product_id: number;
  created_at: string;
  products: Product | Product[] | null;
};

type WishlistItem = {
  wishlistId: string;
  createdAt: string;
  product: Product;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function WishlistPage() {
  const router = useRouter();
  const { addToCart } = useCart();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("wishlist")
        .select(
          `
            id,
            product_id,
            created_at,
            products (
              id,
              name,
              category,
              description,
              price,
              image,
              stock
            )
          `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const normalizedItems = ((data ?? []) as WishlistRow[])
        .map((row) => {
          const product = Array.isArray(row.products)
            ? row.products[0]
            : row.products;

          if (!product) {
            return null;
          }

          return {
            wishlistId: row.id,
            createdAt: row.created_at,
            product,
          };
        })
        .filter((item): item is WishlistItem => item !== null);

      setItems(normalizedItems);
    } catch (error) {
      console.error("Wishlist load error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(wishlistId: string) {
    try {
      setRemovingId(wishlistId);
      setErrorMessage("");

      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", wishlistId);

      if (error) {
        throw error;
      }

      setItems((currentItems) =>
        currentItems.filter(
          (item) => item.wishlistId !== wishlistId
        )
      );
    } catch (error) {
      console.error("Wishlist remove error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to remove this product."
      );
    } finally {
      setRemovingId(null);
    }
  }

  async function moveToCart(item: WishlistItem) {
    const product = item.product;

    if ((product.stock ?? 0) <= 0) {
      alert("This product is currently out of stock.");
      return;
    }

    try {
      setMovingId(item.wishlistId);

      addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image ?? "",
        quantity: 1,
      });

      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", item.wishlistId);

      if (error) {
        throw error;
      }

      setItems((currentItems) =>
        currentItems.filter(
          (currentItem) =>
            currentItem.wishlistId !== item.wishlistId
        )
      );

      router.push("/cart");
      router.refresh();
    } catch (error) {
      console.error("Move to cart error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to move this product to your cart."
      );
    } finally {
      setMovingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-red-500" />

          <p className="mt-4 font-bold text-gray-300">
            Loading your wishlist...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] via-[#111827] to-black p-6 shadow-2xl md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-red-500">
                Saved Products
              </p>

              <h1 className="mt-3 text-4xl font-black md:text-5xl">
                My Wishlist
              </h1>

              <p className="mt-3 max-w-2xl text-gray-400">
                Save products you love and move them to your cart whenever
                you&apos;re ready.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Saved Items
              </p>

              <p className="mt-1 text-3xl font-black text-[#D4AF37]">
                {items.length}
              </p>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {errorMessage}
          </div>
        )}

        {items.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-white/10 bg-[#111827] p-10 text-center shadow-xl md:p-16">
            <Heart
              size={58}
              className="mx-auto text-gray-600"
            />

            <h2 className="mt-5 text-2xl font-black">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-400">
              Browse the shop and tap the heart icon to save products here.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black transition hover:bg-red-500"
            >
              Browse Products
              <ArrowRight size={18} />
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const product = item.product;
              const outOfStock = (product.stock ?? 0) <= 0;
              const removing = removingId === item.wishlistId;
              const moving = movingId === item.wishlistId;

              return (
                <article
                  key={item.wishlistId}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-xl transition hover:-translate-y-1 hover:border-red-500/40"
                >
                  <Link
                    href={`/shop/${product.id}`}
                    className="relative block aspect-square overflow-hidden bg-black/30"
                  >
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag
                          size={58}
                          className="text-gray-700"
                        />
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full bg-black/75 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
                      {product.category || "Product"}
                    </span>

                    {outOfStock && (
                      <span className="absolute bottom-4 left-4 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white">
                        Out of Stock
                      </span>
                    )}
                  </Link>

                  <div className="p-5">
                    <Link href={`/shop/${product.id}`}>
                      <h2 className="line-clamp-2 text-lg font-black transition hover:text-red-400">
                        {product.name}
                      </h2>
                    </Link>

                    {product.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-400">
                        {product.description}
                      </p>
                    )}

                    <p className="mt-4 text-2xl font-black text-[#D4AF37]">
                      {formatCurrency(Number(product.price))}
                    </p>

                    <div className="mt-5 grid gap-3">
                      <button
                        type="button"
                        onClick={() => void moveToCart(item)}
                        disabled={outOfStock || moving || removing}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-black transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                      >
                        {moving ? (
                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Moving...
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={18} />
                            {outOfStock
                              ? "Out of Stock"
                              : "Move to Cart"}
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void removeFromWishlist(item.wishlistId)
                        }
                        disabled={removing || moving}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-gray-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {removing ? (
                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 size={18} />
                            Remove
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}