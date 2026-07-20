"use client";

import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Address = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
};

type AddressForm = {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
};

const emptyForm: AddressForm = {
  full_name: "",
  phone: "",
  address_line: "",
  city: "",
  province: "",
  postal_code: "",
  is_default: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [userId, setUserId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] =
    useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        window.location.href = "/login?redirect=/addresses";
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setAddresses((data ?? []) as Address[]);
    } catch (error) {
      console.error("Address loading error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your addresses."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof AddressForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
    setErrorMessage("");
  }

  function openAddForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      is_default: addresses.length === 0,
    });
    setShowForm(true);
    setMessage("");
    setErrorMessage("");
  }

  function openEditForm(address: Address) {
    setEditingId(address.id);

    setForm({
      full_name: address.full_name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
      is_default: address.is_default,
    });

    setShowForm(true);
    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
    setErrorMessage("");
  }

  function validateForm() {
    if (!form.full_name.trim()) {
      return "Please enter the recipient's full name.";
    }

    if (!form.phone.trim()) {
      return "Please enter a phone number.";
    }

    if (form.phone.replace(/\D/g, "").length < 10) {
      return "Please enter a valid phone number.";
    }

    if (!form.address_line.trim()) {
      return "Please enter the street or barangay address.";
    }

    if (!form.city.trim()) {
      return "Please enter the city or municipality.";
    }

    if (!form.province.trim()) {
      return "Please enter the province.";
    }

    if (!form.postal_code.trim()) {
      return "Please enter the postal code.";
    }

    return "";
  }

  async function removeCurrentDefault() {
    const { error } = await supabase
      .from("addresses")
      .update({
        is_default: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("is_default", true);

    if (error) {
      throw error;
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      if (!userId) {
        throw new Error("Please sign in again.");
      }

      const shouldBeDefault =
        form.is_default || addresses.length === 0;

      if (shouldBeDefault) {
        await removeCurrentDefault();
      }

      const addressData = {
        user_id: userId,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address_line: form.address_line.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        postal_code: form.postal_code.trim(),
        is_default: shouldBeDefault,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from("addresses")
          .update(addressData)
          .eq("id", editingId)
          .eq("user_id", userId);

        if (error) {
          throw error;
        }

        setMessage("Address updated successfully.");
      } else {
        const { error } = await supabase
          .from("addresses")
          .insert({
            ...addressData,
            created_at: new Date().toISOString(),
          });

        if (error) {
          throw error;
        }

        setMessage("Address added successfully.");
      }

      setEditingId(null);
      setForm(emptyForm);
      setShowForm(false);

      await loadAddresses();
    } catch (error) {
      console.error("Address save error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the address."
      );
    } finally {
      setSaving(false);
    }
  }

  async function setDefaultAddress(addressId: string) {
    if (settingDefaultId) {
      return;
    }

    try {
      setSettingDefaultId(addressId);
      setMessage("");
      setErrorMessage("");

      await removeCurrentDefault();

      const { error } = await supabase
        .from("addresses")
        .update({
          is_default: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", addressId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      setMessage("Default address updated.");

      await loadAddresses();
    } catch (error) {
      console.error("Default address error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to set the default address."
      );
    } finally {
      setSettingDefaultId(null);
    }
  }

  async function deleteAddress(address: Address) {
    if (deletingId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(address.id);
      setMessage("");
      setErrorMessage("");

      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", address.id)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      const remainingAddresses = addresses.filter(
        (item) => item.id !== address.id
      );

      if (address.is_default && remainingAddresses.length > 0) {
        const nextDefault = remainingAddresses[0];

        const { error: defaultError } = await supabase
          .from("addresses")
          .update({
            is_default: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", nextDefault.id)
          .eq("user_id", userId);

        if (defaultError) {
          throw defaultError;
        }
      }

      setMessage("Address deleted successfully.");

      await loadAddresses();
    } catch (error) {
      console.error("Address deletion error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete the address."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex items-center gap-3 text-lg font-bold">
          <Loader2
            className="animate-spin text-red-500"
            size={24}
          />
          Loading addresses...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 font-bold text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={19} />
          Back to My Account
        </Link>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
              Delivery Information
            </p>

            <h1 className="mt-2 text-4xl font-black">
              My Addresses
            </h1>

            <p className="mt-2 text-gray-400">
              Add and manage your delivery addresses.
            </p>
          </div>

          {!showForm && (
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-black transition hover:bg-red-700"
            >
              <Plus size={20} />
              Add New Address
            </button>
          )}
        </div>

        {message && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            <CheckCircle2
              size={21}
              className="mt-0.5 shrink-0"
            />

            <p className="font-semibold">{message}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-semibold text-red-300">
            {errorMessage}
          </div>
        )}

        {showForm && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <h2 className="text-2xl font-black">
                  {editingId
                    ? "Edit Address"
                    : "Add New Address"}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Enter the customer's delivery information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-white/10 p-3 text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                aria-label="Close address form"
              >
                <X size={21} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 p-6 md:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="full_name"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  Recipient Full Name
                </label>

                <input
                  id="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={(event) =>
                    updateField(
                      "full_name",
                      event.target.value
                    )
                  }
                  placeholder="Enter full name"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 outline-none transition placeholder:text-gray-600 focus:border-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value
                    )
                  }
                  placeholder="+63 912 345 6789"
                  autoComplete="tel"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 outline-none transition placeholder:text-gray-600 focus:border-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="address_line"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  House Number, Street and Barangay
                </label>

                <textarea
                  id="address_line"
                  value={form.address_line}
                  onChange={(event) =>
                    updateField(
                      "address_line",
                      event.target.value
                    )
                  }
                  placeholder="House number, street, subdivision and barangay"
                  rows={3}
                  autoComplete="street-address"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-4 outline-none transition placeholder:text-gray-600 focus:border-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  City or Municipality
                </label>

                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={(event) =>
                    updateField(
                      "city",
                      event.target.value
                    )
                  }
                  placeholder="Enter city or municipality"
                  autoComplete="address-level2"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 outline-none transition placeholder:text-gray-600 focus:border-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="province"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  Province
                </label>

                <input
                  id="province"
                  type="text"
                  value={form.province}
                  onChange={(event) =>
                    updateField(
                      "province",
                      event.target.value
                    )
                  }
                  placeholder="Enter province"
                  autoComplete="address-level1"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 outline-none transition placeholder:text-gray-600 focus:border-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="postal_code"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  Postal Code
                </label>

                <input
                  id="postal_code"
                  type="text"
                  value={form.postal_code}
                  onChange={(event) =>
                    updateField(
                      "postal_code",
                      event.target.value
                    )
                  }
                  placeholder="Enter postal code"
                  autoComplete="postal-code"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 outline-none transition placeholder:text-gray-600 focus:border-red-500"
                />
              </div>

              <div className="flex items-center">
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(event) =>
                      updateField(
                        "is_default",
                        event.target.checked
                      )
                    }
                    className="h-5 w-5 accent-red-600"
                  />

                  <span className="font-bold">
                    Set as default address
                  </span>
                </label>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-6 md:col-span-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-black transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={19} />
                      {editingId
                        ? "Save Changes"
                        : "Save Address"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-2xl border border-white/15 px-6 py-4 font-black transition hover:border-white/40 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!showForm && addresses.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-white/20 bg-[#111827] px-6 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-600/10 text-red-500">
              <MapPin size={38} />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              No Saved Addresses
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-400">
              Add a delivery address so checkout can be faster
              and easier.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-black transition hover:bg-red-700"
            >
              <Plus size={20} />
              Add Your First Address
            </button>
          </div>
        )}

        {!showForm && addresses.length > 0 && (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {addresses.map((address) => (
              <article
                key={address.id}
                className={`relative rounded-3xl border p-6 transition ${
                  address.is_default
                    ? "border-red-500/60 bg-red-500/5"
                    : "border-white/10 bg-[#111827]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/10 text-red-500">
                      <Home size={25} />
                    </div>

                    <div>
                      <h2 className="text-xl font-black">
                        {address.full_name}
                      </h2>

                      {address.is_default && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                          <Star size={13} fill="currentColor" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-gray-300">
                  <p>{address.phone}</p>
                  <p>{address.address_line}</p>
                  <p>
                    {address.city}, {address.province}
                  </p>
                  <p>{address.postal_code}</p>
                </div>

                <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => openEditForm(address)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 font-bold transition hover:border-white/40 hover:bg-white/5"
                  >
                    <Pencil size={17} />
                    Edit
                  </button>

                  {!address.is_default && (
                    <button
                      type="button"
                      onClick={() =>
                        void setDefaultAddress(address.id)
                      }
                      disabled={
                        settingDefaultId === address.id
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 px-4 py-3 font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {settingDefaultId === address.id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Star size={17} />
                      )}

                      Set Default
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      void deleteAddress(address)
                    }
                    disabled={deletingId === address.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-3 font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deletingId === address.id ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={17} />
                    )}

                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}