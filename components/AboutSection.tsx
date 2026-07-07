"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  Star,
  HeartHandshake,
} from "lucide-react";

export default function AboutSection() {
  return (
    <section className="bg-[#080808] py-32">
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            About Assorted SG
          </p>

          <h2 className="mt-5 text-5xl font-black uppercase text-white">
            More Than
            <span className="block text-red-600">
              Just Clothing
            </span>
          </h2>

          <p className="mt-8 text-lg leading-8 text-gray-400">
            Assorted SG was created for people who appreciate premium quality,
            timeless streetwear, and everyday confidence. Every collection is
            carefully selected to deliver style, comfort, and value.
          </p>
        </div>

        {/* Story & Mission */}
        <div className="mt-20 grid gap-10 lg:grid-cols-2">

          <div className="rounded-3xl border border-white/10 bg-[#111] p-10 transition hover:border-[#D4AF37]/50">
            <h3 className="text-3xl font-black text-red-600">
              Our Story
            </h3>

            <p className="mt-6 leading-8 text-gray-300">
              Assorted SG started with a simple vision—to provide stylish,
              affordable, and premium-quality streetwear that people can wear
              with confidence every day.
            </p>

            <p className="mt-6 leading-8 text-gray-300">
              We believe fashion should be more than following trends. It
              should express confidence, individuality, and purpose while
              remaining comfortable enough for everyday life.
            </p>

            <Link
              href="/shop"
              className="mt-10 inline-block rounded-xl bg-red-600 px-8 py-4 font-bold uppercase transition hover:bg-red-700"
            >
              Shop Collection
            </Link>
          </div>

          <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#111] to-[#191919] p-10">
            <h3 className="text-3xl font-black text-[#D4AF37]">
              Our Mission
            </h3>

            <p className="mt-6 leading-8 text-gray-300">
              Our mission is to inspire confidence through premium clothing
              while building a brand rooted in quality, integrity, and
              excellent customer service.
            </p>

            <div className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-6">
              <p className="italic text-gray-300">
                "Commit to the Lord whatever you do,
                and He will establish your plans."
              </p>

              <p className="mt-4 font-bold uppercase text-red-500">
                Proverbs 16:3
              </p>
            </div>
          </div>

        </div>

        {/* Why Choose Us */}
        <div className="mt-24">

          <h3 className="text-center text-4xl font-black uppercase">
            Why Choose Us
          </h3>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition duration-300 hover:-translate-y-2 hover:border-red-600">
              <ShieldCheck className="mx-auto text-red-600" size={42} />

              <h4 className="mt-6 text-xl font-bold">
                Premium Quality
              </h4>

              <p className="mt-3 text-gray-400">
                Carefully selected materials for lasting comfort.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition duration-300 hover:-translate-y-2 hover:border-red-600">
              <Truck className="mx-auto text-red-600" size={42} />

              <h4 className="mt-6 text-xl font-bold">
                Fast Shipping
              </h4>

              <p className="mt-3 text-gray-400">
                Nationwide delivery across the Philippines.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition duration-300 hover:-translate-y-2 hover:border-red-600">
              <Star className="mx-auto text-red-600" size={42} />

              <h4 className="mt-6 text-xl font-bold">
                Trusted Brand
              </h4>

              <p className="mt-3 text-gray-400">
                Built on quality, honesty, and customer satisfaction.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition duration-300 hover:-translate-y-2 hover:border-red-600">
              <HeartHandshake className="mx-auto text-red-600" size={42} />

              <h4 className="mt-6 text-xl font-bold">
                Customer First
              </h4>

              <p className="mt-3 text-gray-400">
                Every order is handled with care and attention.
              </p>
            </div>

          </div>

        </div>

        {/* Statistics */}
        <div className="mt-24 rounded-3xl border border-white/10 bg-gradient-to-r from-[#111] to-[#191919] p-12">

          <div className="grid gap-10 text-center md:grid-cols-4">

            <div>
              <h4 className="text-5xl font-black text-red-600">
                100+
              </h4>

              <p className="mt-3 uppercase tracking-wider text-gray-400">
                Happy Customers
              </p>
            </div>

            <div>
              <h4 className="text-5xl font-black text-red-600">
                200+
              </h4>

              <p className="mt-3 uppercase tracking-wider text-gray-400">
                Products Sold
              </p>
            </div>

            <div>
              <h4 className="text-5xl font-black text-red-600">
                99%
              </h4>

              <p className="mt-3 uppercase tracking-wider text-gray-400">
                Satisfaction
              </p>
            </div>

            <div>
              <h4 className="text-5xl font-black text-red-600">
                PH
              </h4>

              <p className="mt-3 uppercase tracking-wider text-gray-400">
                Nationwide Shipping
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}