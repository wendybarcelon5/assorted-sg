"use client";

import { useCart } from "@/app/context/CartContext";
import { createNotification } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2,
  ChevronDown,
  MapPin,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SavedAddress = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
};

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

function formatAddress(savedAddress: SavedAddress) {
  return [
    savedAddress.address_line,
    `${savedAddress.city}, ${savedAddress.province}`,
    savedAddress.postal_code,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<
    SavedAddress[]
  >([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [showAddressOptions, setShowAddressOptions] =
    useState(false);

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
      (method) => method.name === paymentMethod
    ) ?? paymentMethods[0];

  const selectedSavedAddress =
    savedAddresses.find(
      (item) => item.id === selectedAddressId
    ) ?? null;

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    async function loadCustomer() {
      try {
        setCheckingUser(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          alert(
            "Please log in before checking out."
          );

          router.replace(
            "/login?redirect=/checkout"
          );

          return;
        }

        setEmail(user.email ?? "");

        const [
          profileResult,
          addressesResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name,phone")
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("addresses")
            .select(
              "id,user_id,full_name,phone,address_line,city,province,postal_code,is_default"
            )
            .eq("user_id", user.id)
            .order("is_default", {
              ascending: false,
            })
            .order("created_at", {
              ascending: false,
            }),
        ]);

        if (profileResult.error) {
          console.error(
            "Profile loading error:",
            profileResult.error
          );
        }

        if (addressesResult.error) {
          console.error(
            "Address loading error:",
            addressesResult.error
          );
        }

        const profile =
          profileResult.data;

        const addresses =
          (addressesResult.data ??
            []) as SavedAddress[];

        setSavedAddresses(addresses);

        const defaultAddress =
          addresses.find(
            (item) => item.is_default
          ) ??
          addresses[0] ??
          null;

        if (defaultAddress) {
          setSelectedAddressId(
            defaultAddress.id
          );

          setName(
            defaultAddress.full_name ||
              profile?.full_name ||
              ""
          );

          setPhone(
            defaultAddress.phone ||
              profile?.phone ||
              ""
          );

          setAddress(
            formatAddress(defaultAddress)
          );
        } else {
          setName(
            profile?.full_name ??
              user.user_metadata?.full_name ??
              ""
          );

          setPhone(
            profile?.phone ?? ""
          );
        }
      } catch (error) {
        console.error(
          "Checkout loading error:",
          error
        );

        alert(
          "Unable to prepare checkout. Please refresh the page."
        );
      } finally {
        setCheckingUser(false);
      }
    }

    void loadCustomer();
  }, [router]);

  function selectSavedAddress(
    savedAddress: SavedAddress
  ) {
    setSelectedAddressId(savedAddress.id);
    setName(savedAddress.full_name);
    setPhone(savedAddress.phone);
    setAddress(
      formatAddress(savedAddress)
    );
    setShowAddressOptions(false);
  }

  function handlePaymentMethodChange(
    method: string
  ) {
    setPaymentMethod(method);
    setReceipt(null);
  }

  async function handleCheckout(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (placingOrder) {
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!name.trim()) {
      alert(
        "Please enter the recipient's full name."
      );
      return;
    }

    if (!phone.trim()) {
      alert(
        "Please enter a phone number."
      );
      return;
    }

    if (
      phone.replace(/\D/g, "").length < 10
    ) {
      alert(
        "Please enter a valid phone number."
      );
      return;
    }

    if (!address.trim()) {
      alert(
        "Please enter a delivery address."
      );
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

        router.replace(
          "/login?redirect=/checkout"
        );

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
            customer_name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
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
        `${name.trim()} placed order #${
          order.id
        } worth ₱${Number(
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

      router.push("/my-orders");
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
          <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin
                    size={22}
                    className="text-red-500"
                  />

                  <h2 className="text-lg font-black">
                    Shipping Address
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-400">
                  Choose where your order
                  should be delivered.
                </p>
              </div>

              {savedAddresses.length >
                0 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAddressOptions(
                      (current) =>
                        !current
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 font-bold transition hover:border-red-500 hover:text-red-400"
                >
                  Change Address
                  <ChevronDown
                    size={18}
                    className={`transition ${
                      showAddressOptions
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {savedAddresses.length ===
            0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-white/20 bg-black/20 p-5">
                <p className="font-bold text-white">
                  No saved address found
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Enter your delivery
                  information below or add a
                  saved address first.
                </p>

                <Link
                  href="/addresses"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold transition hover:bg-red-500"
                >
                  <Plus size={18} />
                  Add Saved Address
                </Link>
              </div>
            ) : (
              selectedSavedAddress && (
                <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-white">
                          {
                            selectedSavedAddress.full_name
                          }
                        </p>

                        {selectedSavedAddress.is_default && (
                          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-gray-300">
                        {
                          selectedSavedAddress.phone
                        }
                      </p>

                      <div className="mt-2 whitespace-pre-line leading-7 text-gray-400">
                        {formatAddress(
                          selectedSavedAddress
                        )}
                      </div>
                    </div>

                    <CheckCircle2
                      size={24}
                      className="shrink-0 text-red-500"
                    />
                  </div>
                </div>
              )
            )}

            {showAddressOptions &&
              savedAddresses.length > 0 && (
                <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
                  <p className="font-black text-white">
                    Choose a saved address
                  </p>

                  {savedAddresses.map(
                    (savedAddress) => {
                      const isSelected =
                        selectedAddressId ===
                        savedAddress.id;

                      return (
                        <button
                          key={
                            savedAddress.id
                          }
                          type="button"
                          onClick={() =>
                            selectSavedAddress(
                              savedAddress
                            )
                          }
                          className={`w-full rounded-xl border p-4 text-left transition ${
                            isSelected
                              ? "border-red-500 bg-red-500/10"
                              : "border-white/10 bg-black/20 hover:border-white/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-black text-white">
                                  {
                                    savedAddress.full_name
                                  }
                                </p>

                                {savedAddress.is_default && (
                                  <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-black uppercase text-white">
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-sm text-gray-400">
                                {
                                  savedAddress.phone
                                }
                              </p>

                              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-400">
                                {formatAddress(
                                  savedAddress
                                )}
                              </p>
                            </div>

                            <span
                              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-red-500 bg-red-500"
                                  : "border-gray-600"
                              }`}
                            >
                              {isSelected && (
                                <span className="h-2 w-2 rounded-full bg-white" />
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )}

                  <Link
                    href="/addresses"
                    className="inline-flex items-center gap-2 font-bold text-red-500 transition hover:text-red-400"
                  >
                    <Plus size={17} />
                    Manage Addresses
                  </Link>
                </div>
              )}
          </section>

          <section className="space-y-4 rounded-2xl border border-white/10 bg-[#111827] p-5">
            <div>
              <h2 className="text-lg font-black">
                Recipient Information
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                You can still adjust these
                details for this order.
              </p>
            </div>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Full name"
              required
              autoComplete="name"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-red-500"
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
                setPhone(event.target.value)
              }
              placeholder="Phone number"
              required
              autoComplete="tel"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-red-500"
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
              autoComplete="street-address"
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-red-500"
            />
          </section>

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
                    Upload proof of payment
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