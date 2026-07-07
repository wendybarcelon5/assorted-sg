"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 2000 ? 0 : 150;

  const total = subtotal + shipping;

  cart.forEach((item) => {
  console.log(item.image);
});

  return (
    <main className="min-h-screen bg-black pt-36 pb-20 text-white">

      <div className="mx-auto max-w-7xl px-6">

        <h1 className="text-5xl font-black uppercase">
          Shopping Cart
        </h1>

        <p className="mt-4 text-gray-400">
          {cart.length} Item(s) in your cart
        </p>

        {cart.length === 0 ? (
          <div className="mt-20 rounded-3xl border border-gray-800 bg-[#111] p-16 text-center">

            <h2 className="text-3xl font-bold">
              Your Cart is Empty
            </h2>

            <p className="mt-4 text-gray-400">
              Looks like you haven't added anything yet.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block rounded-xl bg-red-600 px-8 py-4 font-bold uppercase transition hover:bg-red-700"
            >
              Continue Shopping
            </Link>

          </div>
        ) : (
          <div className="mt-12 grid gap-10 lg:grid-cols-[2fr_1fr]">

            {/* Cart Items */}

            <div className="space-y-8">

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-[#111] p-6 transition hover:border-red-600"
                >
                  <div className="flex flex-col gap-6 md:flex-row">

                     <img
  src={item.image}
  alt={item.name}
  className="h-[180px] w-[180px] rounded-2xl object-cover border border-red-500"
/>

                    <div className="flex flex-1 flex-col justify-between">

                      <div>

                        <h2 className="text-2xl font-black">
                          {item.name}
                        </h2>

                        <p className="mt-3 text-xl font-bold text-red-500">
                          ₱{item.price.toLocaleString()}
                        </p>

                      </div>

                      <div className="mt-8 flex flex-wrap items-center justify-between gap-6">

                        <div className="flex items-center gap-3">

                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="h-10 w-10 rounded-full border border-gray-700 hover:border-red-600"
                          >
                            −
                          </button>

                          <span className="w-10 text-center text-lg font-bold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="h-10 w-10 rounded-full border border-gray-700 hover:border-red-600"
                          >
                            +
                          </button>

                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-xl border border-red-600 px-5 py-2 font-bold uppercase text-red-500 transition hover:bg-red-600 hover:text-white"
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  </div>
                </div>
              ))}

            </div>

            {/* Order Summary */}

            <div>

              <div className="sticky top-36 rounded-3xl border border-white/10 bg-[#111] p-8">

                <h2 className="text-3xl font-black uppercase">
                  Order Summary
                </h2>

                <div className="mt-8 space-y-5">

                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>₱{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>

                    <span>
                      {shipping === 0
                        ? "FREE"
                        : `₱${shipping}`}
                    </span>
                  </div>

                  <div className="border-t border-gray-700 pt-5">

                    <div className="flex justify-between text-2xl font-black">

                      <span>Total</span>

                      <span className="text-red-500">
                        ₱{total.toLocaleString()}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="mt-5 rounded-2xl bg-[#181818] p-5">

                  <div className="flex items-center gap-3">

                    <ShieldCheck className="text-green-500" />

                    <p className="text-sm">
                      Secure Checkout Guaranteed
                    </p>

                  </div>

                </div>

                <div className="mt-8 flex justify-center gap-4">

                  <Image src="/payments/gcash.png" alt="GCash" width={48} height={30} />
                  <Image src="/payments/maya.png" alt="Maya" width={48} height={30} />
                  <Image src="/payments/visa.png" alt="Visa" width={48} height={30} />
                  <Image src="/payments/mastercard.png" alt="Mastercard" width={48} height={30} />
                  <Image src="/payments/cod.png" alt="COD" width={48} height={30} />

                </div>

                <Link
                  href="/checkout"
                  className="mt-8 block rounded-xl bg-red-600 py-4 text-center text-lg font-bold uppercase transition hover:bg-red-700"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="mt-4 block text-center text-sm text-gray-400 hover:text-white"
                >
                  Continue Shopping
                </Link>

              </div>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}