"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type PersonnelStatus = "ACTIVE" | "OFF_DUTY" | "SUSPENDED";
type SiteStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";

type Incident = {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  createdAt: string;
  personnelId?: number | null;
};

type Personnel = {
  id: number;
  fullName: string;
  role: string;
  phone: string;
  site: string;
  status: PersonnelStatus;
  createdAt: string;
};

type Site = {
  id: number;
  name: string;
  location: string;
  client: string;
  contact: string;
  status: SiteStatus;
  createdAt: string;
};

const API_URL = "http://localhost:5000";

export default function DashboardPage() {
  const router = useRouter();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [incidentsResponse, personnelResponse, sitesResponse] =
        await Promise.all([
          fetch(`${API_URL}/incidents`),
          fetch(`${API_URL}/personnel`),
          fetch(`${API_URL}/sites`),
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

      setIncidents(incidentsData.incidents || []);
      setPersonnel(personnelData.personnel || []);
      setSites(sitesData.sites || []);
    } catch (error) {
      console.error("DASHBOARD ERROR:", error);
      setError(
        "Unable to load live operations data. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statistics = useMemo(() => {
    return {
      totalIncidents: incidents.length,

      openIncidents: incidents.filter(
        (incident) => incident.status === "OPEN"
      ).length,

      inProgressIncidents: incidents.filter(
        (incident) => incident.status === "IN_PROGRESS"
      ).length,

      criticalIncidents: incidents.filter(
        (incident) => incident.severity === "CRITICAL"
      ).length,

      resolvedIncidents: incidents.filter(
        (incident) =>
          incident.status === "RESOLVED" ||
          incident.status === "CLOSED"
      ).length,

      activePersonnel: personnel.filter(
        (person) => person.status === "ACTIVE"
      ).length,

      offDutyPersonnel: personnel.filter(
        (person) => person.status === "OFF_DUTY"
      ).length,

      suspendedPersonnel: personnel.filter(
        (person) => person.status === "SUSPENDED"
      ).length,

      activeSites: sites.filter(
        (site) => site.status === "ACTIVE"
      ).length,

      maintenanceSites: sites.filter(
        (site) => site.status === "MAINTENANCE"
      ).length,

      inactiveSites: sites.filter(
        (site) => site.status === "INACTIVE"
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

  const severityCount = useMemo(() => {
    return {
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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const severityClass = (severity: Severity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-400 border-red-500/30";

      case "HIGH":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";

      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";

      default:
        return "bg-green-500/10 text-green-400 border-green-500/30";
    }
  };

  const statusClass = (status: IncidentStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-cyan-500/10 text-cyan-400";

      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400";

      case "RESOLVED":
        return "bg-green-500/10 text-green-400";

      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  const maxSeverity =
    Math.max(
      severityCount.critical,
      severityCount.high,
      severityCount.medium,
      severityCount.low,
      1
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-xl font-bold">
              Secure<span className="text-red-500">Ops</span>
            </div>

            <p className="text-xs uppercase tracking-widest text-slate-500">
              Privamax Security Firm Limited
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm text-slate-300">
                Operations Administrator
              </p>

              <p className="text-xs text-green-400">
                ● System Online
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* NAVIGATION */}

        <nav className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium"
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
        </nav>

        {/* TITLE */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
              Security Operations Center
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Operations Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Live operational visibility across incidents,
              personnel and security sites.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh Data"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* PRIMARY STATISTICS */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Total Incidents
            </p>

            <p className="mt-3 text-3xl font-bold">
              {statistics.totalIncidents}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              All recorded incidents
            </p>
          </div>

          <div className="rounded-xl border border-yellow-500/20 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Open
            </p>

            <p className="mt-3 text-3xl font-bold text-yellow-400">
              {statistics.openIncidents}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Requires attention
            </p>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              In Progress
            </p>

            <p className="mt-3 text-3xl font-bold text-blue-400">
              {statistics.inProgressIncidents}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently being handled
            </p>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Critical
            </p>

            <p className="mt-3 text-3xl font-bold text-red-400">
              {statistics.criticalIncidents}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Immediate attention
            </p>
          </div>

          <div className="rounded-xl border border-green-500/20 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Resolved
            </p>

            <p className="mt-3 text-3xl font-bold text-green-400">
              {statistics.resolvedIncidents}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Successfully closed
            </p>
          </div>

        </section>

        {/* SECONDARY OPERATIONS */}

        <section className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* THREAT SEVERITY */}

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6">
              <h2 className="font-semibold">
                Threat Severity
              </h2>

              <p className="text-xs text-slate-500">
                Current incident distribution
              </p>
            </div>

            <div className="space-y-5">

              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-red-400">Critical</span>
                  <span>{severityCount.critical}</span>
                </div>

                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{
                      width: `${(severityCount.critical / maxSeverity) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-orange-400">High</span>
                  <span>{severityCount.high}</span>
                </div>

                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-orange-500"
                    style={{
                      width: `${(severityCount.high / maxSeverity) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-yellow-400">Medium</span>
                  <span>{severityCount.medium}</span>
                </div>

                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-yellow-500"
                    style={{
                      width: `${(severityCount.medium / maxSeverity) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-green-400">Low</span>
                  <span>{severityCount.low}</span>
                </div>

                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{
                      width: `${(severityCount.low / maxSeverity) * 100}%`,
                    }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* PERSONNEL */}

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-semibold">
                  Personnel Status
                </h2>

                <p className="text-xs text-slate-500">
                  Current security workforce
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard/personnel")}
                className="text-xs text-red-400 hover:text-red-300"
              >
                View →
              </button>
            </div>

            <div className="space-y-3">

              <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
                <span className="text-sm text-slate-400">
                  Active
                </span>

                <span className="font-semibold text-green-400">
                  {statistics.activePersonnel}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
                <span className="text-sm text-slate-400">
                  Off Duty
                </span>

                <span className="font-semibold text-yellow-400">
                  {statistics.offDutyPersonnel}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
                <span className="text-sm text-slate-400">
                  Suspended
                </span>

                <span className="font-semibold text-red-400">
                  {statistics.suspendedPersonnel}
                </span>
              </div>

              <div className="mt-4 border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-500">
                  Total Personnel
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {personnel.length}
                </p>
              </div>

            </div>
          </div>

          {/* SITES */}

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-semibold">
                  Site Status
                </h2>

                <p className="text-xs text-slate-500">
                  Current operational locations
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard/sites")}
                className="text-xs text-red-400 hover:text-red-300"
              >
                View →
              </button>
            </div>

            <div className="space-y-3">

              <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
                <span className="text-sm text-slate-400">
                  Active Sites
                </span>

                <span className="font-semibold text-green-400">
                  {statistics.activeSites}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
                <span className="text-sm text-slate-400">
                  Maintenance
                </span>

                <span className="font-semibold text-yellow-400">
                  {statistics.maintenanceSites}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
                <span className="text-sm text-slate-400">
                  Inactive
                </span>

                <span className="font-semibold text-red-400">
                  {statistics.inactiveSites}
                </span>
              </div>

              <div className="mt-4 border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-500">
                  Total Sites
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {sites.length}
                </p>
              </div>

            </div>
          </div>

        </section>

        {/* RECENT INCIDENTS */}

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 p-6">

            <div>
              <h2 className="font-semibold">
                Recent Security Incidents
              </h2>

              <p className="text-xs text-slate-500">
                Latest activity across Privamax operations
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard/incidents")}
              className="text-xs text-red-400 hover:text-red-300"
            >
              View all →
            </button>

          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading live operations data...
            </div>
          ) : recentIncidents.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No incidents recorded.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">

              {recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
                >

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="text-xs text-slate-600">
                        INC-{String(incident.id).padStart(4, "0")}
                      </span>

                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${severityClass(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>

                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass(
                          incident.status
                        )}`}
                      >
                        {incident.status.replace("_", " ")}
                      </span>

                    </div>

                    <h3 className="mt-2 font-semibold">
                      {incident.title}
                    </h3>

                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {incident.description}
                    </p>

                    <p className="mt-2 text-[10px] text-slate-600">
                      {new Date(
                        incident.createdAt
                      ).toLocaleString()}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      router.push("/dashboard/incidents")
                    }
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Manage
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* SYSTEM STATUS */}

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-5">
            <h2 className="font-semibold">
              System Status
            </h2>

            <p className="text-xs text-slate-500">
              SecureOps platform health
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">

            <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
              <span className="text-sm">
                SecureOps API
              </span>

              <span className="text-xs text-green-400">
                ● Operational
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
              <span className="text-sm">
                PostgreSQL Database
              </span>

              <span className="text-xs text-green-400">
                ● Operational
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
              <span className="text-sm">
                Incident Management
              </span>

              <span className="text-xs text-green-400">
                ● Operational
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
              <span className="text-sm">
                Authentication
              </span>

              <span className="text-xs text-green-400">
                ● Operational
              </span>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

