"use client";

import Link from "next/link";
import { CheckCircle2, ShoppingBag, PackageSearch } from "lucide-react";

export default function SuccessPage() {
  // Temporary order number
  // Later we'll replace this with the actual order number from Supabase
  const orderNumber = `ASG-${Date.now().toString().slice(-8)}`;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-24">

      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#111] p-10 text-center">

        <CheckCircle2
          size={110}
          className="mx-auto text-green-500"
        />

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
          Order Confirmed
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase">
          Thank You!
        </h1>

        <p className="mt-6 text-lg text-gray-400">
          Your order has been received successfully.
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-black p-8">

          <p className="text-gray-400">
            Order Number
          </p>

          <h2 className="mt-2 text-3xl font-black text-red-500">
            {orderNumber}
          </h2>

          <div className="mt-8 rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-5">

            <p className="font-bold text-yellow-400">
              Awaiting Payment Verification
            </p>

            <p className="mt-2 text-gray-300">
              If you paid using GCash, Maya, or Bank Transfer,
              our team will verify your payment shortly.
            </p>

            <p className="mt-2 text-gray-300">
              If you selected Cash on Delivery,
              your order is now being processed.
            </p>

          </div>

        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">

          <Link
            href="/shop"
            className="flex items-center justify-center gap-3 rounded-2xl bg-red-600 py-4 font-bold uppercase transition hover:bg-red-700"
          >
            <ShoppingBag size={22} />
            Continue Shopping
          </Link>

          <Link
            href="/track-order"
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 py-4 font-bold uppercase transition hover:border-red-600"
          >
            <PackageSearch size={22} />
            Track Order
          </Link>

        </div>

        <p className="mt-10 text-sm text-gray-500">
          Thank you for shopping with <span className="font-bold text-white">Assorted SG</span>.
        </p>

      </div>

    </main>
  );
}