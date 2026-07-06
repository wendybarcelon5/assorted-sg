"use client";

import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";

const links = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Cart", href: "/cart" },
];

export default function Navbar() {
  const { cart } = useCart();

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="text-2xl font-black tracking-widest">
          <span className="text-white">ASSORTED </span>
          <span className="text-red-600">SG</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase tracking-wide">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative transition duration-300 ${
                  active
                    ? "text-red-500"
                    : "text-white hover:text-red-500"
                }`}
              >
               {link.name === "Cart" ? (
  <div className="flex items-center gap-2">
    <ShoppingCart size={18} />
    <span>Cart</span>
  </div>
) : (
  link.name
)}

                {link.name === "Cart" && totalItems > 0 && (
                  <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      </div>
    </header>
  );
}