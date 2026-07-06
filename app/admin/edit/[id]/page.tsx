"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Jackets");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", Number(id))
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
    setImage(data.image);

    setLoading(false);
  }

  async function updateProduct(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
        image,
      })
      .eq("id", Number(id));

    if (error) {
      alert(error.message);
      return;
    }

    alert("Product updated successfully!");

    router.push("/admin/products");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">

      <h1 className="text-5xl font-black">
        Edit Product
      </h1>

      <form
        onSubmit={updateProduct}
        className="mt-10 max-w-3xl space-y-6"
      >

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
          placeholder="Product Name"
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

        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL"
          className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
        />

        {image && (
          <img
            src={image}
            alt={name}
            className="h-52 rounded-lg"
          />
        )}

        <button
          type="submit"
          className="rounded-lg bg-red-600 px-8 py-4 font-bold hover:bg-red-700"
        >
          Save Changes
        </button>

      </form>

    </main>
  );
}