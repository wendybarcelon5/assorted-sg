"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (loading) return;

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (!data.user) {
      alert("Unable to create your account.");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

    if (profileError) {
      console.error(profileError);
      alert("Your account was created but your profile could not be saved.");
      return;
    }

    alert("Account created successfully!");

    router.push("/");
    router.refresh();
  } catch (error) {
    console.error("Registration error:", error);

    alert("Something went wrong while creating your account.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl sm:p-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
              Assorted SG
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Create Account
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Register to view your orders,
              manage your profile, and leave
              product reviews.
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            className="mt-8 space-y-4"
          >
            <div>
              <label
                htmlFor="full-name"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Full name
              </label>

              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                placeholder="Enter your full name"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Phone number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                placeholder="Enter your phone number"
                required
                autoComplete="tel"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Delivery address
              </label>

              <textarea
                id="address"
                value={address}
                onChange={(event) =>
                  setAddress(
                    event.target.value
                  )
                }
                placeholder="Enter your delivery address"
                required
                rows={4}
                autoComplete="street-address"
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Confirm password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password again"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 px-5 py-4 font-black transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-red-500 hover:text-red-400"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}