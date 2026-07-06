"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  }

  async function deleteProduct(id: number) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadProducts();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-5xl font-black">
            Products
          </h1>

          <p className="mt-2 text-gray-400">
            Manage your store products
          </p>
        </div>

        <Link
          href="/admin/new"
          className="rounded-lg bg-red-600 px-6 py-3 font-bold hover:bg-red-700"
        >
          + Add Product
        </Link>

      </div>

      <div className="mt-10 overflow-x-auto rounded-xl border border-gray-800">

        <table className="w-full">

          <thead className="bg-[#111]">

            <tr className="text-left">

              <th className="p-4">Image</th>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>

            </tr>

          </thead>

          <tbody>

            {products.map((product) => (

              <tr
                key={product.id}
                className="border-t border-gray-800"
              >

                <td className="p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                </td>

                <td className="p-4 font-semibold">
                  {product.name}
                </td>

                <td className="p-4">
                  {product.category}
                </td>

                <td className="p-4">
                  ₱{Number(product.price).toLocaleString()}
                </td>

                <td className="p-4">
                  {product.stock}
                </td>

                <td className="p-4">

                  <div className="flex gap-3">

                    <Link
                      href={`/admin/edit/${product.id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-700"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-700"
                    >
                      Delete
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </main>
  );
}