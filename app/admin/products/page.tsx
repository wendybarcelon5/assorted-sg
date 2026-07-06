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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (!error) {
      setProducts(data || []);
    }
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

    fetchProducts();
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-black">
          Products
        </h1>

        <Link
          href="/admin/products/new"
          className="rounded-lg bg-red-600 px-6 py-3 font-bold hover:bg-red-700"
        >
          + Add Product
        </Link>
      </div>

      <div className="mt-10 overflow-hidden rounded-xl border border-gray-800 bg-[#111]">
        <table className="w-full">
          <thead className="bg-black">
            <tr>
              <th className="p-4 text-left">Image</th>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-t border-gray-800"
              >
                <td className="p-4">
  {product.image ? (
    <img
      src={product.image}
      alt={product.name}
      className="h-20 w-20 rounded-lg object-cover"
    />
  ) : (
    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-800 text-xs">
      No Image
    </div>
  )}
</td>

                <td className="p-4 font-semibold">
                  {product.name}
                </td>

                <td className="p-4">
                  {product.category}
                </td>

                <td className="p-4">
                  ₱{product.price}
                </td>

                <td className="p-4">
                  {product.stock}
                </td>

                <td className="space-x-2 p-4 text-center">
                  <Link
  href={`/admin/products/edit/${product.id}`}
  className="rounded bg-blue-600 px-4 py-2 inline-block"
>
  Edit
</Link>

                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="rounded bg-red-600 px-4 py-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-400"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}