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

  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    setImageUrl(data.image);

    setLoading(false);
  }

  async function updateProduct(e: React.FormEvent) {
    e.preventDefault();

    let finalImage = imageUrl;

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, imageFile);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      finalImage = publicUrl;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
        image: finalImage,
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
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">

      <h1 className="text-5xl font-black">
        Edit Product
      </h1>

      <p className="mt-2 text-gray-400">
        Update your product information.
      </p>

      <form
        onSubmit={updateProduct}
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

        <div>
          <p className="mb-3 font-semibold">
            Current Image
          </p>

          <img
            src={imageUrl}
            alt={name}
            className="h-56 rounded-xl border border-gray-700 object-cover"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Upload New Image (Optional)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setImageFile(e.target.files[0]);
              }
            }}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-red-600 px-8 py-4 font-bold uppercase hover:bg-red-700"
        >
          Save Changes
        </button>

      </form>

    </main>
  );
}