"use client";

import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
};

const emptyForm: ProfileForm = {
  full_name: "",
  email: "",
  phone: "",
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        window.location.href = "/login?redirect=/profile";
        return;
      }

      setUserId(user.id);

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name,email,phone")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) throw profileError;

      setForm({
        full_name:
          profileData?.full_name ??
          user.user_metadata?.full_name ??
          "",
        email: profileData?.email ?? user.email ?? "",
        phone: profileData?.phone ?? "",
      });
    } catch (error) {
      console.error("Profile loading error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
    setErrorMessage("");
  }

  function validateForm() {
    if (!form.full_name.trim()) return "Please enter your full name.";
    if (!form.email.trim()) return "Please enter your email address.";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (
      form.phone.trim() &&
      form.phone.replace(/\D/g, "").length < 10
    ) {
      return "Please enter a valid phone number.";
    }

    return "";
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (saving) return;

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError ?? new Error("Please sign in again.");
      }

      const normalizedEmail = form.email.trim().toLowerCase();
      const emailChanged =
        normalizedEmail !== (user.email ?? "").toLowerCase();

      if (emailChanged) {
        const { error: emailError } =
          await supabase.auth.updateUser({
            email: normalizedEmail,
          });

        if (emailError) throw emailError;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: form.full_name.trim(),
            email: normalizedEmail,
            phone: form.phone.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (profileError) throw profileError;

      const { error: metadataError } =
        await supabase.auth.updateUser({
          data: { full_name: form.full_name.trim() },
        });

      if (metadataError) throw metadataError;

      setForm((current) => ({
        ...current,
        full_name: current.full_name.trim(),
        email: normalizedEmail,
        phone: current.phone.trim(),
      }));

      setMessage(
        emailChanged
          ? "Profile saved. Check your inbox to confirm your new email address."
          : "Profile saved successfully."
      );
    } catch (error) {
      console.error("Profile update error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex items-center gap-3 text-lg font-bold">
          <Loader2 className="animate-spin text-red-500" size={24} />
          Loading profile...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 font-bold text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={19} />
          Back to My Account
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
          <div className="border-b border-white/10 bg-gradient-to-br from-[#1E293B] via-[#111827] to-black p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600">
                <User size={42} />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
                  Customer Profile
                </p>
                <h1 className="mt-2 text-4xl font-black">Edit Profile</h1>
                <p className="mt-2 text-gray-400">
                  Update your personal and contact information.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 p-8">
            {message && (
              <div className="flex items-start gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
                <CheckCircle2 size={21} className="mt-0.5 shrink-0" />
                <p className="font-semibold">{message}</p>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-semibold text-red-300">
                {errorMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="full_name"
                className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-300"
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={(event) =>
                    updateField("full_name", event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-red-500"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Changing your email may require inbox confirmation.
              </p>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-300"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  placeholder="+63 912 345 6789"
                  autoComplete="tel"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-red-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-gray-500">Account ID</p>
              <p className="mt-1 break-all font-mono text-sm text-gray-300">
                {userId}
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-7 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-black uppercase tracking-wide transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
              >
                {saving ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={19} />
                    Save Changes
                  </>
                )}
              </button>

              <Link
                href="/account"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-4 font-black uppercase tracking-wide text-white transition hover:border-white/40 hover:bg-white/5"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}