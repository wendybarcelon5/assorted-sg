"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-black px-8 py-32 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-black">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="mt-10">
            <p className="text-gray-400">
              Your cart is empty.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-bold hover:bg-red-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 space-y-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#111] p-6"
                >
                  <div className="flex items-center gap-5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />

                    <div>
                      <h2 className="text-xl font-bold">
                        {item.name}
                      </h2>

                      <p className="text-red-500">
                        ₱{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="rounded bg-gray-700 px-3 py-2"
                    >
                      -
                    </button>

                    <span className="w-8 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="rounded bg-gray-700 px-3 py-2"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="rounded bg-red-600 px-4 py-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-between border-t border-gray-700 pt-8">
              <h2 className="text-3xl font-black">
                Total:
              </h2>

              <h2 className="text-3xl font-black text-red-500">
                ₱{total.toLocaleString()}
              </h2>
            </div>

           <Link
  href="/checkout"
  className="mt-8 block w-full rounded-xl bg-red-600 py-4 text-center text-xl font-bold hover:bg-red-700"
>
  Proceed to Checkout
</Link>
          </>
        )}
      </div>
    </main>
  );
}