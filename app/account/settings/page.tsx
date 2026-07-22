"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type NotificationPreferences = {
  orderUpdates: boolean;
  emailUpdates: boolean;
  promotions: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  orderUpdates: true,
  emailUpdates: true,
  promotions: false,
};

export default function CustomerSettingsPage() {
  const router = useRouter();

  const [pageLoading, setPageLoading] =
    useState(true);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [
    notificationSaving,
    setNotificationSaving,
  ] = useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [email, setEmail] = useState("");

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    notificationPreferences,
    setNotificationPreferences,
  ] =
    useState<NotificationPreferences>(
      DEFAULT_PREFERENCES
    );

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const clearMessages = () => {
    setMessage("");
    setErrorMessage("");
  };

  const loadAccount = useCallback(async () => {
    setPageLoading(true);
    clearMessages();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      router.replace(
        "/login?redirect=/account/settings"
      );
      return;
    }

    const metadata = user.user_metadata ?? {};

    setEmail(user.email ?? "");

    setFullName(
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : ""
    );

    setPhone(
      typeof metadata.phone === "string"
        ? metadata.phone
        : ""
    );

    setNotificationPreferences({
      orderUpdates:
        typeof metadata.order_updates ===
        "boolean"
          ? metadata.order_updates
          : DEFAULT_PREFERENCES.orderUpdates,

      emailUpdates:
        typeof metadata.email_updates ===
        "boolean"
          ? metadata.email_updates
          : DEFAULT_PREFERENCES.emailUpdates,

      promotions:
        typeof metadata.promotions ===
        "boolean"
          ? metadata.promotions
          : DEFAULT_PREFERENCES.promotions,
    });

    setPageLoading(false);
  }, [router]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  async function saveProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (profileSaving) {
      return;
    }

    clearMessages();

    if (!fullName.trim()) {
      setErrorMessage(
        "Please enter your full name."
      );
      return;
    }

    try {
      setProfileSaving(true);

      const { error } =
        await supabase.auth.updateUser({
          data: {
            full_name: fullName.trim(),
            name: fullName.trim(),
            phone: phone.trim(),
          },
        });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMessage(
        "Your account information was updated successfully."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setErrorMessage(
        "Something went wrong while updating your account."
      );
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (passwordSaving) {
      return;
    }

    clearMessages();

    if (newPassword.length < 8) {
      setErrorMessage(
        "Your new password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        "Your passwords do not match."
      );
      return;
    }

    try {
      setPasswordSaving(true);

      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setNewPassword("");
      setConfirmPassword("");

      setMessage(
        "Your password was changed successfully."
      );
    } catch (error) {
      console.error(
        "Password update error:",
        error
      );

      setErrorMessage(
        "Something went wrong while changing your password."
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  async function saveNotifications() {
    if (notificationSaving) {
      return;
    }

    clearMessages();

    try {
      setNotificationSaving(true);

      const { error } =
        await supabase.auth.updateUser({
          data: {
            order_updates:
              notificationPreferences.orderUpdates,

            email_updates:
              notificationPreferences.emailUpdates,

            promotions:
              notificationPreferences.promotions,
          },
        });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMessage(
        "Your notification preferences were saved."
      );
    } catch (error) {
      console.error(
        "Notification update error:",
        error
      );

      setErrorMessage(
        "Something went wrong while saving your preferences."
      );
    } finally {
      setNotificationSaving(false);
    }
  }

  async function signOutAllDevices() {
    if (loggingOut) {
      return;
    }

    const confirmed = window.confirm(
      "This will log your account out on every device. Continue?"
    );

    if (!confirmed) {
      return;
    }

    clearMessages();

    try {
      setLoggingOut(true);

      const { error } =
        await supabase.auth.signOut({
          scope: "global",
        });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);

      setErrorMessage(
        "Something went wrong while logging out."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  function updatePreference(
    preference: keyof NotificationPreferences
  ) {
    setNotificationPreferences(
      (currentPreferences) => ({
        ...currentPreferences,
        [preference]:
          !currentPreferences[preference],
      })
    );
  }

  if (pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-red-500" />

          <p className="mt-4 font-bold text-gray-300">
            Loading your settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition hover:text-red-500"
          >
            <ArrowLeft size={18} />
            Back to store
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-red-500">
            Customer Account
          </p>

          <h1 className="mt-2 text-4xl font-black sm:text-5xl">
            Account Settings
          </h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            Manage your personal information,
            password, notifications, and account
            security.
          </p>
        </header>

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            <Check
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="font-semibold">
              {message}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-semibold text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="space-y-7">
          {/* Account information */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl sm:p-8">
            <div className="mb-7 flex items-center gap-4">
              <div className="rounded-2xl bg-red-500/10 p-3 text-red-500">
                <User size={26} />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  Account Information
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Update your name and phone
                  number.
                </p>
              </div>
            </div>

            <form
              onSubmit={saveProfile}
              className="space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-bold text-gray-300"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(
                          event.target.value
                        )
                      }
                      placeholder="Enter your full name"
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-12 pr-4 outline-none transition placeholder:text-gray-600 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-bold text-gray-300"
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
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value
                        )
                      }
                      placeholder="09XX XXX XXXX"
                      autoComplete="tel"
                      className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-12 pr-4 outline-none transition placeholder:text-gray-600 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-gray-300"
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
                    value={email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/50 py-3 pl-12 pr-4 text-gray-500 outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Your email address cannot be
                  changed from this page.
                </p>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {profileSaving ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={19} />
                )}

                {profileSaving
                  ? "Saving..."
                  : "Save Information"}
              </button>
            </form>
          </section>

          {/* Password */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl sm:p-8">
            <div className="mb-7 flex items-center gap-4">
              <div className="rounded-2xl bg-red-500/10 p-3 text-red-500">
                <KeyRound size={26} />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Use at least eight characters
                  for your new password.
                </p>
              </div>
            </div>

            <form
              onSubmit={changePassword}
              className="space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-bold text-gray-300"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      id="newPassword"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter new password"
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-12 outline-none transition placeholder:text-gray-600 focus:border-red-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                      aria-label={
                        showNewPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-bold text-gray-300"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Repeat new password"
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-12 outline-none transition placeholder:text-gray-600 focus:border-red-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  passwordSaving ||
                  !newPassword ||
                  !confirmPassword
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {passwordSaving ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <KeyRound size={19} />
                )}

                {passwordSaving
                  ? "Changing..."
                  : "Change Password"}
              </button>
            </form>
          </section>

          {/* Notification preferences */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl sm:p-8">
            <div className="mb-7 flex items-center gap-4">
              <div className="rounded-2xl bg-red-500/10 p-3 text-red-500">
                <Bell size={26} />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  Notification Preferences
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Choose which messages you want
                  to receive.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <PreferenceToggle
                title="Order updates"
                description="Receive notifications when your order status changes."
                checked={
                  notificationPreferences.orderUpdates
                }
                onChange={() =>
                  updatePreference(
                    "orderUpdates"
                  )
                }
              />

              <PreferenceToggle
                title="Account email updates"
                description="Receive important emails about your account."
                checked={
                  notificationPreferences.emailUpdates
                }
                onChange={() =>
                  updatePreference(
                    "emailUpdates"
                  )
                }
              />

              <PreferenceToggle
                title="Promotions and offers"
                description="Receive updates about sales, discounts, and new products."
                checked={
                  notificationPreferences.promotions
                }
                onChange={() =>
                  updatePreference("promotions")
                }
              />
            </div>

            <button
              type="button"
              onClick={() =>
                void saveNotifications()
              }
              disabled={notificationSaving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {notificationSaving ? (
                <Loader2
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Save size={19} />
              )}

              {notificationSaving
                ? "Saving..."
                : "Save Preferences"}
            </button>
          </section>

          {/* Security */}

          <section className="rounded-3xl border border-red-500/20 bg-[#111827] p-6 shadow-2xl sm:p-8">
            <div className="mb-7 flex items-center gap-4">
              <div className="rounded-2xl bg-red-500/10 p-3 text-red-500">
                <ShieldCheck size={26} />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  Account Security
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Protect your account and manage
                  active sessions.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black text-white">
                  Log out on all devices
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  This will end every active login
                  session, including this one.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void signOutAllDevices()
                }
                disabled={loggingOut}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-black text-red-400 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingOut ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <LogOut size={19} />
                )}

                {loggingOut
                  ? "Logging out..."
                  : "Log Out Everywhere"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

type PreferenceToggleProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
};

function PreferenceToggle({
  title,
  description,
  checked,
  onChange,
}: PreferenceToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-left transition hover:border-red-500/40"
    >
      <div>
        <p className="font-black text-white">
          {title}
        </p>

        <p className="mt-1 text-sm text-gray-400">
          {description}
        </p>
      </div>

      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? "bg-red-600"
            : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
    </button>
  );
}