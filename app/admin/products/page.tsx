"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  PackageX,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  category: string | null;
  price: number | string;
  stock: number | string;
  image: string | null;
  created_at: string;
};

type CategoryFilter = "All" | string;

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function getStockBadge(stockValue: number | string) {
  const stock = Number(stockValue ?? 0);

  if (stock === 0) {
    return {
      label: "Out of Stock",
      className:
        "border-red-500/30 bg-red-500/10 text-red-400",
    };
  }

  if (stock <= 5) {
    return {
      label: `${stock} left`,
      className:
        "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    };
  }

  return {
    label: `${stock} in stock`,
    className:
      "border-green-500/30 bg-green-500/10 text-green-400",
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("All");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setErrorMessage("");

      const { data, error } = await supabase
        .from("products")
        .select(
          `
            id,
            name,
            category,
            price,
            stock,
            image,
            created_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setProducts((data ?? []) as Product[]);
    } catch (error) {
      console.error("Unable to load products:", error);

      setErrorMessage("Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  async function deleteProduct(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error("Unable to delete product:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete product.";

      window.alert(message);
    } finally {
      setDeletingId(null);
    }
  }

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products
        .map((product) => product.category?.trim())
        .filter(
          (category): category is string =>
            Boolean(category)
        )
    );

    return ["All", ...Array.from(uniqueCategories).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        (product.category ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const statistics = useMemo(() => {
    const totalProducts = products.length;

    const inStock = products.filter(
      (product) => Number(product.stock) > 5
    ).length;

    const lowStock = products.filter((product) => {
      const stock = Number(product.stock);

      return stock > 0 && stock <= 5;
    }).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock) === 0
    ).length;

    return {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const statisticCards = [
    {
      title: "Total Products",
      value: statistics.totalProducts,
      subtitle: "All store products",
      icon: Boxes,
      iconClassName: "bg-blue-600",
    },
    {
      title: "In Stock",
      value: statistics.inStock,
      subtitle: "More than 5 remaining",
      icon: CheckCircle2,
      iconClassName: "bg-green-600",
    },
    {
      title: "Low Stock",
      value: statistics.lowStock,
      subtitle: "1 to 5 remaining",
      icon: AlertTriangle,
      iconClassName: "bg-yellow-600",
    },
    {
      title: "Out of Stock",
      value: statistics.outOfStock,
      subtitle: "Needs restocking",
      icon: PackageX,
      iconClassName: "bg-red-600",
    },
  ];

  return (
    <main className="admin-page space-y-8 text-white">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-black text-white md:text-5xl">
            Products
          </h1>

          <p className="mt-2 text-gray-300">
            Manage all products in your store.
          </p>

          {!loading && (
            <p className="mt-1 text-sm text-gray-500">
              {products.length}{" "}
              {products.length === 1
                ? "product"
                : "products"}{" "}
              available
            </p>
          )}
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
        >
          + Add Product
        </Link>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statisticCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-3xl border border-white/10 bg-[#1E293B] p-6 shadow-lg"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    {card.title}
                  </p>

                  {loading ? (
                    <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-white/10" />
                  ) : (
                    <h2 className="mt-3 text-3xl font-black text-white">
                      {card.value.toLocaleString()}
                    </h2>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    {card.subtitle}
                  </p>
                </div>

                <div
                  className={`${card.iconClassName} rounded-2xl p-4`}
                >
                  <Icon
                    className="text-white"
                    size={26}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#1E293B] p-5 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={20}
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search products or categories..."
              className="w-full rounded-xl border border-white/10 bg-[#111827] py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-gray-500 focus:border-red-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value)
            }
            className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition focus:border-red-500 lg:min-w-52"
          >
            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category === "All"
                  ? "All Categories"
                  : category}
              </option>
            ))}
          </select>
        </div>

        {!loading && (
          <p className="mt-4 text-sm text-gray-500">
            Showing {filteredProducts.length} of{" "}
            {products.length} products
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#1E293B] shadow-xl">
        {errorMessage ? (
          <div className="p-6">
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
              <p className="font-semibold text-red-400">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  void fetchProducts();
                }}
                className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl bg-white/5"
                />
              )
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-white">
              <thead className="bg-[#111827]">
                <tr>
                  <th className="p-5 text-left font-bold text-gray-200">
                    Image
                  </th>

                  <th className="p-5 text-left font-bold text-gray-200">
                    Product
                  </th>

                  <th className="p-5 text-left font-bold text-gray-200">
                    Category
                  </th>

                  <th className="p-5 text-left font-bold text-gray-200">
                    Price
                  </th>

                  <th className="p-5 text-left font-bold text-gray-200">
                    Stock
                  </th>

                  <th className="p-5 text-center font-bold text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stockBadge = getStockBadge(
                    product.stock
                  );

                  return (
                    <tr
                      key={product.id}
                      className="border-t border-white/10 transition hover:bg-[#263247]"
                    >
                      <td className="p-5">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-20 w-20 rounded-xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#111827] text-sm text-gray-400">
                            No Image
                          </div>
                        )}
                      </td>

                      <td className="p-5">
                        <p className="font-bold text-white">
                          {product.name}
                        </p>
                      </td>

                      <td className="p-5 text-gray-200">
                        {product.category ||
                          "Uncategorized"}
                      </td>

                      <td className="p-5 font-bold text-[#D4AF37]">
                        {formatCurrency(product.price)}
                      </td>

                      <td className="p-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-sm font-bold ${stockBadge.className}`}
                        >
                          {stockBadge.label}
                        </span>
                      </td>

                      <td className="p-5 text-center">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            disabled={
                              deletingId === product.id
                            }
                            onClick={() =>
                              void deleteProduct(
                                product.id
                              )
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === product.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >
                      <p className="font-semibold text-white">
                        No products found
                      </p>

                      <p className="mt-2 text-sm text-gray-400">
                        Try changing your search or
                        category filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}