"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Jackets");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!image) {
      alert("Please select an image.");
      return;
    }

    const fileName = `${Date.now()}-${image.name}`;

    // Upload image
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, image);

    if (uploadError) {
      console.log(uploadError);
      alert(JSON.stringify(uploadError, null, 2));
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    // Save product
    const { error: insertError } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          price: Number(price),
          category,
          stock: Number(stock),
          image: publicUrl,
        },
      ]);

    if (insertError) {
      console.log(insertError);
      alert(JSON.stringify(insertError, null, 2));
      return;
    }

    alert("Product added successfully!");

    // Clear form
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Jackets");
    setStock("");
    setImage(null);
  }

  return (
    <>
      <h1 className="text-5xl font-black">
        Add Product
      </h1>

      <p className="mt-4 text-gray-400">
        Create a new product for your store.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-10 max-w-3xl space-y-6"
      >
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
        />

        <textarea
          rows={5}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
        />

        <input
          type="number"
          placeholder="Stock"
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
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setImage(e.target.files[0]);
            }
          }}
          className="w-full"
        />

        <button
          type="submit"
          className="rounded-lg bg-red-600 px-8 py-4 font-bold uppercase hover:bg-red-700"
        >
          Save Product
        </button>
      </form>
    </>
  );
}