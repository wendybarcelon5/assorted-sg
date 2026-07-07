"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";
import {
  Check,
  CreditCard,
  Truck,
  ShieldCheck,
  ChevronRight,
  QrCode,
  Wallet,
  Landmark,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();

  const { cart, clearCart } = useCart();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("Cash on Delivery");

  const [paymentReference, setPaymentReference] =
    useState("");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 2000 ? 0 : 150;

  const total = subtotal + shipping;

  async function handleCheckout(e: React.FormEvent) {
  e.preventDefault();

  try {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    console.log("1. Creating order...");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: name,
          email,
          phone,
          address,
          payment_method: paymentMethod,
          payment_reference: paymentReference || null,
          receipt_url: "",
          total,
          status:
            paymentMethod === "Cash on Delivery"
              ? "Pending"
              : "Awaiting Payment Verification",
        },
      ])
      .select()
      .single();

    console.log("Order:", order);
    console.log("Order Error:", orderError);

    if (orderError) {
      throw orderError;
    }

    console.log("2. Saving order items...");

    const items = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items);

    console.log("Items Error:", itemsError);

    if (itemsError) {
      throw itemsError;
    }

    console.log("3. Clearing cart...");

    clearCart();

    console.log("4. Redirecting...");

    router.push("/success");
  } catch (err) {
    console.error(err);
    alert("Something went wrong while placing your order.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-black pb-20 pt-36 text-white">

      <div className="mx-auto max-w-7xl px-6">

        <div className="flex justify-center">

          <Image
            src="/logo.png"
            alt="Assorted SG"
            width={90}
            height={90}
            className="rounded-full border border-red-600"
          />

        </div>

        <h1 className="mt-6 text-center text-5xl font-black uppercase">
          Secure Checkout
        </h1>

        <p className="mt-3 text-center text-gray-400">
          Complete your order securely.
        </p>

        {/* Progress */}

        <div className="mt-14 flex justify-center">

          <div className="flex items-center gap-5">

            <div className="flex flex-col items-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                <Check />
              </div>

              <p className="mt-2 text-xs uppercase">
                Cart
              </p>

            </div>

            <div className="h-1 w-20 bg-green-600"></div>

            <div className="flex flex-col items-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 font-bold">
                2
              </div>

              <p className="mt-2 text-xs uppercase text-red-500">
                Checkout
              </p>

            </div>

            <div className="h-1 w-20 bg-gray-700"></div>

            <div className="flex flex-col items-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700">
                3
              </div>

              <p className="mt-2 text-xs uppercase text-gray-500">
                Complete
              </p>

            </div>

          </div>

        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[2fr_1fr]">

          {/* LEFT */}

          <form
            onSubmit={handleCheckout}
            className="space-y-8"
          >

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8">

              <h2 className="text-3xl font-black">
                Customer Information
              </h2>

              <div className="mt-8 grid gap-6">

                <input
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  required
                  placeholder="Full Name"
                  className="rounded-xl border border-gray-700 bg-black p-4 outline-none focus:border-red-600"
                />

                <input
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="Email Address"
                  className="rounded-xl border border-gray-700 bg-black p-4 outline-none focus:border-red-600"
                />

                <input
                  value={phone}
                  onChange={(e)=>setPhone(e.target.value)}
                  required
                  placeholder="Phone Number"
                  className="rounded-xl border border-gray-700 bg-black p-4 outline-none focus:border-red-600"
                />

                <textarea
                  rows={5}
                  value={address}
                  onChange={(e)=>setAddress(e.target.value)}
                  required
                  placeholder="Delivery Address"
                  className="rounded-xl border border-gray-700 bg-black p-4 outline-none focus:border-red-600"
                />

              </div>

            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8">

              <h2 className="text-3xl font-black">
                Select Payment Method
              </h2>

              <div className="mt-8 grid gap-5">
                {/* Cash on Delivery */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("Cash on Delivery")
                  }
                  className={`rounded-2xl border p-6 text-left transition ${
                    paymentMethod === "Cash on Delivery"
                      ? "border-red-600 bg-red-600/10"
                      : "border-white/10 hover:border-red-600"
                  }`}
                >
                  <div className="flex items-center gap-4">

                    <Truck
                      size={34}
                      className="text-red-500"
                    />

                    <div>

                      <h3 className="text-xl font-bold">
                        Cash on Delivery
                      </h3>

                      <p className="text-gray-400">
                        Pay when your order arrives.
                      </p>

                    </div>

                  </div>

                </button>

                {paymentMethod === "Cash on Delivery" && (

                  <div className="rounded-2xl border border-green-600/30 bg-green-600/10 p-6">

                    <p className="text-lg font-bold text-green-400">
                      No payment required now.
                    </p>

                    <p className="mt-2 text-gray-300">
                      Please prepare
                      {" "}
                      <span className="font-bold text-white">
                        ₱{total.toLocaleString()}
                      </span>
                      {" "}
                      upon delivery.
                    </p>

                  </div>

                )}

                {/* GCash */}

                <button
                  type="button"
                  onClick={() => setPaymentMethod("GCash")}
                  className={`rounded-2xl border p-6 text-left transition ${
                    paymentMethod === "GCash"
                      ? "border-red-600 bg-red-600/10"
                      : "border-white/10 hover:border-red-600"
                  }`}
                >
                  <div className="flex items-center gap-4">

                    <Wallet
                      size={34}
                      className="text-blue-500"
                    />

                    <div>

                      <h3 className="text-xl font-bold">
                        GCash
                      </h3>

                      <p className="text-gray-400">
                        Instant QR Payment
                      </p>

                    </div>

                  </div>

                </button>

                {paymentMethod === "GCash" && (

                  <div className="rounded-2xl border border-blue-600/30 bg-blue-600/10 p-6">

                    <div className="flex justify-center">

                      <Image
                        src="/payments/gcash-qr.png"
                        alt="GCash QR"
                        width={220}
                        height={220}
                      />

                    </div>

                    <div className="mt-6 space-y-2">

                      <p>
                        Account Name:
                        <span className="ml-2 font-bold">
                          Assorted SG
                        </span>
                      </p>

                      <p>
                        Amount:
                        <span className="ml-2 font-bold text-red-500">
                          ₱{total.toLocaleString()}
                        </span>
                      </p>

                    </div>

                    <input
                      value={paymentReference}
                      onChange={(e)=>
                        setPaymentReference(
                          e.target.value
                        )
                      }
                      placeholder="GCash Reference Number"
                      className="mt-6 w-full rounded-xl border border-gray-700 bg-black p-4"
                    />

                  </div>

                )}

                {/* Maya */}

                <button
                  type="button"
                  onClick={() => setPaymentMethod("Maya")}
                  className={`rounded-2xl border p-6 text-left transition ${
                    paymentMethod === "Maya"
                      ? "border-red-600 bg-red-600/10"
                      : "border-white/10 hover:border-red-600"
                  }`}
                >
                  <div className="flex items-center gap-4">

                    <QrCode
                      size={34}
                      className="text-green-500"
                    />

                    <div>

                      <h3 className="text-xl font-bold">
                        Maya
                      </h3>

                      <p className="text-gray-400">
                        Secure QR Payment
                      </p>

                    </div>

                  </div>

                </button>

                {paymentMethod === "Maya" && (

                  <div className="rounded-2xl border border-green-600/30 bg-green-600/10 p-6">

                    <div className="flex justify-center">

                      <Image
                        src="/payments/maya-qr.png"
                        alt="Maya QR"
                        width={220}
                        height={220}
                      />

                    </div>

                    <p className="mt-6">
                      Amount:
                      <span className="ml-2 font-bold text-red-500">
                        ₱{total.toLocaleString()}
                      </span>
                    </p>

                    <input
                      value={paymentReference}
                      onChange={(e)=>
                        setPaymentReference(
                          e.target.value
                        )
                      }
                      placeholder="Maya Reference Number"
                      className="mt-6 w-full rounded-xl border border-gray-700 bg-black p-4"
                    />

                  </div>

                )}
                {/* Bank Transfer */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("Bank Transfer")
                  }
                  className={`rounded-2xl border p-6 text-left transition ${
                    paymentMethod === "Bank Transfer"
                      ? "border-red-600 bg-red-600/10"
                      : "border-white/10 hover:border-red-600"
                  }`}
                >
                  <div className="flex items-center gap-4">

                    <Landmark
                      size={34}
                      className="text-yellow-500"
                    />

                    <div>

                      <h3 className="text-xl font-bold">
                        Bank Transfer
                      </h3>

                      <p className="text-gray-400">
                        BPI • BDO • Metrobank
                      </p>

                    </div>

                  </div>

                </button>

                {paymentMethod === "Bank Transfer" && (

                  <div className="rounded-2xl border border-yellow-600/30 bg-yellow-600/10 p-6">

                    <p className="font-bold">
                      Transfer Amount
                    </p>

                    <p className="mt-2 text-3xl font-black text-red-500">
                      ₱{total.toLocaleString()}
                    </p>

                    <div className="mt-6 space-y-2">

                      <p>
                        Bank:
                        <span className="ml-2 font-bold">
                          BPI
                        </span>
                      </p>

                      <p>
                        Account Name:
                        <span className="ml-2 font-bold">
                          Assorted SG
                        </span>
                      </p>

                      <p>
                        Account Number:
                        <span className="ml-2 font-bold">
                          0000-0000-0000
                        </span>
                      </p>

                    </div>

                    <input
                      value={paymentReference}
                      onChange={(e) =>
                        setPaymentReference(e.target.value)
                      }
                      placeholder="Bank Reference Number"
                      className="mt-6 w-full rounded-xl border border-gray-700 bg-black p-4"
                    />

                  </div>

                )}

                {/* Credit / Debit Card */}

<button
  type="button"
  onClick={() =>
    setPaymentMethod("Credit / Debit Card")
  }
  className={`rounded-2xl border p-6 text-left transition ${
    paymentMethod === "Credit / Debit Card"
      ? "border-red-600 bg-red-600/10"
      : "border-white/10 hover:border-red-600"
  }`}
>
  <div className="flex items-center gap-4">

    <CreditCard
      size={34}
      className="text-purple-500"
    />

    <div>

      <h3 className="text-xl font-bold">
        Credit / Debit Card
      </h3>

      <p className="text-gray-400">
        Visa • Mastercard
      </p>

    </div>

  </div>

</button>

{paymentMethod === "Credit / Debit Card" && (

  <div className="rounded-2xl border border-purple-600/30 bg-purple-600/10 p-6">

    <div className="flex justify-center">

      <Image
        src="/payments/card-qr.png"
        alt="Card Payment"
        width={220}
        height={220}
      />

    </div>

    <p className="mt-6 text-center text-gray-300">
      Scan the QR code using your banking app or supported card payment app.
    </p>

    <p className="mt-4 text-center text-3xl font-black text-red-500">
      ₱{total.toLocaleString()}
    </p>

    <input
      value={paymentReference}
      onChange={(e) => setPaymentReference(e.target.value)}
      placeholder="Card Payment Reference"
      className="mt-6 w-full rounded-xl border border-gray-700 bg-black p-4"
    />

  </div>

)}

              </div>

            </div>

          </form>

          {/* ORDER SUMMARY */}

          <aside>

            <div className="sticky top-36 rounded-3xl border border-white/10 bg-[#111] p-8">

              <h2 className="text-3xl font-black uppercase">
                Order Summary
              </h2>

              <div className="mt-8 space-y-6">

                {cart.map((item) => (

                  <div
                    key={item.id}
                    className="flex gap-4"
                  >

                    <Image
                      src={item.image}
                      alt={item.name}
                      width={90}
                      height={90}
                      className="rounded-xl object-cover"
                    />

                    <div className="flex-1">

                      <h3 className="font-bold">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-400">
                        Qty: {item.quantity}
                      </p>

                    </div>

                    <div className="font-bold">

                      ₱
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString()}

                    </div>

                  </div>

                ))}

              </div>

              <div className="mt-8 border-t border-gray-700 pt-6 space-y-4">

                <div className="flex justify-between">

                  <span className="text-gray-400">
                    Subtotal
                  </span>

                  <span>
                    ₱{subtotal.toLocaleString()}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-400">
                    Shipping
                  </span>

                  <span>

                    {shipping === 0
                      ? "FREE"
                      : `₱${shipping}`}

                  </span>

                </div>

                <div className="flex justify-between text-3xl font-black">

                  <span>Total</span>

                  <span className="text-red-500">
                    ₱{total.toLocaleString()}
                  </span>

                </div>

              </div>

              <div className="mt-8 rounded-2xl bg-[#181818] p-5">

                <div className="flex items-center gap-3">

                  <ShieldCheck className="text-green-500" />

                  <span className="text-sm">
                    Secure SSL Protected Checkout
                  </span>

                </div>

              </div>

              <button
                onClick={(e) =>
                  handleCheckout(
                    e as unknown as React.FormEvent
                  )
                }
                disabled={loading}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 py-5 text-lg font-black uppercase transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : "Complete Order"}

                <ChevronRight />

              </button>

              <Link
                href="/cart"
                className="mt-5 block text-center text-gray-400 hover:text-white"
              >
                ← Back to Cart
              </Link>

            </div>

          </aside>

        </div>
      </div>

      {/* Payment Methods Footer */}

      <div className="mx-auto mt-20 max-w-7xl px-6">

        <div className="rounded-3xl border border-white/10 bg-[#111] p-8">

          <h3 className="text-center text-xl font-bold uppercase tracking-wider text-gray-300">
            Accepted Payment Methods
          </h3>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-8">

            <Image
              src="/payments/gcash.png"
              alt="GCash"
              width={70}
              height={40}
            />

            <Image
              src="/payments/maya.png"
              alt="Maya"
              width={70}
              height={40}
            />

            <Image
              src="/payments/visa.png"
              alt="Visa"
              width={70}
              height={40}
            />

            <Image
              src="/payments/mastercard.png"
              alt="Mastercard"
              width={70}
              height={40}
            />

            <Image
              src="/payments/cod.png"
              alt="Cash on Delivery"
              width={70}
              height={40}
            />

          </div>

          <div className="mt-10 flex items-center justify-center gap-3 text-sm text-gray-400">

            <ShieldCheck
              size={18}
              className="text-green-500"
            />

            <span>
              Your payment information is encrypted and
              protected using industry-standard security.
            </span>

          </div>

        </div>

      </div>

    </main>
  );
}