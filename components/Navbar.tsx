"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  X,
  PackageSearch,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useEffect, useState } from "react";

const links = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Track Order", href: "/track-order" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cart } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

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
              <span className="ml-2 text-red-600">SG</span>
            </h1>

            <p className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
              Premium Streetwear
            </p>
          </div>

        </Link>

        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-10 lg:flex">

          {links.map((link) => {

            const active = pathname === link.href;

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

        <div className="flex items-center gap-4">

          <Link
  href="/cart"
  className="group relative rounded-full border border-white/10 bg-[#181818] p-3 text-white transition-all duration-300 hover:border-red-600 hover:bg-red-600"
>

  <ShoppingCart
    size={22}
    className="text-white transition-colors duration-300"
  />

  {totalItems > 0 && (
    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
      {totalItems}
    </span>
  )}

</Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl border border-white/10 p-2 transition hover:border-red-600 lg:hidden"
          >

            {mobileOpen ? (
              <X size={26} />
            ) : (
              <Menu size={26} />
            )}

          </button>

        </div>

      </div>

      {/* Mobile Menu */}

      <div
        className={`overflow-hidden border-t border-white/10 bg-black transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "max-h-[500px]"
            : "max-h-0"
        }`}
      >

        {links.map((link) => {

          const active = pathname === link.href;

          return (

            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 border-b border-white/5 px-6 py-5 font-bold uppercase tracking-widest transition ${
                active
                  ? "bg-red-600 text-white"
                  : "hover:bg-[#181818]"
              }`}
            >

              {link.name === "Track Order" && (
                <PackageSearch size={18} />
              )}

              {link.name}

            </Link>

          );

        })}

      </div>

    </header>
  );
}   