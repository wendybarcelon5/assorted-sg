"use client";

import { useCart } from "@/app/context/CartContext";
import { createNotification } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("Cash on Delivery");

  const [receipt, setReceipt] =
    useState<File | null>(null);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  async function handleCheckout(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (placingOrder) {
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);

      let receiptUrl = "";

      if (paymentMethod === "GCash") {
        if (!receipt) {
          alert(
            "Please upload your GCash receipt."
          );
          return;
        }

        const safeReceiptName =
          receipt.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "-"
          );

        const fileName = `${Date.now()}-${safeReceiptName}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("receipts")
          .upload(fileName, receipt);

        if (uploadError) {
          alert(uploadError.message);
          return;
        }

        const { data } =
          supabase.storage
            .from("receipts")
            .getPublicUrl(fileName);

        receiptUrl = data.publicUrl;
      }

      const {
        data: order,
        error: orderError,
      } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: name,
            email,
            phone,
            address,
            payment_method:
              paymentMethod,
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

      const orderItems = cart.map(
        (item) => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })
      );

      const {
        error: itemsError,
      } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        alert(itemsError.message);
        return;
      }

      await createNotification(
        "New Order",
        `${name} placed order #${order.id} worth ₱${Number(
          total
        ).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} using ${paymentMethod}.`,
        "order"
      );

      clearCart();

      alert(
        "Order placed successfully!"
      );

      router.push("/");
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      alert(
        "Something went wrong while placing your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-black">
          Checkout
        </h1>

        <form
          onSubmit={handleCheckout}
          className="mt-8 space-y-5"
        >
          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Full name"
            required
            className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none focus:border-red-500"
          />

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Email"
            required
            className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none focus:border-red-500"
          />

          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="Phone number"
            required
            className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none focus:border-red-500"
          />

          <textarea
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            placeholder="Delivery address"
            required
            rows={4}
            className="w-full resize-none rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none focus:border-red-500"
          />

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none focus:border-red-500"
          >
            <option value="Cash on Delivery">
              Cash on Delivery
            </option>

            <option value="GCash">
              GCash
            </option>
          </select>

          {paymentMethod === "GCash" && (
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-300">
                Upload GCash receipt
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setReceipt(
                    e.target.files?.[0] ??
                      null
                  )
                }
                required
                className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm"
              />
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">
                Total
              </span>

              <span className="text-xl font-black text-yellow-400">
                ₱
                {total.toLocaleString(
                  "en-PH",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              placingOrder ||
              cart.length === 0
            }
            className="w-full rounded-xl bg-red-600 px-5 py-4 font-black transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {placingOrder
              ? "Placing order..."
              : "Place Order"}
          </button>
        </form>
      </div>
    </main>
  );
}