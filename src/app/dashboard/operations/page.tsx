"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

type Incident = {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  createdAt: string;
};

type Personnel = {
  id: number;
  fullName: string;
  role: string;
  phone: string;
  site: string;
  status: "ACTIVE" | "OFF_DUTY" | "SUSPENDED";
};

type Site = {
  id: number;
  name: string;
  location: string;
  client: string;
  contact?: string | null;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OperationsPage() {
  const router = useRouter();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadOperations = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [incidentsRes, personnelRes, sitesRes] =
        await Promise.all([
          fetch(`${API_URL}/incidents`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/personnel`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/sites`, {
            headers,
            cache: "no-store",
          }),
        ]);

      if (
        !incidentsRes.ok ||
        !personnelRes.ok ||
        !sitesRes.ok
      ) {
        throw new Error("Failed to load operations data");
      }

      const incidentsData = await incidentsRes.json();
      const personnelData = await personnelRes.json();
      const sitesData = await sitesRes.json();

      if (
        !incidentsData.success ||
        !personnelData.success ||
        !sitesData.success
      ) {
        throw new Error("Invalid operations response");
      }

      setIncidents(incidentsData.incidents || []);
      setPersonnel(personnelData.personnel || []);
      setSites(sitesData.sites || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Operations error:", err);
      setError(
        "Unable to connect to the SecureOps backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperations();

    const interval = setInterval(
      loadOperations,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    return {
      incidents: incidents.length,
      open: incidents.filter(
        (i) => i.status === "OPEN"
      ).length,
      critical: incidents.filter(
        (i) => i.severity === "CRITICAL"
      ).length,
      activePersonnel: personnel.filter(
        (p) => p.status === "ACTIVE"
      ).length,
      activeSites: sites.filter(
        (s) => s.status === "ACTIVE"
      ).length,
    };
  }, [incidents, personnel, sites]);

  const recentIncidents = useMemo(() => {
    return [...incidents]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [incidents]);

  const severityClass = (severity: Severity) => {
    switch (severity) {
      case "CRITICAL":
        return "border-red-500/30 bg-red-500/10 text-red-400";
      case "HIGH":
        return "border-orange-500/30 bg-orange-500/10 text-orange-400";
      case "MEDIUM":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
      default:
        return "border-green-500/30 bg-green-500/10 text-green-400";
    }
  };

  const statusClass = (status: Status) => {
    switch (status) {
      case "OPEN":
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";
      case "IN_PROGRESS":
        return "border-blue-500/30 bg-blue-500/10 text-blue-400";
      case "RESOLVED":
        return "border-green-500/30 bg-green-500/10 text-green-400";
      default:
        return "border-slate-700 bg-slate-800 text-slate-400";
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-KE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen">

        <aside className="hidden w-64 border-r border-slate-800 bg-[#030712] lg:flex lg:flex-col">
          <div className="border-b border-slate-800 p-6">
            <div className="text-xl font-bold">
              Secure<span className="text-red-500">Ops</span>
            </div>

            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Privamax Security
            </p>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            <button
              onClick={() => router.push("/dashboard/operations")}
              className="w-full rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-left text-sm font-medium text-red-400"
            >
              ◉ <span className="ml-2">Operations</span>
            </button>

            <button
              onClick={() => router.push("/dashboard/incidents")}
              className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              ▣ <span className="ml-2">Incident Management</span>
            </button>

            <button
              onClick={() => router.push("/dashboard/personnel")}
              className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              ◈ <span className="ml-2">Personnel</span>
            </button>

            <button
              onClick={() => router.push("/dashboard/sites")}
              className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              ⌂ <span className="ml-2">Sites</span>
            </button>

            <button
              onClick={() => router.push("/dashboard/reports")}
              className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              ▤ <span className="ml-2">Reports</span>
            </button>

            <button
              onClick={() => router.push("/dashboard/notifications")}
              className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              ◌ <span className="ml-2">Notifications</span>
            </button>
          </nav>

          <div className="m-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-xs font-medium text-green-400">
                SYSTEM OPERATIONAL
              </span>
            </div>

            <p className="mt-3 text-[11px] leading-5 text-slate-500">
              SecureOps monitoring services are operational.
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-800 bg-[#020617]/95 px-6 py-4 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-red-400">
                  Privamax Security Firm Ltd
                </p>

                <h1 className="mt-1 text-lg font-semibold">
                  Security Operations Center
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <NotificationBell />

                <button
                  onClick={logout}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-red-500/50 hover:text-red-400"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="text-xs font-medium uppercase tracking-widest text-red-400">
                    Live Operations
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  Operations Overview
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Real-time visibility across security incidents,
                  personnel and protected sites.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <span className="hidden text-xs text-slate-500 md:block">
                    Updated{" "}
                    {lastUpdated.toLocaleTimeString("en-KE")}
                  </span>
                )}

                <button
                  onClick={loadOperations}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-slate-300 hover:border-slate-500 hover:text-white"
                >
                  ↻ Refresh
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ["Incidents", stats.incidents, "Total recorded events"],
                ["Open", stats.open, "Require attention"],
                ["Critical", stats.critical, "Critical severity"],
                ["Personnel", stats.activePersonnel, "Currently active"],
                ["Sites", stats.activeSites, "Active protected sites"],
              ].map(([label, value, description]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
                >
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {label}
                  </p>

                  <p className="mt-3 text-3xl font-bold">
                    {loading ? "—" : value}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60">
                <div className="flex items-center justify-between border-b border-slate-800 p-5">
                  <div>
                    <h3 className="font-semibold">
                      Recent Incidents
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Latest security events
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      router.push("/dashboard/incidents")
                    }
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    View all →
                  </button>
                </div>

                <div className="divide-y divide-slate-800">
                  {loading ? (
                    <div className="p-6 text-sm text-slate-500">
                      Loading incidents...
                    </div>
                  ) : recentIncidents.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">
                      No incidents recorded.
                    </div>
                  ) : (
                    recentIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {incident.title}
                          </p>

                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                            {incident.description}
                          </p>

                          <p className="mt-2 text-[11px] text-slate-600">
                            {formatDate(incident.createdAt)}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${severityClass(
                              incident.severity
                            )}`}
                          >
                            {incident.severity}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusClass(
                              incident.status
                            )}`}
                          >
                            {incident.status.replace(
                              "_",
                              " "
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60">
                <div className="border-b border-slate-800 p-5">
                  <h3 className="font-semibold">
                    Operational Status
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Current field status
                  </p>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-4">
                    <div>
                      <p className="text-sm">Personnel</p>
                      <p className="text-xs text-slate-500">
                        Active security personnel
                      </p>
                    </div>

                    <span className="text-lg font-bold text-green-400">
                      {loading ? "—" : stats.activePersonnel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-4">
                    <div>
                      <p className="text-sm">Protected Sites</p>
                      <p className="text-xs text-slate-500">
                        Active client locations
                      </p>
                    </div>

                    <span className="text-lg font-bold text-cyan-400">
                      {loading ? "—" : stats.activeSites}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-4">
                    <div>
                      <p className="text-sm">Critical Alerts</p>
                      <p className="text-xs text-slate-500">
                        Incidents requiring escalation
                      </p>
                    </div>

                    <span className="text-lg font-bold text-red-400">
                      {loading ? "—" : stats.critical}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
