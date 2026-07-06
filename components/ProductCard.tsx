"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  images: (string | undefined)[];
};

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();

  const image = product.images?.[0] || "/placeholder.jpg";

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-800 bg-[#111] transition-all duration-300 hover:-translate-y-2 hover:border-red-600 hover:shadow-2xl hover:shadow-red-600/10">

      <Link href={`/shop/${product.id}`}>
        <div className="overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div className="p-6">
          <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            {product.category}
          </span>

          <h3 className="mt-5 text-2xl font-bold">
            {product.name}
          </h3>

          <p className="mt-3 text-3xl font-black text-red-500">
            ₱{product.price.toLocaleString()}
          </p>
        </div>
      </Link>

      <div className="px-6 pb-6">
        <button
          onClick={() => {
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image,
            });

            alert(`${product.name} added to cart!`);
          }}
          className="w-full rounded-xl border border-red-600 py-3 font-bold uppercase transition hover:bg-red-600"
        >
          Add to Cart
        </button>
      </div>

    </div>
  );
}