"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { ShoppingCart, Eye } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  stock?: number;
};

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();
  const router = useRouter();

  console.log(product.image);
  const image = product.image || "/placeholder.jpg";

  function addProductToCart() {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image,
    });
  }

  const stock = product.stock ?? 999;

  return (
    <div className="group overflow-hidden rounded-3xl border border-neutral-800 bg-[#121212] transition-all duration-500 hover:-translate-y-3 hover:border-red-600 hover:shadow-[0_20px_60px_rgba(220,38,38,0.20)]">

      {/* Image */}

      <div className="relative overflow-hidden">

        <Link href={`/shop/${product.id}`}>

          <Link href={`/shop/${product.id}`}>

  <img
    src={image}
    alt={product.name}
    className="h-[420px] w-full cursor-pointer object-cover transition duration-700 group-hover:scale-110"
  />

</Link>

        </Link>

        {/* NEW Badge */}

        <div className="absolute left-5 top-5 rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-bold uppercase tracking-widest text-black shadow-lg">
          NEW
        </div>

        {/* Category */}

        <div className="absolute right-5 top-5 rounded-full bg-black/70 px-4 py-2 text-xs font-bold uppercase backdrop-blur-md">
          {product.category}
        </div>

      </div>

      {/* Content */}

      <div className="space-y-5 p-6">

        <Link href={`/shop/${product.id}`}>

          <h3 className="text-2xl font-black transition group-hover:text-red-500">
            {product.name}
          </h3>

        </Link>

        {/* Stock */}

        {stock > 10 ? (
          <p className="text-sm font-semibold text-green-400">
            ● In Stock
          </p>
        ) : stock > 0 ? (
          <p className="text-sm font-semibold text-yellow-400">
            ● Only {stock} Left
          </p>
        ) : (
          <p className="text-sm font-semibold text-red-500">
            ● Out of Stock
          </p>
        )}

        {/* Price */}

        <div className="flex items-center justify-between">

          <p className="text-3xl font-black text-red-500">
            ₱ {Number(product.price).toLocaleString()}
          </p>

          <div className="rounded-full border border-[#D4AF37] px-3 py-1 text-xs font-bold uppercase text-[#D4AF37]">
            Premium
          </div>

        </div>

      </div>

      {/* Buttons */}

      <div className="grid grid-cols-2 gap-3 px-6 pb-6">

  <button
    onClick={addProductToCart}
    className="flex items-center justify-center gap-2 rounded-xl border border-red-600 py-4 font-bold uppercase transition hover:bg-red-600"
  >
    <ShoppingCart size={18} />
    Add to Cart
  </button>

  <button
    onClick={() => {
      addProductToCart();
      router.push("/checkout");
    }}
    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-4 font-bold uppercase transition hover:bg-red-700"
  >
    Buy Now
  </button>

</div>

    </div>
  );
}