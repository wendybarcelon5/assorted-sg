"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  BarChart3,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: Package,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: ShoppingBag,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Button */}

      <button
        onClick={() => setOpen(true)}
        className="fixed left-5 top-5 z-50 rounded-xl bg-red-600 p-3 text-white shadow-lg lg:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}

      <aside
  className={`fixed left-0 top-0 z-50 h-screen w-72 border-r border-white/10 bg-[#111827] text-white transition-transform duration-300
  ${
    open ? "translate-x-0" : "-translate-x-full"
  } lg:translate-x-0`}
>
        {/* Header */}

        <div className="flex items-center justify-between border-b border-white/10 p-6">

          <div>

            <h1 className="text-2xl font-black tracking-wider">
              ASSORTED
              <span className="text-red-600"> SG</span>
            </h1>

            <p className="mt-1 text-xs uppercase tracking-[4px] text-[#D4AF37]">
              Admin Panel
            </p>

          </div>

          <button
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            <X />
          </button>

        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-2 p-5">

          {menuItems.map((item) => {

            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-300 ${
                  active
                    ? "border-l-4 border-[#D4AF37] bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : "hover:bg-[#1F2937]"
                }`}
              >
                <Icon size={22} />

                <span className="font-semibold">
                  {item.name}
                </span>

              </Link>
            );

          })}

        </nav>

        {/* Footer */}

        <div className="border-t border-white/10 p-5">

          <button className="flex w-full items-center gap-4 rounded-xl bg-[#1F2937] px-5 py-4 transition hover:bg-red-600">

            <LogOut size={20} />

            Logout

          </button>

        </div>

      </aside>
    </>
  );
}