"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SiteStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

type Site = {
  id: number;
  name: string;
  location: string;
  client: string;
  contact?: string | null;
  status: SiteStatus;
  createdAt: string;
};

export default function SitesPage() {
  const router = useRouter();

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [client, setClient] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<SiteStatus>("ACTIVE");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    loadSites();
  }, [router]);

  const loadSites = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sites`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSites(data.sites);
      } else {
        setError(data.message || "Unable to load sites.");
      }
    } catch (error) {
      console.error(error);
      setError("Unable to connect to SecureOps backend.");
    } finally {
      setLoading(false);
    }
  };

  const createSite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !location || !client) {
      setError("Site name, location and client are required.");
      return;
    }

    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          location,
          client,
          contact,
          status,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Unable to create site.");
        return;
      }

      setName("");
      setLocation("");
      setClient("");
      setContact("");
      setStatus("ACTIVE");
      setShowCreate(false);

      await loadSites();
    } catch (error) {
      console.error(error);
      setError("Unable to create site.");
    }
  };

  const deleteSite = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this site?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sites/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        await loadSites();
      } else {
        setError(data.message || "Unable to delete site.");
      }
    } catch (error) {
      console.error(error);
      setError("Unable to delete site.");
    }
  };

  const stats = useMemo(() => {
    return {
      total: sites.length,
      active: sites.filter((site) => site.status === "ACTIVE").length,
      maintenance: sites.filter(
        (site) => site.status === "MAINTENANCE"
      ).length,
      inactive: sites.filter(
        (site) => site.status === "INACTIVE"
      ).length,
    };
  }, [sites]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/auth/login");
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
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium"
          >
            Sites
          </button>

          <button
            className="rounded-lg border border-slate-800 px-4 py-2 text-sm text-slate-500"
          >
            Reports
          </button>

        </nav>

        {/* TITLE */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
              Operations Management
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Security Sites
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Manage client locations and operational security sites.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500"
          >
            + Add Site
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Total Sites</p>
            <p className="mt-3 text-4xl font-bold">
              {stats.total}
            </p>
          </div>

          <div className="rounded-xl border border-green-500/20 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Active Sites</p>
            <p className="mt-3 text-4xl font-bold text-green-400">
              {stats.active}
            </p>
          </div>

          <div className="rounded-xl border border-yellow-500/20 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Maintenance</p>
            <p className="mt-3 text-4xl font-bold text-yellow-400">
              {stats.maintenance}
            </p>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Inactive</p>
            <p className="mt-3 text-4xl font-bold text-red-400">
              {stats.inactive}
            </p>
          </div>

        </div>

        {/* SITES TABLE */}
        <section className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">

          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-xl font-semibold">
              Managed Security Sites
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Client locations currently registered in SecureOps.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">
              Loading sites...
            </div>
          ) : sites.length === 0 ? (
            <div className="p-12 text-center">

              <div className="text-4xl">📍</div>

              <h3 className="mt-4 text-lg font-semibold">
                No sites registered
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add your first security site to begin managing
                operations.
              </p>

              <button
                onClick={() => setShowCreate(true)}
                className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-500"
              >
                Add First Site
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Site</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">

                  {sites.map((site) => (

                    <tr
                      key={site.id}
                      className="transition hover:bg-slate-800/40"
                    >

                      <td className="px-6 py-4 font-medium">
                        {site.name}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {site.location}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {site.client}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {site.contact || "—"}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            site.status === "ACTIVE"
                              ? "bg-green-500/10 text-green-400"
                              : site.status === "MAINTENANCE"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {site.status.replace("_", " ")}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <button
                          onClick={() => deleteSite(site.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

      {/* CREATE SITE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold">
                  Add Security Site
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Register a new operational location.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>

            </div>

            <form onSubmit={createSite} className="space-y-4">

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Site name"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-red-500"
              />

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-red-500"
              />

              <input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Client"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-red-500"
              />

              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Contact (optional)"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-red-500"
              />

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as SiteStatus)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <button
                type="submit"
                className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold hover:bg-red-500"
              >
                Create Site
              </button>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}
