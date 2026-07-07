import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  HeartHandshake,
} from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="bg-black pt-32 text-white">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10 py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-black" />

          <div className="relative mx-auto max-w-6xl px-6 text-center">

            <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
              Premium Streetwear
            </p>

            <h1 className="mt-6 text-5xl font-black uppercase md:text-7xl">
              About
              <span className="block text-red-600">
                Assorted SG
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-400">
              More than clothing. Assorted SG represents confidence,
              quality, and timeless streetwear created for people who
              value comfort, style, and purpose.
            </p>

          </div>
        </section>

        {/* Story */}
        <section className="mx-auto mt-24 grid max-w-7xl gap-12 px-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-white/10 bg-[#111] p-10">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
              Our Story
            </p>

            <h2 className="mt-5 text-4xl font-black">
              Built With Purpose
            </h2>

            <p className="mt-8 leading-8 text-gray-300">
              Assorted SG was founded with one goal:
              to offer premium-quality streetwear that combines
              modern style, comfort, and affordability.
            </p>

            <p className="mt-6 leading-8 text-gray-300">
              We believe fashion should inspire confidence.
              Every jacket, shirt, pair of pants, and short
              is selected to help people express themselves
              while enjoying premium quality at a fair price.
            </p>

            <Link
              href="/shop"
              className="mt-10 inline-block rounded-xl bg-red-600 px-8 py-4 font-bold uppercase transition hover:bg-red-700"
            >
              Shop Collection
            </Link>
          </div>

          <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#111] to-[#191919] p-10">

            <h2 className="text-4xl font-black text-[#D4AF37]">
              Our Mission
            </h2>

            <p className="mt-8 leading-8 text-gray-300">
              To inspire confidence through premium clothing while
              building a trusted brand rooted in integrity,
              quality, and excellent customer service.
            </p>

            <div className="mt-10 rounded-2xl border border-white/10 bg-black/40 p-6">

              <p className="italic text-gray-300">
                "Commit to the Lord whatever you do,
                and He will establish your plans."
              </p>

              <p className="mt-4 font-bold uppercase text-red-500">
                Proverbs 16:3
              </p>

            </div>

          </div>

        </section>

        {/* Why Choose Us */}
        <section className="mx-auto mt-24 max-w-7xl px-6">

          <div className="text-center">

            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
              Why Choose Us
            </p>

            <h2 className="mt-4 text-5xl font-black uppercase">
              Shopping Made Better
            </h2>

          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition duration-300 hover:-translate-y-2 hover:border-red-600">
              <ShieldCheck className="mx-auto text-red-600" size={46} />
              <h3 className="mt-6 text-2xl font-bold">
                Premium Quality
              </h3>
              <p className="mt-4 text-gray-400">
                Carefully selected clothing made for everyday wear.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition duration-300 hover:-translate-y-2 hover:border-red-600">
              <Truck className="mx-auto text-red-600" size={46} />
              <h3 className="mt-6 text-2xl font-bold">
                Fast Shipping
              </h3>
              <p className="mt-4 text-gray-400">
                Nationwide delivery across the Philippines.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition duration-300 hover:-translate-y-2 hover:border-red-600">
              <CreditCard className="mx-auto text-red-600" size={46} />
              <h3 className="mt-6 text-2xl font-bold">
                Secure Payments
              </h3>
              <p className="mt-4 text-gray-400">
                GCash, Maya, Visa, Mastercard and COD.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition duration-300 hover:-translate-y-2 hover:border-red-600">
              <HeartHandshake className="mx-auto text-red-600" size={46} />
              <h3 className="mt-6 text-2xl font-bold">
                Customer First
              </h3>
              <p className="mt-4 text-gray-400">
                Every customer is important to us.
              </p>
            </div>

          </div>

        </section>

        {/* Stats */}
        <section className="mx-auto mt-24 mb-24 max-w-7xl px-6">

          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#111] to-[#1b1b1b] p-12">

            <div className="grid gap-10 text-center md:grid-cols-4">

              <div>
                <h3 className="text-5xl font-black text-red-600">
                  100+
                </h3>

                <p className="mt-3 uppercase tracking-widest text-gray-400">
                  Happy Customers
                </p>
              </div>

              <div>
                <h3 className="text-5xl font-black text-red-600">
                  200+
                </h3>

                <p className="mt-3 uppercase tracking-widest text-gray-400">
                  Products Sold
                </p>
              </div>

              <div>
                <h3 className="text-5xl font-black text-red-600">
                  99%
                </h3>

                <p className="mt-3 uppercase tracking-widest text-gray-400">
                  Satisfaction
                </p>
              </div>

              <div>
                <h3 className="text-5xl font-black text-red-600">
                  PH
                </h3>

                <p className="mt-3 uppercase tracking-widest text-gray-400">
                  Nationwide Shipping
                </p>
              </div>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}