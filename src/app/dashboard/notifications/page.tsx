"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ALERT";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
};

const API_URL = "http://localhost:5000";

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const loadNotifications = useCallback(async () => {
    const token = getToken();

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/auth/login");
        return;
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Unable to load notifications."
        );
      }

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("NOTIFICATIONS LOAD ERROR:", error);
      setError("Unable to load notifications from SecureOps.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter((notification) => !notification.read);
    }

    return notifications;
  }, [notifications, filter]);

  const markAsRead = async (id: number) => {
    const token = getToken();

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      const response = await fetch(
        `${API_URL}/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/auth/login");
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setError(
          data.message || "Unable to mark notification as read."
        );
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("MARK READ ERROR:", error);
      setError("Unable to mark notification as read.");
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    const token = getToken();

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    if (unreadCount === 0) return;

    try {
      setMarkingAll(true);
      setError("");

      const response = await fetch(
        `${API_URL}/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/auth/login");
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setError(
          data.message || "Unable to mark notifications as read."
        );
        return;
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error("MARK ALL READ ERROR:", error);
      setError("Unable to mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id: number) => {
    const token = getToken();

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);
      setError("");

      const response = await fetch(
        `${API_URL}/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/auth/login");
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setError(
          data.message || "Unable to delete notification."
        );
        return;
      }

      setNotifications((current) =>
        current.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error("DELETE NOTIFICATION ERROR:", error);
      setError("Unable to delete notification.");
    } finally {
      setActionLoading(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  const typeClasses = (type: NotificationType) => {
    switch (type) {
      case "ALERT":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "WARNING":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      case "SUCCESS":
        return "border-green-500/30 bg-green-500/10 text-green-400";

      default:
        return "border-blue-500/30 bg-blue-500/10 text-blue-400";
    }
  };

  const typeLabel = (type: NotificationType) => {
    switch (type) {
      case "ALERT":
        return "Alert";
      case "WARNING":
        return "Warning";
      case "SUCCESS":
        return "Success";
      default:
        return "Information";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-[#020617]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                Secure<span className="text-red-500">Ops</span>
              </div>

              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-400">
                PRIVAMAX
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              Privamax Security Firm Limited
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            Logout
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* NAVIGATION */}
        <nav className="mb-8 flex flex-wrap gap-2">

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Overview
          </button>

          <button
            onClick={() => router.push("/dashboard/incidents")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Incidents
          </button>

          <button
            onClick={() => router.push("/dashboard/personnel")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Personnel
          </button>

          <button
            onClick={() => router.push("/dashboard/sites")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Sites
          </button>

          <button
            onClick={() => router.push("/dashboard/reports")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Reports
          </button>

          <button
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium"
          >
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-red-600">
                {unreadCount}
              </span>
            )}
          </button>

        </nav>

        {/* TITLE */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
              Security Operations Center
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Security alerts, operational updates and system activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() => loadNotifications()}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Refresh
            </button>

            <button
              onClick={markAllAsRead}
              disabled={markingAll || unreadCount === 0}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>

          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">
              Total Notifications
            </p>

            <p className="mt-3 text-4xl font-bold">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-sm text-slate-400">
              Unread
            </p>

            <p className="mt-3 text-4xl font-bold text-red-400">
              {unreadCount}
            </p>
          </div>

          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
            <p className="text-sm text-slate-400">
              Read
            </p>

            <p className="mt-3 text-4xl font-bold text-green-400">
              {notifications.length - unreadCount}
            </p>
          </div>

        </section>

        {/* FILTERS */}
        <div className="mb-5 flex gap-2">

          <button
            onClick={() => setFilter("ALL")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === "ALL"
                ? "bg-red-600 text-white"
                : "border border-slate-700 text-slate-400 hover:bg-slate-800"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("UNREAD")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === "UNREAD"
                ? "bg-red-600 text-white"
                : "border border-slate-700 text-slate-400 hover:bg-slate-800"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-xs">
                {unreadCount}
              </span>
            )}
          </button>

        </div>

        {/* NOTIFICATIONS */}
        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-10 text-center text-slate-400">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
              🔔
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              {filter === "UNREAD"
                ? "No unread notifications"
                : "No notifications yet"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New security and operational events will appear here.
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {filteredNotifications.map((notification) => (

              <article
                key={notification.id}
                className={`rounded-xl border bg-slate-900/70 p-5 transition ${
                  notification.read
                    ? "border-slate-800"
                    : "border-red-500/30 shadow-lg shadow-red-950/10"
                }`}
              >

                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                  <div className="flex gap-4">

                    <div
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm ${typeClasses(
                        notification.type
                      )}`}
                    >
                      {notification.type === "ALERT"
                        ? "!"
                        : notification.type === "WARNING"
                        ? "⚠"
                        : notification.type === "SUCCESS"
                        ? "✓"
                        : "i"}
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h2
                          className={`font-semibold ${
                            notification.read
                              ? "text-slate-200"
                              : "text-white"
                          }`}
                        >
                          {notification.title}
                        </h2>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${typeClasses(
                            notification.type
                          )}`}
                        >
                          {typeLabel(notification.type)}
                        </span>

                        {!notification.read && (
                          <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                            NEW
                          </span>
                        )}

                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-xs text-slate-600">
                        {formatDate(notification.createdAt)}
                      </p>

                    </div>

                  </div>

                  <div className="flex shrink-0 gap-2">

                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        disabled={actionLoading === notification.id}
                        className="rounded-lg border border-green-500/30 px-3 py-2 text-xs font-medium text-green-400 transition hover:bg-green-500/10 disabled:opacity-40"
                      >
                        Mark read
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteNotification(notification.id)
                      }
                      disabled={actionLoading === notification.id}
                      className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>
        )}

      </div>
    </main>
  );
}
