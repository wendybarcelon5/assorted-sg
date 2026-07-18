"use client";

import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  ChevronDown,
  Heart,
  LogIn,
  LogOut,
  Menu,
  PackageSearch,
  ShoppingBag,
  ShoppingCart,
  Star,
  UserCircle2,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

const links = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  {
    name: "Track Order",
    href: "/track-order",
  },
];

type CustomerProfile = {
  full_name: string | null;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<CustomerProfile | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const accountMenuRef =
    useRef<HTMLDivElement | null>(null);

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const customerName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Customer";

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, [mobileOpen]);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        setUser(currentUser);

        if (currentUser) {
          await loadProfile(
            currentUser.id
          );
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error(
          "Unable to load customer:",
          error
        );
      } finally {
        setAuthLoading(false);
      }
    }

    void loadCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser =
          session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await loadProfile(
            currentUser.id
          );
        } else {
          setProfile(null);
        }

        setAuthLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  async function loadProfile(
    userId: string
  ) {
    const { data, error } =
      await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
      console.error(
        "Unable to load customer profile:",
        error
      );

      setProfile(null);
      return;
    }

    setProfile(
      data as CustomerProfile | null
    );
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        alert(error.message);
        return;
      }

      setAccountOpen(false);
      setMobileOpen(false);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      alert(
        "Unable to log out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="fixed left-0 top-9 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-4 transition hover:scale-105"
        >
          <Image
            src="/logo.png"
            alt="Assorted SG"
            width={58}
            height={58}
            priority
            className="rounded-full border border-red-600 shadow-lg shadow-red-600/40"
          />

          <div className="hidden sm:block">
            <h1 className="text-2xl font-black tracking-[0.25em] text-white">
              ASSORTED
              <span className="ml-2 text-red-600">
                SG
              </span>
            </h1>

            <p className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
              Premium Streetwear
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}

<nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => {
            const active =
              pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`group relative text-sm font-bold uppercase tracking-widest transition ${
                  active
                    ? "text-red-500"
                    : "text-white hover:text-[#D4AF37]"
                }`}
              >
                {link.name}

                <span
                  className={`absolute -bottom-2 left-0 h-[2px] bg-red-600 transition-all duration-300 ${
                    active
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}

        <div className="flex items-center gap-3">
          {!authLoading && (
            <>
              {!user ? (
                <div className="hidden items-center gap-2 md:flex">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-sm font-bold text-white transition hover:border-red-600 hover:bg-red-600"
                  >
                    <LogIn size={18} />
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500"
                  >
                    <UserPlus size={18} />
                    Register
                  </Link>
                </div>
              ) : (
                <div
                  ref={accountMenuRef}
                  className="relative hidden md:block"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setAccountOpen(
                        (current) =>
                          !current
                      )
                    }
                    aria-expanded={
                      accountOpen
                    }
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-white transition hover:border-red-600"
                  >
                    <UserCircle2
                      size={22}
                      className="text-[#D4AF37]"
                    />

                    <span className="max-w-32 truncate text-sm font-bold">
                      {customerName}
                    </span>

                    <ChevronDown
                      size={17}
                      className={`transition ${
                        accountOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl">
                      <div className="border-b border-white/10 px-5 py-4">
                        <p className="truncate font-black text-white">
                          {customerName}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>

                      <div className="p-2">
                        <Link
                          href="/account"
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-gray-300 transition hover:bg-white/5 hover:text-white"
                        >
                          <UserCircle2
                            size={18}
                          />
                          My Account
                        </Link>

                        <Link
                          href="/my-orders"
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-gray-300 transition hover:bg-white/5 hover:text-white"
                        >
                          <ShoppingBag
                            size={18}
                          />
                          Order History
                        </Link>

                        <Link
                          href="/wishlist"
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-gray-300 transition hover:bg-white/5 hover:text-white"
                        >
                          <Heart size={18} />
                          Wishlist
                        </Link>

                        <Link
                          href="/my-reviews"
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-gray-300 transition hover:bg-white/5 hover:text-white"
                        >
                          <Star size={18} />
                          My Reviews
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            void handleLogout()
                          }
                          disabled={
                            loggingOut
                          }
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <LogOut
                            size={18}
                          />

                          {loggingOut
                            ? "Logging out..."
                            : "Logout"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <Link
            href="/cart"
            className="group relative rounded-full border border-white/10 bg-[#181818] p-3 text-white transition-all duration-300 hover:border-red-600 hover:bg-red-600"
          >
            <ShoppingCart
              size={22}
              className="text-white"
            />

            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {totalItems > 99
                  ? "99+"
                  : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (current) => !current
              )
            }
            className="rounded-xl border border-white/10 p-2 text-white transition hover:border-red-600 hover:bg-red-600 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X
                size={28}
                strokeWidth={2.5}
              />
            ) : (
              <Menu
                size={28}
                strokeWidth={2.5}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}

      <div
        className={`overflow-y-auto border-t border-white/10 bg-[#111827] transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "max-h-[calc(100vh-8.25rem)]"
            : "max-h-0"
        }`}
      >
        {links.map((link) => {
          const active =
            pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 border-b border-white/10 px-6 py-5 text-base font-bold uppercase tracking-widest transition ${
                active
                  ? "bg-red-600 text-white"
                  : "text-white hover:bg-[#1E293B]"
              }`}
            >
              {link.name ===
                "Track Order" && (
                <PackageSearch
                  size={18}
                />
              )}

              {link.name}
            </Link>
          );
        })}

        {!authLoading && !user && (
          <div className="grid grid-cols-2 gap-3 border-b border-white/10 p-5">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-bold text-white transition hover:border-red-600"
            >
              <LogIn size={18} />
              Login
            </Link>

            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-500"
            >
              <UserPlus size={18} />
              Register
            </Link>
          </div>
        )}

        {!authLoading && user && (
          <div className="border-b border-white/10">
            <div className="border-b border-white/10 bg-black/20 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Signed in as
              </p>

              <p className="mt-2 font-black text-white">
                {customerName}
              </p>

              <p className="mt-1 truncate text-sm text-gray-500">
                {user.email}
              </p>
            </div>

            <Link
              href="/account"
              className="flex items-center gap-3 border-b border-white/10 px-6 py-4 font-bold text-white transition hover:bg-[#1E293B]"
            >
              <UserCircle2
                size={19}
              />
              My Account
            </Link>

            <Link
              href="/my-orders"
              className="flex items-center gap-3 border-b border-white/10 px-6 py-4 font-bold text-white transition hover:bg-[#1E293B]"
            >
              <ShoppingBag
                size={19}
              />
              Order History
            </Link>

            <Link
              href="/wishlist"
              className="flex items-center gap-3 border-b border-white/10 px-6 py-4 font-bold text-white transition hover:bg-[#1E293B]"
            >
              <Heart size={19} />
              Wishlist
            </Link>

            <Link
              href="/my-reviews"
              className="flex items-center gap-3 border-b border-white/10 px-6 py-4 font-bold text-white transition hover:bg-[#1E293B]"
            >
              <Star size={19} />
              My Reviews
            </Link>

            <button
              type="button"
              onClick={() =>
                void handleLogout()
              }
              disabled={loggingOut}
              className="flex w-full items-center gap-3 px-6 py-4 text-left font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              <LogOut size={19} />

              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}