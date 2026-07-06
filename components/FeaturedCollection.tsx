import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "./ProductCard";

export default function FeaturedCollection() {
  return (
    <section className="bg-[#080808] py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Heading */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Featured
            </p>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              Featured Collection
            </h2>

            <p className="mt-4 max-w-xl text-gray-400">
              Discover some of our latest premium streetwear pieces,
              carefully selected for everyday confidence.
            </p>
          </div>

          <Link
            href="/shop"
            className="rounded-xl border border-red-600 px-8 py-4 font-bold uppercase transition hover:bg-red-600"
          >
            View All Products
          </Link>

        </div>

        {/* Products */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

      </div>
    </section>
  );
}