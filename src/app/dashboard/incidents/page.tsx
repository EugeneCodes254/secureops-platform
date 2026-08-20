"use client";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

type Personnel = {
  id: number;
  fullName: string;
  role: string;
  phone: string;
  site: string;
  status: "ACTIVE" | "OFF_DUTY" | "SUSPENDED";
};

type Incident = {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  createdAt: string;
  personnelId: number | null;
  personnel: Personnel | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("MEDIUM");
  const [personnelId, setPersonnelId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [incidentResponse, personnelResponse] =
        await Promise.all([
          fetch(`${API_URL}/incidents`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/personnel`, {
            headers,
            cache: "no-store",
          }),
        ]);

      const incidentData = await incidentResponse.json();
      const personnelData = await personnelResponse.json();

      if (!incidentData.success) {
        throw new Error(
          incidentData.message || "Failed to load incidents"
        );
      }

      if (!personnelData.success) {
        throw new Error(
          personnelData.message || "Failed to load personnel"
        );
      }

      setIncidents(incidentData.incidents);
      setPersonnel(personnelData.personnel);
    } catch (err) {
      console.error(err);
      setError("Unable to load incident data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==============================
  // CREATE INCIDENT
  // ==============================

  const createIncident = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch(
        `${API_URL}/incidents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title,
            description,
            severity,
            personnelId: personnelId
              ? Number(personnelId)
              : null,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to create incident"
        );
      }

      setTitle("");
      setDescription("");
      setSeverity("MEDIUM");
      setPersonnelId("");

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to create incident.");
    } finally {
      setCreating(false);
    }
  };

  // ==============================
  // UPDATE INCIDENT
  // ==============================

  const updateIncident = async (
    incident: Incident,
    changes: {
      status?: Status;
      personnelId?: number | null;
    }
  ) => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/incidents/${incident.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: incident.title,
            description: incident.description,
            severity: incident.severity,
            status:
              changes.status ?? incident.status,
            personnelId:
              changes.personnelId !== undefined
                ? changes.personnelId
                : incident.personnelId,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to update incident"
        );
      }

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to update incident.");
    }
  };

  // ==============================
  // DELETE INCIDENT
  // ==============================

  const deleteIncident = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this incident?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/incidents/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to delete incident"
        );
      }

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to delete incident.");
    }
  };

  // ==============================
  // STYLING
  // ==============================

  const severityClass = (
    value: Severity
  ) => {
    switch (value) {
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

  const statusClass = (
    value: Status
  ) => {
    switch (value) {
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

  // ==============================
  // UI
  // ==============================

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
              Privamax Security Firm Ltd
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Incident Management
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Monitor, assign and manage security incidents.
            </p>

          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-red-500 hover:bg-slate-800 hover:text-white"
            >
              ← Dashboard
            </button>

            <button
              onClick={loadData}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
            >
              ↻ Refresh
            </button>
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* CREATE INCIDENT */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

          <div className="mb-5">

            <p className="text-xs uppercase tracking-widest text-red-400">
              Incident Response
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Report New Incident
            </h2>

          </div>

          <form
            onSubmit={createIncident}
            className="grid gap-4 md:grid-cols-2"
          >

            <input
              type="text"
              placeholder="Incident title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm outline-none focus:border-red-500"
            />

            <select
              value={severity}
              onChange={(e) =>
                setSeverity(
                  e.target.value as Severity
                )
              }
              className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm outline-none"
            >
              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="CRITICAL">
                Critical
              </option>
            </select>

            <select
              value={personnelId}
              onChange={(e) =>
                setPersonnelId(e.target.value)
              }
              className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm outline-none md:col-span-2"
            >

              <option value="">
                Assign security officer...
              </option>

              {personnel
                .filter(
                  (person) =>
                    person.status === "ACTIVE"
                )
                .map((person) => (
                  <option
                    key={person.id}
                    value={person.id}
                  >
                    {person.fullName} — {person.role} — {person.site}
                  </option>
                ))}

            </select>

            <textarea
              placeholder="Describe what happened..."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={4}
              className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm outline-none focus:border-red-500 md:col-span-2"
            />

            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500 disabled:opacity-50 md:col-span-2"
            >
              {creating
                ? "Creating Incident..."
                : "+ Report Incident"}
            </button>

          </form>

        </section>

        {/* INCIDENT LIST */}

        <section>

          <div className="mb-4 flex items-center justify-between">

            <div>

              <p className="text-xs uppercase tracking-widest text-slate-500">
                SOC Queue
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Active Security Incidents
              </h2>

            </div>

            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
              {incidents.length} Total
            </span>

          </div>

          {loading ? (

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
              Loading security incidents...
            </div>

          ) : incidents.length === 0 ? (

            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">

              <div className="text-4xl">
                🛡️
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No incidents recorded
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                The security operations queue is currently clear.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {incidents.map((incident) => (

                <article
                  key={incident.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-slate-700"
                >

                  {/* TOP */}

                  <div className="flex flex-col justify-between gap-4 lg:flex-row">

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="text-xs font-medium text-slate-500">
                          INC-{String(incident.id).padStart(4, "0")}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-semibold ${severityClass(
                            incident.severity
                          )}`}
                        >
                          {incident.severity}
                        </span>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(
                            incident.status
                          )}`}
                        >
                          {incident.status.replace(
                            "_",
                            " "
                          )}
                        </span>

                      </div>

                      <h3 className="mt-3 text-lg font-semibold">
                        {incident.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {incident.description}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        deleteIncident(
                          incident.id
                        )
                      }
                      className="h-fit rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      Delete
                    </button>

                  </div>

                  {/* OPERATIONS */}

                  <div className="mt-6 grid gap-4 border-t border-slate-800 pt-5 md:grid-cols-2">

                    {/* ASSIGNMENT */}

                    <div>

                      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                        Assigned Officer
                      </label>

                      <select
                        value={
                          incident.personnelId ?? ""
                        }
                        onChange={(e) =>
                          updateIncident(
                            incident,
                            {
                              personnelId:
                                e.target.value
                                  ? Number(
                                      e.target.value
                                    )
                                  : null,
                            }
                          )
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm outline-none focus:border-red-500"
                      >

                        <option value="">
                          Unassigned
                        </option>

                        {personnel.map(
                          (person) => (
                            <option
                              key={person.id}
                              value={person.id}
                            >
                              {person.fullName} — {person.site}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    {/* STATUS */}

                    <div>

                      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                        Incident Status
                      </label>

                      <select
                        value={incident.status}
                        onChange={(e) =>
                          updateIncident(
                            incident,
                            {
                              status:
                                e.target.value as Status,
                            }
                          )
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm outline-none focus:border-red-500"
                      >

                        <option value="OPEN">
                          Open
                        </option>

                        <option value="IN_PROGRESS">
                          In Progress
                        </option>

                        <option value="RESOLVED">
                          Resolved
                        </option>

                        <option value="CLOSED">
                          Closed
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* INCIDENT META */}

                  <div className="mt-5 flex flex-col gap-2 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">

                    <div>
                      Reported{" "}
                      {new Date(
                        incident.createdAt
                      ).toLocaleString()}
                    </div>

                    <div>

                      {incident.personnel ? (
                        <span className="text-slate-400">
                          Officer:{" "}
                          <span className="font-medium text-white">
                            {incident.personnel.fullName}
                          </span>
                        </span>
                      ) : (
                        <span className="text-yellow-500">
                          ⚠ No officer assigned
                        </span>
                      )}

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}