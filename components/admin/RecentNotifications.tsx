"use client";

import { supabase } from "@/lib/supabase";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Notification = {
  id: string | number;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string;
};

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function badgeColor(type: string | null) {
  switch (type?.toLowerCase()) {
    case "order":
      return "bg-blue-500/20 text-blue-400";
    case "payment":
      return "bg-green-500/20 text-green-400";
    case "stock":
      return "bg-yellow-500/20 text-yellow-400";
    default:
      return "bg-gray-500/20 text-gray-300";
  }
}

export default function RecentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        title,
        message,
        type,
        is_read,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error) {
      setNotifications((data ?? []) as Notification[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          void loadNotifications();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadNotifications]);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#1E293B] shadow-xl">
      <div className="border-b border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white">
          Recent Notifications
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Latest activity in your store
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-10 text-center text-gray-400">
          No notifications yet.
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-4 p-5 transition hover:bg-white/[0.03]"
            >
              <div className="rounded-xl bg-red-600/20 p-3">
                <Bell className="text-red-400" size={18} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">
                    {notification.title}
                  </h3>

                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${badgeColor(
                      notification.type
                    )}`}
                  >
                    {notification.type ?? "General"}
                  </span>

                  {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-400">
                  {notification.message}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {formatTime(notification.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}