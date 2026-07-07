"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/hero/hero.jpg')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-8 text-center">

        <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-[#D4AF37]">
          New Collection 2026
        </p>

        <h1 className="text-5xl font-black uppercase leading-tight text-white md:text-7xl">
          Premium
          <span className="block text-red-600">
            Streetwear
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-300">
          Discover premium jackets, shirts, pants, and shorts designed for
          everyday confidence and modern style.
        </p>

        <div className="mt-12 flex flex-col justify-center gap-6 sm:flex-row">

          <Link
            href="/shop"
            className="rounded-xl bg-red-600 px-10 py-5 font-bold uppercase transition hover:bg-red-700"
          >
            Shop Now
          </Link>

          <Link
            href="/shop?category=Jackets"
            className="rounded-xl border border-[#D4AF37] px-10 py-5 font-bold uppercase text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
          >
            View Jackets
          </Link>

        </div>

      </div>

    </section>
  );
}