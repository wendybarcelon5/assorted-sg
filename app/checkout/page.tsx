"use client";

import { useCart } from "@/app/context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [receipt, setReceipt] = useState<File | null>(null);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    let receiptUrl = "";

    // Upload GCash receipt
    if (paymentMethod === "GCash") {
      if (!receipt) {
        alert("Please upload your GCash receipt.");
        return;
      }

      const fileName = `${Date.now()}-${receipt.name}`;

      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("receipts")
          .upload(fileName, receipt);

      console.log("Upload Data:", uploadData);
      console.log("Upload Error:", uploadError);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      receiptUrl = data.publicUrl;

      console.log("Receipt URL:", receiptUrl);
    }

    // Save Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: name,
          email,
          phone,
          address,
          payment_method: paymentMethod,
          receipt_url: receiptUrl,
          total,
          status: "Pending",
        },
      ])
      .select()
      .single();

    if (orderError) {
      alert(orderError.message);
      return;
    }

    // Save Order Items
    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      alert(itemsError.message);
      return;
    }

    clearCart();

    alert("Order placed successfully!");

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-black px-8 py-32 text-white">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-5xl font-black">
          Checkout
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">

          {/* Customer Information */}
          <form
            onSubmit={handleCheckout}
            className="space-y-6"
          >
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
              required
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
              required
            />

            <textarea
              rows={5}
              placeholder="Delivery Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
              required
            />

            <div>
              <label className="mb-2 block font-semibold">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
              >
                <option>Cash on Delivery</option>
                <option>GCash</option>
                <option>Bank Transfer</option>
                <option>Credit / Debit Card</option>
              </select>

              {paymentMethod === "GCash" && (
                <div className="mt-4">
                  <label className="mb-2 block font-semibold">
                    Upload GCash Receipt
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setReceipt(e.target.files?.[0] || null)
                    }
                    className="w-full rounded-lg border border-gray-700 bg-[#111] p-4"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-red-600 py-4 font-bold hover:bg-red-700"
            >
              Place Order
            </button>
          </form>

          {/* Order Summary */}
          <div className="rounded-xl border border-gray-800 bg-[#111] p-6">
            <h2 className="mb-6 text-2xl font-bold">
              Order Summary
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span>
                    ₱{(
                      item.price * item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between border-t border-gray-700 pt-6 text-2xl font-black">
              <span>Total</span>

              <span className="text-red-500">
                ₱{total.toLocaleString()}
              </span>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}