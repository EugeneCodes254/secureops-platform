"use client";

import { useEffect, useRef, useState } from "react";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "ALERT" | "SUCCESS";
  read: boolean;
  createdAt: string;
};

const API_URL = "http://localhost:5000";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const loadNotifications = async () => {
    try {
      const token = getToken();

      if (!token) return;

      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Notification load error:", error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const token = getToken();

      if (!token) return;

      const response = await fetch(
        `${API_URL}/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data.success) {
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error("Unread notification error:", error);
    }
  };

  const refreshNotifications = async () => {
    await Promise.all([
      loadNotifications(),
      loadUnreadCount(),
    ]);
  };

  useEffect(() => {
    refreshNotifications();

    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const token = getToken();

      if (!token) return;

      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error("Mark notification read error:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) return;

      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all notifications read error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const value = new Date(date);

    return value.toLocaleString("en-KE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const typeStyle = (type: Notification["type"]) => {
    switch (type) {
      case "ALERT":
        return {
          dot: "bg-red-500",
          text: "text-red-400",
          label: "ALERT",
        };

      case "WARNING":
        return {
          dot: "bg-orange-500",
          text: "text-orange-400",
          label: "WARNING",
        };

      case "SUCCESS":
        return {
          dot: "bg-green-500",
          text: "text-green-400",
          label: "SUCCESS",
        };

      default:
        return {
          dot: "bg-blue-500",
          text: "text-blue-400",
          label: "INFO",
        };
    }
  };

  return (
    <div
      ref={panelRef}
      className="relative"
    >
      <button
        onClick={() => {
          setOpen((current) => !current);

          if (!open) {
            loadNotifications();
            loadUnreadCount();
          }
        }}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
      >
        <span className="text-lg">♢</span>

        {unreadCount > 0 && (
          <>
            <span className="absolute right-1 top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />

            <span className="absolute -right-2 -top-2 flex min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-red-900/40">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-xl border border-slate-700 bg-[#0b1120] shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Notifications
              </h3>

              <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                Security Operations Center
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs text-red-400 transition hover:text-red-300 disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                  ✓
                </div>

                <p className="text-sm text-slate-300">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Security alerts will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const style = typeStyle(notification.type);

                return (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                    className={`block w-full border-b border-slate-800/70 px-4 py-4 text-left transition hover:bg-slate-900 ${
                      notification.read
                        ? "opacity-60"
                        : "bg-slate-900/40"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>

                          {!notification.read && (
                            <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-red-400">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {notification.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`text-[9px] font-semibold uppercase tracking-wider ${style.text}`}
                          >
                            {style.label}
                          </span>

                          <span className="text-[10px] text-slate-600">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-800 bg-slate-950/50 px-4 py-3">
            <button
              onClick={refreshNotifications}
              className="w-full text-center text-[10px] uppercase tracking-wider text-slate-500 transition hover:text-slate-300"
            >
              Refresh notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
