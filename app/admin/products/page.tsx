"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  PackageX,
  Search,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

type SortOption =
  | "newest"
  | "oldest"
  | "priceLow"
  | "priceHigh"
  | "stock";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStockBadge(stockValue: number | string) {
  const stock = Number(stockValue || 0);

  if (stock <= 0) {
    return {
      label: "Out of Stock",
      className:
        "border-red-500/30 bg-red-500/10 text-red-400",
    };
  }

  if (stock <= 5) {
    return {
      label: `Low Stock: ${stock}`,
      className:
        "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    };
  }

  return {
    label: `In Stock: ${stock}`,
    className:
      "border-green-500/30 bg-green-500/10 text-green-400",
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [sortBy, setSortBy] =
    useState<SortOption>("newest");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, category, price, stock, image, created_at"
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Unable to load products:", error);
      setErrorMessage(
        `Unable to load products: ${error.message}`
      );
      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts((data || []) as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error("Unable to delete product:", error);
      window.alert(
        `Unable to delete product: ${error.message}`
      );
      setDeletingId(null);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (currentProduct) =>
          currentProduct.id !== product.id
      )
    );

    setDeletingId(null);
  }

  const categories = useMemo(() => {
    const categorySet = new Set<string>();

    products.forEach((product) => {
      const category = product.category?.trim();

      if (category) {
        categorySet.add(category);
      }
    });

    return ["All", ...Array.from(categorySet).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    const filtered = products.filter((product) => {
      const productName = product.name.toLowerCase();
      const productCategory = (
        product.category || ""
      ).toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        productName.includes(normalizedSearch) ||
        productCategory.includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((first, second) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(first.created_at).getTime() -
            new Date(second.created_at).getTime()
          );

        case "priceLow":
          return (
            Number(first.price) - Number(second.price)
          );

        case "priceHigh":
          return (
            Number(second.price) - Number(first.price)
          );

        case "stock":
          return (
            Number(second.stock) - Number(first.stock)
          );

        case "newest":
        default:
          return (
            new Date(second.created_at).getTime() -
            new Date(first.created_at).getTime()
          );
      }
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    sortBy,
  ]);

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
      (product) => Number(product.stock) <= 0
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
      description: "All store products",
      icon: Boxes,
      iconClassName: "bg-blue-600",
    },
    {
      title: "In Stock",
      value: statistics.inStock,
      description: "More than 5 remaining",
      icon: CheckCircle2,
      iconClassName: "bg-green-600",
    },
    {
      title: "Low Stock",
      value: statistics.lowStock,
      description: "1 to 5 remaining",
      icon: AlertTriangle,
      iconClassName: "bg-yellow-600",
    },
    {
      title: "Out of Stock",
      value: statistics.outOfStock,
      description: "Needs restocking",
      icon: PackageX,
      iconClassName: "bg-red-600",
    },
  ];

  return (
    <main className="admin-page space-y-8 text-white">
      <header className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
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
      </header>

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
                    {card.description}
                  </p>
                </div>

                <div
                  className={`${card.iconClassName} rounded-2xl p-4`}
                >
                  <Icon
                    size={26}
                    className="text-white"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#1E293B] p-5 shadow-xl">
        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
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
            className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition focus:border-red-500 xl:min-w-52"
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

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value as SortOption
              )
            }
            className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition focus:border-red-500 xl:min-w-52"
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="priceLow">
              Price: Low to High
            </option>

            <option value="priceHigh">
              Price: High to Low
            </option>

            <option value="stock">
              Highest Stock
            </option>
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
                onClick={() => void fetchProducts()}
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
            <table className="w-full min-w-[1050px] text-white">
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

                  <th className="p-5 text-left font-bold text-gray-200">
                    Created
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
                          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#111827] text-center text-xs text-gray-400">
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

                      <td className="p-5 text-gray-300">
                        {formatDate(product.created_at)}
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
                              void deleteProduct(product)
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
                      colSpan={7}
                      className="px-6 py-16 text-center"
                    >
                      <p className="font-semibold text-white">
                        No products found
                      </p>

                      <p className="mt-2 text-sm text-gray-400">
                        Try changing the search,
                        category, or sorting option.
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