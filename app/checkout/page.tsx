"use client";

import { useCart } from "@/app/context/CartContext";
import { createNotification } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const paymentMethods = [
  {
    name: "Cash on Delivery",
    label: "Cash on Delivery",
    description: "Pay the rider when your order arrives.",
  },
  {
    name: "GCash",
    label: "GCash",
    description:
      "Send your payment through GCash and upload your receipt.",
  },
  {
    name: "Maya",
    label: "Maya",
    description:
      "Send your payment through Maya and upload your receipt.",
  },
  {
    name: "Visa",
    label: "Visa",
    description:
      "Complete your manual Visa payment and upload proof of payment.",
  },
  {
    name: "Mastercard",
    label: "Mastercard",
    description:
      "Complete your manual Mastercard payment and upload proof of payment.",
  },
];

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

  const [checkingUser, setCheckingUser] =
    useState(true);

  const requiresReceipt = [
    "GCash",
    "Maya",
    "Visa",
    "Mastercard",
  ].includes(paymentMethod);

  const selectedPaymentMethod =
    paymentMethods.find(
      (method) =>
        method.name === paymentMethod
    ) ?? paymentMethods[0];

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    async function loadCustomer() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert(
          "Please log in before checking out."
        );

        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data: profile } =
        await supabase
          .from("profiles")
          .select(
            "full_name, phone, address"
          )
          .eq("id", user.id)
          .maybeSingle();

      if (profile) {
        setName(
          profile.full_name ?? ""
        );

        setPhone(
          profile.phone ?? ""
        );

        setAddress(
          profile.address ?? ""
        );
      }

      setCheckingUser(false);
    }

    loadCustomer();
  }, [router]);

  function handlePaymentMethodChange(
    method: string
  ) {
    setPaymentMethod(method);
    setReceipt(null);
  }

  async function handleCheckout(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (placingOrder) {
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (requiresReceipt && !receipt) {
      alert(
        `Please upload your ${paymentMethod} proof of payment.`
      );

      return;
    }

    try {
      setPlacingOrder(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert(
          "Your session has expired. Please log in again."
        );

        router.replace("/login");
        return;
      }

      let receiptUrl = "";

      if (requiresReceipt && receipt) {
        const safeReceiptName =
          receipt.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "-"
          );

        const fileName = `${user.id}/${Date.now()}-${safeReceiptName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("receipts")
            .upload(fileName, receipt);

        if (uploadError) {
          alert(uploadError.message);
          return;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("receipts")
            .getPublicUrl(fileName);

        receiptUrl =
          publicUrlData.publicUrl;
      }

      const paymentStatus =
        paymentMethod ===
        "Cash on Delivery"
          ? "Pending"
          : "For Verification";

      const {
        data: order,
        error: orderError,
      } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            customer_name: name,
            email,
            phone,
            address,
            payment_method:
              paymentMethod,
            payment_status:
              paymentStatus,
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

      const { error: itemsError } =
        await supabase
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
        })} using ${paymentMethod}. Payment status: ${paymentStatus}.`,
        "order"
      );

      clearCart();

      alert(
        "Order placed successfully!"
      );

      router.push("/");
      router.refresh();
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

  if (checkingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <p className="font-bold text-gray-300">
          Preparing checkout...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-black">
          Checkout
        </h1>

        <form
          onSubmit={handleCheckout}
          className="mt-8 space-y-6"
        >
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Full name"
              required
              className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none transition focus:border-red-500"
            />

            <input
              type="email"
              value={email}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-gray-400 outline-none"
            />

            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value
                )
              }
              placeholder="Phone number"
              required
              className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none transition focus:border-red-500"
            />

            <textarea
              value={address}
              onChange={(event) =>
                setAddress(
                  event.target.value
                )
              }
              placeholder="Delivery address"
              required
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none transition focus:border-red-500"
            />
          </div>

          <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
            <div>
              <h2 className="text-lg font-black">
                Payment Method
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Select how you would like
                to pay.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {paymentMethods.map(
                (method) => {
                  const selected =
                    paymentMethod ===
                    method.name;

                  return (
                    <button
                      key={method.name}
                      type="button"
                      onClick={() =>
                        handlePaymentMethodChange(
                          method.name
                        )
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-red-500 bg-red-500/10"
                          : "border-white/10 bg-black/20 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-white">
                          {
                            method.label
                          }
                        </span>

                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            selected
                              ? "border-red-500 bg-red-500"
                              : "border-gray-600"
                          }`}
                        >
                          {selected && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-gray-400">
                        {
                          method.description
                        }
                      </p>
                    </button>
                  );
                }
              )}
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="font-bold text-white">
                {
                  selectedPaymentMethod.label
                }
              </p>

              <p className="mt-1 text-sm leading-6 text-gray-400">
                {
                  selectedPaymentMethod.description
                }
              </p>

              {requiresReceipt && (
                <div className="mt-4">
                  <label
                    htmlFor="payment-receipt"
                    className="mb-2 block text-sm font-bold text-gray-300"
                  >
                    Upload proof of
                    payment
                  </label>

                  <input
                    id="payment-receipt"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                    onChange={(event) =>
                      setReceipt(
                        event.target
                          .files?.[0] ??
                          null
                      )
                    }
                    required
                    className="block w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-red-500"
                  />

                  {receipt && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-green-500/10 px-3 py-2">
                      <p className="truncate text-sm text-green-400">
                        {receipt.name}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setReceipt(null)
                        }
                        className="shrink-0 text-xs font-bold text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#111827] p-5">
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

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
              <span className="text-gray-500">
                Selected payment
              </span>

              <span className="font-bold text-white">
                {paymentMethod}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
              <span className="text-gray-500">
                Initial payment status
              </span>

              <span className="font-bold text-yellow-400">
                {paymentMethod ===
                "Cash on Delivery"
                  ? "Pending"
                  : "For Verification"}
              </span>
            </div>
          </section>

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