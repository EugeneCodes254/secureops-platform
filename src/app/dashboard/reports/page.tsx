"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Incident = {
  id: number;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
};

type Personnel = {
  id: number;
  fullName: string;
  role: string;
  phone: string;
  site: string;
  status: "ACTIVE" | "OFF_DUTY" | "SUSPENDED";
  createdAt: string;
};

type Site = {
  id: number;
  name: string;
  location: string;
  client: string;
  contact: string;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  createdAt: string;
};

export default function ReportsPage() {
  const router = useRouter();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    loadReportData();
  }, [router]);

  const loadReportData = async () => {
    try {
      setLoading(true);

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
          fetch("http://localhost:5000/incidents", {
            headers,
            cache: "no-store",
          }),
          fetch("http://localhost:5000/personnel", {
            headers,
            cache: "no-store",
          }),
          fetch("http://localhost:5000/sites", {
            headers,
            cache: "no-store",
          }),
        ]);

      const incidentsData = await incidentsRes.json();
      const personnelData = await personnelRes.json();
      const sitesData = await sitesRes.json();

      if (incidentsData.success) {
        setIncidents(incidentsData.incidents || []);
      }

      if (personnelData.success) {
        setPersonnel(personnelData.personnel || []);
      }

      if (sitesData.success) {
        setSites(sitesData.sites || []);
      }
    } catch (error) {
      console.error("REPORT LOAD ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const incidentStats = useMemo(() => ({
    total: incidents.length,
    open: incidents.filter((i) => i.status === "OPEN").length,
    inProgress: incidents.filter(
      (i) => i.status === "IN_PROGRESS"
    ).length,
    resolved: incidents.filter(
      (i) => i.status === "RESOLVED"
    ).length,
    critical: incidents.filter(
      (i) => i.severity === "CRITICAL"
    ).length,
    high: incidents.filter(
      (i) => i.severity === "HIGH"
    ).length,
    medium: incidents.filter(
      (i) => i.severity === "MEDIUM"
    ).length,
    low: incidents.filter(
      (i) => i.severity === "LOW"
    ).length,
  }), [incidents]);

  const personnelStats = useMemo(() => ({
    total: personnel.length,
    active: personnel.filter(
      (p) => p.status === "ACTIVE"
    ).length,
    offDuty: personnel.filter(
      (p) => p.status === "OFF_DUTY"
    ).length,
    suspended: personnel.filter(
      (p) => p.status === "SUSPENDED"
    ).length,
  }), [personnel]);

  const siteStats = useMemo(() => ({
    total: sites.length,
    active: sites.filter(
      (s) => s.status === "ACTIVE"
    ).length,
    maintenance: sites.filter(
      (s) => s.status === "MAINTENANCE"
    ).length,
    inactive: sites.filter(
      (s) => s.status === "INACTIVE"
    ).length,
  }), [sites]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      <header className="border-b border-slate-800">
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
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            Logout
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">

        <nav className="mb-8 flex flex-wrap gap-2">

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Overview
          </button>

          <button
            onClick={() => router.push("/dashboard/incidents")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Incidents
          </button>

          <button
            onClick={() => router.push("/dashboard/personnel")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Personnel
          </button>

          <button
            onClick={() => router.push("/dashboard/sites")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Sites
          </button>

          <button
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium"
          >
            Reports
          </button>

        </nav>

        <div className="mb-8">

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
            Security Operations Center
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Security Operations Reports
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Operational summary of incidents, personnel and security sites.
          </p>

        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-400">
            Loading operational report...
          </div>
        ) : (
          <>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-3">

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400">
                  Total Incidents
                </p>
                <p className="mt-3 text-4xl font-bold">
                  {incidentStats.total}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400">
                  Total Personnel
                </p>
                <p className="mt-3 text-4xl font-bold">
                  {personnelStats.total}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400">
                  Security Sites
                </p>
                <p className="mt-3 text-4xl font-bold">
                  {siteStats.total}
                </p>
              </div>

            </section>

            <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">

                <h2 className="text-lg font-semibold">
                  Incident Status
                </h2>

                <div className="mt-5 space-y-4">

                  <div className="flex justify-between">
                    <span className="text-slate-400">Open</span>
                    <span className="font-semibold text-yellow-400">
                      {incidentStats.open}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">In Progress</span>
                    <span className="font-semibold text-blue-400">
                      {incidentStats.inProgress}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolved</span>
                    <span className="font-semibold text-green-400">
                      {incidentStats.resolved}
                    </span>
                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">

                <h2 className="text-lg font-semibold">
                  Threat Severity
                </h2>

                <div className="mt-5 space-y-4">

                  <div className="flex justify-between">
                    <span className="text-slate-400">Critical</span>
                    <span className="font-semibold text-red-500">
                      {incidentStats.critical}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">High</span>
                    <span className="font-semibold text-orange-400">
                      {incidentStats.high}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Medium</span>
                    <span className="font-semibold text-yellow-400">
                      {incidentStats.medium}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Low</span>
                    <span className="font-semibold text-green-400">
                      {incidentStats.low}
                    </span>
                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">

                <h2 className="text-lg font-semibold">
                  Operations Status
                </h2>

                <div className="mt-5 space-y-4">

                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Personnel</span>
                    <span className="font-semibold text-green-400">
                      {personnelStats.active}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Off Duty</span>
                    <span className="font-semibold text-yellow-400">
                      {personnelStats.offDuty}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Sites</span>
                    <span className="font-semibold text-green-400">
                      {siteStats.active}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Maintenance</span>
                    <span className="font-semibold text-yellow-400">
                      {siteStats.maintenance}
                    </span>
                  </div>

                </div>

              </div>

            </section>

            <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/70">

              <div className="border-b border-slate-800 p-6">

                <h2 className="text-xl font-semibold">
                  Recent Security Incidents
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest recorded incidents across Privamax operations.
                </p>

              </div>

              {incidents.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No incidents recorded.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">

                  {incidents.slice(0, 5).map((incident) => (
                    <div
                      key={incident.id}
                      className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
                    >

                      <div>

                        <div className="flex items-center gap-2">

                          <span className="text-xs text-slate-500">
                            INC-{String(incident.id).padStart(4, "0")}
                          </span>

                          <span className="rounded-full border border-red-500/30 px-2 py-1 text-xs text-red-400">
                            {incident.severity}
                          </span>

                          <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-400">
                            {incident.status}
                          </span>

                        </div>

                        <h3 className="mt-2 font-semibold">
                          {incident.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {incident.description}
                        </p>

                      </div>

                      <div className="text-xs text-slate-500">
                        {new Date(
                          incident.createdAt
                        ).toLocaleString()}
                      </div>

                    </div>
                  ))}

                </div>
              )}

            </section>

            <div className="mt-8 flex justify-end">

              <button
                onClick={loadReportData}
                className="rounded-lg border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800"
              >
                ↻ Refresh Report
              </button>

            </div>

          </>
        )}

      </div>
    </main>
  );
}
