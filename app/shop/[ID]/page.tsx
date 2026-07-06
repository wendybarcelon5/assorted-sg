import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black pt-32 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-8 md:grid-cols-2">

          {/* Product Image */}
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-2xl"
            />
          </div>

          {/* Product Details */}
          <div>

            <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold uppercase">
              {product.category}
            </span>

            <h1 className="mt-6 text-5xl font-black">
              {product.name}
            </h1>

            <p className="mt-6 text-4xl font-black text-red-500">
              ₱{product.price.toLocaleString()}
            </p>

            <p className="mt-8 text-lg leading-8 text-gray-300">
              {product.description}
            </p>

            <h3 className="mt-10 text-xl font-bold uppercase">
              Sizes
            </h3>

            <div className="mt-4 flex gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className="rounded-lg border border-gray-700 px-6 py-3 hover:border-red-600"
                >
                  {size}
                </button>
              ))}
            </div>

            <button className="mt-10 w-full rounded-xl bg-red-600 py-4 text-lg font-bold uppercase transition hover:bg-red-700">
              Add to Cart
            </button>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}