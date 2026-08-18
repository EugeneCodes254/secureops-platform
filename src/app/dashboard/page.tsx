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

type User = {
  id: number;
  email: string;
  role?: string;
};

type PersonnelStatus = "ACTIVE" | "OFF_DUTY" | "SUSPENDED";

type Personnel = {
  id: number;
  fullName: string;
  role: string;
  phone: string;
  site: string;
  status: PersonnelStatus;
  createdAt: string;
};

type SiteStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

type Site = {
  id: number;
  name: string;
  location: string;
  client: string;
  contact: string | null;
  status: SiteStatus;
  createdAt: string;
};

const API_URL = "http://localhost:5000";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [incidentsResponse, personnelResponse, sitesResponse] =
        await Promise.all([
          fetch(`${API_URL}/incidents`, {
            cache: "no-store",
            headers,
          }),
          fetch(`${API_URL}/personnel`, {
            cache: "no-store",
            headers,
          }),
          fetch(`${API_URL}/sites`, {
            cache: "no-store",
            headers,
          }),
        ]);

      if (
        !incidentsResponse.ok ||
        !personnelResponse.ok ||
        !sitesResponse.ok
      ) {
        throw new Error("Failed to load dashboard data");
      }

      const incidentsData = await incidentsResponse.json();
      const personnelData = await personnelResponse.json();
      const sitesData = await sitesResponse.json();

      if (
        !incidentsData.success ||
        !personnelData.success ||
        !sitesData.success
      ) {
        throw new Error("Unable to load dashboard data");
      }

      setIncidents(incidentsData.incidents || []);
      setPersonnel(personnelData.personnel || []);
      setSites(sitesData.sites || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Unable to connect to the SecureOps backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);

  const stats = useMemo(() => {
    return {
      total: incidents.length,

      open: incidents.filter(
        (incident) => incident.status === "OPEN"
      ).length,

      inProgress: incidents.filter(
        (incident) => incident.status === "IN_PROGRESS"
      ).length,

      resolved: incidents.filter(
        (incident) => incident.status === "RESOLVED"
      ).length,

      critical: incidents.filter(
        (incident) => incident.severity === "CRITICAL"
      ).length,

      high: incidents.filter(
        (incident) => incident.severity === "HIGH"
      ).length,

      medium: incidents.filter(
        (incident) => incident.severity === "MEDIUM"
      ).length,

      low: incidents.filter(
        (incident) => incident.severity === "LOW"
      ).length,
    };
  }, [incidents]);

  const recentIncidents = useMemo(() => {
    return [...incidents]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [incidents]);

  const severityPercentage = (count: number) => {
    if (stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-KE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const severityStyle = (severity: Severity) => {
    switch (severity) {
      case "CRITICAL":
        return "border-red-500/30 bg-red-500/10 text-red-400";
      case "HIGH":
        return "border-orange-500/30 bg-orange-500/10 text-orange-400";
      case "MEDIUM":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
      case "LOW":
        return "border-green-500/30 bg-green-500/10 text-green-400";
    }
  };

  const statusStyle = (status: Status) => {
    switch (status) {
      case "OPEN":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "RESOLVED":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "CLOSED":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* SIDEBAR + CONTENT */}
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-64 border-r border-slate-800 
bg-[#030712] lg:flex lg:flex-col">

          {/* LOGO */}
          <div className="border-b border-slate-800 p-6">
            <div className="text-xl font-bold tracking-tight">
              Secure<span className="text-red-500">Ops</span>
            </div>

            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] 
text-slate-500">
              Privamax Security
            </p>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 space-y-2 p-4">

            <div className="rounded-lg border border-red-500/20 
bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
              <span className="mr-3">◉</span>
              Operations
            </div>

            <button
              onClick={() => router.push("/dashboard/incidents")}
              className="w-full rounded-lg px-4 py-3 text-left text-sm 
text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              <span className="mr-3">▣</span>
              Incident Management
            </button>

            <button
              className="w-full rounded-lg px-4 py-3 text-left text-sm 
text-slate-500"
            >
              <span className="mr-3">◈</span>
              Threat Monitoring
              <span className="float-right text-[9px] uppercase 
text-slate-600">
                Soon
              </span>
            </button>

            <button
              className="w-full rounded-lg px-4 py-3 text-left text-sm 
text-slate-500"
            >
              <span className="mr-3">⌁</span>
              Activity Logs
              <span className="float-right text-[9px] uppercase 
text-slate-600">
                Soon
              </span>
            </button>

            <button
              className="w-full rounded-lg px-4 py-3 text-left text-sm 
text-slate-500"
            >
              <span className="mr-3">⚙</span>
              Settings
              <span className="float-right text-[9px] uppercase 
text-slate-600">
                Soon
              </span>
            </button>

          </nav>

          {/* SYSTEM STATUS */}
          <div className="m-4 rounded-xl border border-slate-800 
bg-slate-900/50 p-4">

            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 
shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
              <span className="text-xs font-medium text-green-400">
                SYSTEM OPERATIONAL
              </span>
            </div>

            <p className="text-[11px] leading-5 text-slate-500">
              SecureOps monitoring services are currently operational.
            </p>

          </div>

        </aside>

        {/* MAIN */}
        <section className="flex-1">

          {/* TOP BAR */}
          <header className="border-b border-slate-800 bg-[#020617]/95 
px-6 py-4 backdrop-blur">

            <div className="mx-auto flex max-w-7xl items-center 
justify-between">

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] 
text-red-400">
                  Privamax Security Firm Ltd
                </p>

                <h1 className="mt-1 text-lg font-semibold">
                  Security Operations Center
                </h1>
              </div>

              <div className="flex items-center gap-3">

                <NotificationBell />

                <div className="hidden text-right sm:block">
                  <p className="text-xs text-white">
                    {user?.email || "System Operator"}
                  </p>

                  <p className="text-[10px] text-green-400">
                    ● Online
                  </p>
                </div>

                <button
                  onClick={logout}
                  className="rounded-lg border border-slate-700 px-3 py-2 
text-xs text-slate-300 transition hover:border-red-500/50 
hover:text-red-400"
                >
                  Logout
                </button>

              </div>

            </div>

          </header>

          {/* CONTENT */}
          <div className="mx-auto max-w-7xl px-6 py-8">

            {/* PAGE INTRO */}
            <div className="mb-8 flex flex-col justify-between gap-4 
md:flex-row md:items-end">

              <div>

                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 
animate-pulse" />

                  <span className="text-xs font-medium uppercase 
tracking-widest text-red-400">
                    Live Operations
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  Operations Overview
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Real-time visibility into security incidents and
                  operational threats across Privamax.
                </p>

              </div>

              <div className="flex items-center gap-3">

                {lastUpdated && (
                  <span className="hidden text-xs text-slate-500 
md:block">
                    Updated{" "}
                    {lastUpdated.toLocaleTimeString("en-KE", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                )}

                <button
                  onClick={loadDashboard}
                  className="rounded-lg border border-slate-700 
bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 transition 
hover:border-slate-500 hover:text-white"
                >
                  ↻ Refresh
                </button>

              </div>

            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 
bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 
xl:grid-cols-4">

              {/* TOTAL */}
              <div className="rounded-xl border border-slate-800 
bg-slate-900/60 p-5 transition hover:border-slate-700">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-wider 
text-slate-500">
                      Total Incidents
                    </p>

                    <p className="mt-3 text-3xl font-bold">
                      {loading ? "—" : stats.total}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800 px-3 py-2 
text-lg">
                    ◉
                  </div>

                </div>

                <p className="mt-3 text-xs text-slate-500">
                  All recorded security events
                </p>

              </div>

              {/* OPEN */}
              <div className="rounded-xl border border-cyan-500/20 
bg-slate-900/60 p-5 transition hover:border-cyan-500/30">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-wider 
text-slate-500">
                      Open Incidents
                    </p>

                    <p className="mt-3 text-3xl font-bold text-cyan-400">
                      {loading ? "—" : stats.open}
                    </p>
                  </div>

                  <div className="rounded-lg bg-cyan-500/10 px-3 py-2 
text-lg text-cyan-400">
                    !
                  </div>

                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Requiring investigation
                </p>

              </div>

              {/* CRITICAL */}
              <div className="rounded-xl border border-red-500/20 
bg-slate-900/60 p-5 transition hover:border-red-500/30">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-wider 
text-slate-500">
                      Critical Threats
                    </p>

                    <p className="mt-3 text-3xl font-bold text-red-500">
                      {loading ? "—" : stats.critical}
                    </p>
                  </div>

                  <div className="rounded-lg bg-red-500/10 px-3 py-2 
text-lg text-red-400">
                    ⚠
                  </div>

                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Highest priority events
                </p>

              </div>

              {/* ACTIVE PERSONNEL */}
              <div className="rounded-xl border border-blue-500/20
bg-slate-900/60 p-5 transition hover:border-blue-500/30">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-wider
text-slate-500">
                      Active Personnel
                    </p>

                    <p className="mt-3 text-3xl font-bold text-blue-400">
                      {loading
                        ? "—"
                        : personnel.filter(
                            (person) => person.status === "ACTIVE"
                          ).length}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-500/10 px-3 py-2
text-lg text-blue-400">
                    👤
                  </div>

                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Security personnel currently active
                </p>

              </div>

              {/* ACTIVE SITES */}
              <div className="rounded-xl border border-purple-500/20
bg-slate-900/60 p-5 transition hover:border-purple-500/30">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-wider
text-slate-500">
                      Active Sites
                    </p>

                    <p className="mt-3 text-3xl font-bold text-purple-400">
                      {loading
                        ? "—"
                        : sites.filter(
                            (site) => site.status === "ACTIVE"
                          ).length}
                    </p>
                  </div>

                  <div className="rounded-lg bg-purple-500/10 px-3 py-2
text-lg text-purple-400">
                    ◈
                  </div>

                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Security sites currently operational
                </p>

              </div>

              {/* RESOLVED */}
              <div className="rounded-xl border border-green-500/20 
bg-slate-900/60 p-5 transition hover:border-green-500/30">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-wider 
text-slate-500">
                      Resolved
                    </p>

                    <p className="mt-3 text-3xl font-bold text-green-400">
                      {loading ? "—" : stats.resolved}
                    </p>
                  </div>

                  <div className="rounded-lg bg-green-500/10 px-3 py-2 
text-lg text-green-400">
                    ✓
                  </div>

                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Successfully contained
                </p>

              </div>

            </div>

            {/* SECOND ROW */}
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

              {/* THREAT DISTRIBUTION */}
              <div className="rounded-xl border border-slate-800 
bg-slate-900/60 p-6">

                <div className="mb-6">
                  <h3 className="font-semibold">
                    Threat Distribution
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Incidents grouped by severity
                  </p>
                </div>

                <div className="space-y-5">

                  {/* CRITICAL */}
                  <div>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-red-400">
                        Critical
                      </span>

                      <span className="text-slate-400">
                        {stats.critical}{" "}
                        <span className="text-slate-600">
                          ({severityPercentage(stats.critical)}%)
                        </span>
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full 
bg-slate-800">
                      <div
                        className="h-full rounded-full bg-red-500 
transition-all"
                        style={{
                          width: `${severityPercentage(
                            stats.critical
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* HIGH */}
                  <div>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-orange-400">
                        High
                      </span>

                      <span className="text-slate-400">
                        {stats.high}{" "}
                        <span className="text-slate-600">
                          ({severityPercentage(stats.high)}%)
                        </span>
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full 
bg-slate-800">
                      <div
                        className="h-full rounded-full bg-orange-500 
transition-all"
                        style={{
                          width: `${severityPercentage(
                            stats.high
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* MEDIUM */}
                  <div>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-yellow-400">
                        Medium
                      </span>

                      <span className="text-slate-400">
                        {stats.medium}{" "}
                        <span className="text-slate-600">
                          ({severityPercentage(stats.medium)}%)
                        </span>
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full 
bg-slate-800">
                      <div
                        className="h-full rounded-full bg-yellow-500 
transition-all"
                        style={{
                          width: `${severityPercentage(
                            stats.medium
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* LOW */}
                  <div>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-green-400">
                        Low
                      </span>

                      <span className="text-slate-400">
                        {stats.low}{" "}
                        <span className="text-slate-600">
                          ({severityPercentage(stats.low)}%)
                        </span>
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full 
bg-slate-800">
                      <div
                        className="h-full rounded-full bg-green-500 
transition-all"
                        style={{
                          width: `${severityPercentage(
                            stats.low
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* OPERATIONS STATUS */}
              <div className="rounded-xl border border-slate-800 
bg-slate-900/60 p-6">

                <div className="mb-6">
                  <h3 className="font-semibold">
                    Operations Status
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Current incident workflow
                  </p>
                </div>

                <div className="space-y-3">

                  <div className="flex items-center justify-between 
rounded-lg border border-cyan-500/10 bg-cyan-500/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-cyan-400" 
/>
                      <span className="text-sm">
                        Open
                      </span>
                    </div>

                    <span className="font-semibold text-cyan-400">
                      {stats.open}
                    </span>
                  </div>

                  <div className="flex items-center justify-between 
rounded-lg border border-blue-500/10 bg-blue-500/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-blue-400" 
/>
                      <span className="text-sm">
                        In Progress
                      </span>
                    </div>

                    <span className="font-semibold text-blue-400">
                      {stats.inProgress}
                    </span>
                  </div>

                  <div className="flex items-center justify-between 
rounded-lg border border-green-500/10 bg-green-500/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-green-400" 
/>
                      <span className="text-sm">
                        Resolved
                      </span>
                    </div>

                    <span className="font-semibold text-green-400">
                      {stats.resolved}
                    </span>
                  </div>

                  <div className="flex items-center justify-between 
rounded-lg border border-slate-700 bg-slate-800/30 p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-slate-500" 
/>
                      <span className="text-sm">
                        Closed
                      </span>
                    </div>

                    <span className="font-semibold text-slate-400">
                      {incidents.filter(
                        (i) => i.status === "CLOSED"
                      ).length}
                    </span>
                  </div>

                </div>

              </div>

              {/* SYSTEM HEALTH */}
              <div className="rounded-xl border border-slate-800 
bg-slate-900/60 p-6">

                <div className="mb-6">
                  <h3 className="font-semibold">
                    Security Infrastructure
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Platform service health
                  </p>
                </div>

                <div className="space-y-4">

                  <div className="flex items-center justify-between 
border-b border-slate-800 pb-4">
                    <div>
                      <p className="text-sm">
                        API Gateway
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Express backend
                      </p>
                    </div>

                    <span className="rounded-full border 
border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] text-green-400">
                      OPERATIONAL
                    </span>
                  </div>

                  <div className="flex items-center justify-between 
border-b border-slate-800 pb-4">
                    <div>
                      <p className="text-sm">
                        Database
                      </p>
                      <p className="text-[10px] text-slate-500">
                        PostgreSQL / Prisma
                      </p>
                    </div>

                    <span className="rounded-full border 
border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] text-green-400">
                      OPERATIONAL
                    </span>
                  </div>

                  <div className="flex items-center justify-between 
border-b border-slate-800 pb-4">
                    <div>
                      <p className="text-sm">
                        Authentication
                      </p>
                      <p className="text-[10px] text-slate-500">
                        JWT security
                      </p>
                    </div>

                    <span className="rounded-full border 
border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] text-green-400">
                      OPERATIONAL
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">
                        Incident Engine
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Real-time CRUD API
                      </p>
                    </div>

                    <span className="rounded-full border 
border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] text-green-400">
                      OPERATIONAL
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* RECENT INCIDENTS */}
            <section className="mt-6 rounded-xl border border-slate-800 
bg-slate-900/60">

              <div className="flex items-center justify-between border-b 
border-slate-800 p-6">

                <div>
                  <h3 className="font-semibold">
                    Recent Security Incidents
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest events recorded by SecureOps
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push("/dashboard/incidents")
                  }
                  className="text-xs font-medium text-red-400 transition 
hover:text-red-300"
                >
                  View all →
                </button>

              </div>

              <div className="divide-y divide-slate-800">

                {loading ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Loading security events...
                  </div>
                ) : recentIncidents.length === 0 ? (
                  <div className="p-10 text-center">

                    <div className="mx-auto mb-3 flex h-12 w-12 
items-center justify-center rounded-full bg-slate-800 text-xl 
text-slate-500">
                      ✓
                    </div>

                    <p className="text-sm font-medium text-slate-300">
                      No security incidents
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      The environment is currently clear.
                    </p>

                  </div>
                ) : (
                  recentIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="flex flex-col gap-4 p-5 transition 
hover:bg-slate-800/30 md:flex-row md:items-center md:justify-between"
                    >

                      <div className="min-w-0">

                        <div className="mb-2 flex flex-wrap items-center 
gap-2">

                          <span className="font-mono text-[10px] 
text-slate-600">
                            INC-{String(incident.id).padStart(4, "0")}
                          </span>

                          <span
                            className={`rounded-full border px-2 py-0.5 
text-[9px] font-semibold uppercase ${severityStyle(
                              incident.severity
                            )}`}
                          >
                            {incident.severity}
                          </span>

                          <span
                            className={`rounded-full border px-2 py-0.5 
text-[9px] font-semibold uppercase ${statusStyle(
                              incident.status
                            )}`}
                          >
                            {incident.status.replace("_", " ")}
                          </span>

                        </div>

                        <h4 className="truncate text-sm font-semibold 
text-white">
                          {incident.title}
                        </h4>

                        <p className="mt-1 line-clamp-1 text-xs 
text-slate-500">
                          {incident.description}
                        </p>

                      </div>

                      <div className="shrink-0 text-left md:text-right">

                        <p className="text-[10px] uppercase tracking-wider 
text-slate-600">
                          Reported
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(incident.createdAt)}
                        </p>

                      </div>

                    </div>
                  ))
                )}

              </div>

            </section>

            {/* FOOTER */}
            <footer className="mt-8 border-t border-slate-800 pt-6 
text-center">

              <p className="text-[10px] uppercase tracking-[0.2em] 
text-slate-600">
                PRIVAMAX SECURITY FIRM LTD • SECUREOPS PLATFORM
              </p>

              <p className="mt-2 text-[10px] text-slate-700">
                Security operations management system
              </p>

            </footer>

          </div>

        </section>

      </div>

    </main>
  );
}
