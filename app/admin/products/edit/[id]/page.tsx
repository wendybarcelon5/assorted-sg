"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Jackets");
  const [stock, setStock] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setName(data.name);
      setDescription(data.description);
      setPrice(String(data.price));
      setCategory(data.category);
      setStock(String(data.stock));

      setLoading(false);
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Product updated successfully!");

    router.push("/admin/products");
  }

  if (loading) {
    return (
      <div className="p-10 text-white">
        Loading product...
      </div>
    );
  }

  return (
    <>
      <h1 className="text-5xl font-black">
        Edit Product
      </h1>

      <p className="mt-4 text-gray-400">
        Update your product information.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-10 max-w-3xl space-y-6"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
        />

        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
        />

        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
        >
          <option>Jackets</option>
          <option>Shirts</option>
          <option>Pants</option>
          <option>Shorts</option>
        </select>

        <div className="flex gap-4">
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-8 py-4 font-bold uppercase hover:bg-red-700"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-lg border border-gray-600 px-8 py-4 font-bold uppercase hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}