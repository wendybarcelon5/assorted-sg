"use client";

import {
  Bell,
  CheckCheck,
  Search,
  Trash2,
  UserCircle2,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

function formatNotificationTime(date: string) {
  const createdTime = new Date(date).getTime();
  const currentTime = Date.now();

  const difference = currentTime - createdTime;
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${
    days === 1 ? "" : "s"
  } ago`;
}

export default function Header() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [loadingNotifications, setLoadingNotifications] =
    useState(true);

  const [updatingNotifications, setUpdatingNotifications] =
    useState(false);

  const [deletingNotificationId, setDeletingNotificationId] =
    useState<number | null>(null);

  const notificationRef =
    useRef<HTMLDivElement | null>(null);

  const unreadNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.is_read
      ).length,
    [notifications]
  );

  const loadNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(20);

      if (error) {
        throw error;
      }

      setNotifications(
        (data ?? []) as Notification[]
      );
    } catch (error) {
      console.error(
        "Unable to load notifications:",
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        setNotificationOpen(false);
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

  async function markNotificationAsRead(
    notification: Notification
  ) {
    if (notification.is_read) {
      return;
    }

    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq("id", notification.id);

      if (error) {
        throw error;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Unable to mark notification as read:",
        error
      );
    }
  }

  async function markAllAsRead() {
    if (unreadNotifications === 0) {
      return;
    }

    try {
      setUpdatingNotifications(true);

      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq("is_read", false);

      if (error) {
        throw error;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map(
          (notification) => ({
            ...notification,
            is_read: true,
          })
        )
      );
    } catch (error) {
      console.error(
        "Unable to mark all notifications as read:",
        error
      );
    } finally {
      setUpdatingNotifications(false);
    }
  }

  async function deleteNotification(
    notification: Notification
  ) {
    const confirmed = window.confirm(
      `Delete "${notification.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingNotificationId(
        notification.id
      );

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notification.id);

      if (error) {
        throw error;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (item) =>
            item.id !== notification.id
        )
      );
    } catch (error) {
      console.error(
        "Unable to delete notification:",
        error
      );

      window.alert(
        "Unable to delete this notification."
      );
    } finally {
      setDeletingNotificationId(null);
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[#111827] px-6 py-5 text-white">
      <div>
        <h1 className="text-3xl font-black text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Welcome back, Assorted SG 👋
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden items-center rounded-xl border border-white/10 bg-[#1E293B] px-4 py-3 md:flex">
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

        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            type="button"
            aria-label="Open notifications"
            aria-expanded={notificationOpen}
            onClick={() =>
              setNotificationOpen(
                (current) => !current
              )
            }
            className="relative rounded-xl bg-[#1E293B] p-3 transition hover:bg-red-600"
          >
            <Bell size={20} />

            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadNotifications > 99
                  ? "99+"
                  : unreadNotifications}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-14 z-50 w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h2 className="font-black text-white">
                    Notifications
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {unreadNotifications > 0
                      ? `${unreadNotifications} unread`
                      : "You’re all caught up"}
                  </p>
                </div>

                {unreadNotifications > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      void markAllAsRead()
                    }
                    disabled={
                      updatingNotifications
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 transition hover:text-yellow-300 disabled:opacity-50"
                  >
                    <CheckCheck size={15} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {loadingNotifications ? (
                  <div className="px-5 py-12 text-center text-sm text-gray-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-gray-500">
                      <Bell size={24} />
                    </div>

                    <p className="mt-4 font-bold text-white">
                      No notifications
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      You’re all caught up.
                    </p>
                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 border-b border-white/5 px-5 py-4 transition hover:bg-white/5 ${
                          notification.is_read
                            ? "bg-transparent"
                            : "bg-red-500/5"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            void markNotificationAsRead(
                              notification
                            )
                          }
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                                notification.is_read
                                  ? "bg-gray-700"
                                  : "bg-red-500"
                              }`}
                            />

                            <div className="min-w-0">
                              <p className="font-bold text-white">
                                {
                                  notification.title
                                }
                              </p>

                              <p className="mt-1 text-sm leading-6 text-gray-400">
                                {
                                  notification.message
                                }
                              </p>

                              <p className="mt-2 text-xs text-gray-600">
                                {formatNotificationTime(
                                  notification.created_at
                                )}
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          aria-label={`Delete ${notification.title}`}
                          title="Delete notification"
                          disabled={
                            deletingNotificationId ===
                            notification.id
                          }
                          onClick={() =>
                            void deleteNotification(
                              notification
                            )
                          }
                          className="mt-1 shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </div>

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