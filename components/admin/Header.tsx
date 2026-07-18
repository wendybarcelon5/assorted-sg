"use client";

import {
  Bell,
  Search,
  UserCircle2,
} from "lucide-react";

export default function Header() {
  // Change this later when your notification system is ready
  const unreadNotifications = 0;

  return (
    <header className="border-b border-white/10 bg-[#111827] text-white">
      <div>
        <h1 className="text-3xl font-black text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Welcome back, Assorted SG 👋
        </p>
      </div>

      <div className="flex items-center gap-5">
        {/* Search */}

        <div className="hidden md:flex items-center rounded-xl border border-white/10 bg-[#1E293B] px-4 py-3">
          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="ml-3 w-64 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>

        {/* Notifications */}

        <button className="relative rounded-xl bg-[#1E293B] p-3 transition hover:bg-red-600">
          <Bell size={20} />

          {unreadNotifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadNotifications > 99
                ? "99+"
                : unreadNotifications}
            </span>
          )}
        </button>

        {/* Profile */}

        <button className="flex items-center gap-3 rounded-xl bg-[#1E293B] px-4 py-2 transition hover:bg-[#293548]">
          <UserCircle2
            size={40}
            className="text-[#D4AF37]"
          />

          <div className="hidden text-left lg:block">
            <p className="font-bold text-white">
              Assorted SG
            </p>

            <p className="text-xs text-green-400">
              ● Online
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}