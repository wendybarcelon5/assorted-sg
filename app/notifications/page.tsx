"use client";

import { supabase } from "@/lib/supabase";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications(data ?? []);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    loadNotifications();
  }

  async function markAllAsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);

    loadNotifications();
  }

  async function deleteNotification(id: string) {
    await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    loadNotifications();
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading notifications...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto max-w-3xl">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Bell className="text-red-500" />
            Notifications
          </h1>

          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="rounded-lg bg-red-600 px-4 py-2 font-bold hover:bg-red-500"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="mt-8 space-y-4">

          {notifications.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-[#111827] p-8 text-center text-gray-400">
              No notifications yet.
            </div>
          )}

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-5 ${
                notification.is_read
                  ? "border-white/10 bg-[#111827]"
                  : "border-red-500 bg-red-500/10"
              }`}
            >
              <div className="flex items-start justify-between">

                <div>
                  <h2 className="font-black text-lg">
                    {notification.title}
                  </h2>

                  <p className="mt-2 text-gray-300">
                    {notification.message}
                  </p>

                  <p className="mt-3 text-xs text-gray-500">
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">

                  {!notification.is_read && (
                    <button
                      onClick={() =>
                        markAsRead(notification.id)
                      }
                    >
                      <CheckCheck
                        size={20}
                        className="text-green-400"
                      />
                    </button>
                  )}

                  <button
                    onClick={() =>
                      deleteNotification(notification.id)
                    }
                  >
                    <Trash2
                      size={20}
                      className="text-red-400"
                    />
                  </button>

                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}