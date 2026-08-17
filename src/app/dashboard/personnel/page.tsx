"use client";

import { useEffect, useMemo, useState } from "react";

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

const API_URL = "http://localhost:5000";

const emptyForm = {
  fullName: "",
  role: "",
  phone: "",
  site: "",
  status: "ACTIVE" as PersonnelStatus,
};

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const loadPersonnel = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(`${API_URL}/personnel`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to load personnel");
      }

      setPersonnel(data.personnel);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the SecureOps backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonnel();
  }, []);

  const filteredPersonnel = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return personnel;

    return personnel.filter(
      (person) =>
        person.fullName.toLowerCase().includes(query) ||
        person.role.toLowerCase().includes(query) ||
        person.phone.toLowerCase().includes(query) ||
        person.site.toLowerCase().includes(query) ||
        person.status.toLowerCase().includes(query)
    );
  }, [personnel, search]);

  const stats = useMemo(() => {
    return {
      total: personnel.length,
      active: personnel.filter((p) => p.status === "ACTIVE").length,
      offDuty: personnel.filter((p) => p.status === "OFF_DUTY").length,
      suspended: personnel.filter((p) => p.status === "SUSPENDED").length,
    };
  }, [personnel]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (person: Personnel) => {
    setEditingId(person.id);

    setForm({
      fullName: person.fullName,
      role: person.role,
      phone: person.phone,
      site: person.site,
      status: person.status,
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const savePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.role || !form.phone || !form.site) {
      setError("Full name, role, phone and site are required.");
      return;
    }

    try {
      setError("");

      const url = editingId
        ? `${API_URL}/personnel/${editingId}`
        : `${API_URL}/personnel`;

      const method = editingId ? "PUT" : "POST";

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Unable to save personnel.");
        return;
      }

      closeForm();
      await loadPersonnel();
    } catch (err) {
      console.error(err);
      setError("Unable to save personnel.");
    }
  };

  const deletePersonnel = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this personnel record?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(`${API_URL}/personnel/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Unable to delete personnel.");
        return;
      }

      await loadPersonnel();
    } catch (err) {
      console.error(err);
      setError("Unable to delete personnel.");
    }
  };

  const statusClasses = (status: PersonnelStatus) => {
    switch (status) {
      case "ACTIVE":
        return "border-green-500/30 bg-green-500/10 text-green-400";

      case "OFF_DUTY":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      case "SUSPENDED":
        return "border-red-500/30 bg-red-500/10 text-red-400";
    }
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

          <a
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-red-500 hover:text-white"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* TITLE */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-red-400">
              Security Operations Center
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Personnel Management
            </h1>

            <p className="mt-2 text-slate-400">
              Manage security officers and personnel assigned to Privamax operations.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500"
          >
            + Add Personnel
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Total Personnel</p>
            <p className="mt-3 text-4xl font-bold">{stats.total}</p>
          </div>

          <div className="rounded-xl border border-green-500/20 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Active</p>
            <p className="mt-3 text-4xl font-bold text-green-400">
              {stats.active}
            </p>
          </div>

          <div className="rounded-xl border border-yellow-500/20 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Off Duty</p>
            <p className="mt-3 text-4xl font-bold text-yellow-400">
              {stats.offDuty}
            </p>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Suspended</p>
            <p className="mt-3 text-4xl font-bold text-red-400">
              {stats.suspended}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search personnel by name, role, phone, site or status..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-red-500"
          />
        </div>

        {/* PERSONNEL TABLE */}
        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Security Personnel
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredPersonnel.length} personnel record
                  {filteredPersonnel.length === 1 ? "" : "s"}
                </p>
              </div>

              <button
                onClick={loadPersonnel}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-400">
              Loading personnel...
            </div>
          ) : filteredPersonnel.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-lg font-semibold text-slate-300">
                No personnel found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Add your first security officer to begin managing personnel.
              </p>

              <button
                onClick={openCreateForm}
                className="mt-5 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold hover:bg-red-500"
              >
                + Add Personnel
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-800 bg-slate-950/40">
                  <tr>
                    <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Personnel
                    </th>

                    <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Site
                    </th>

                    <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPersonnel.map((person) => (
                    <tr
                      key={person.id}
                      className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-sm font-bold text-red-400">
                            {person.fullName
                              .split(" ")
                              .map((word) => word[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-white">
                              {person.fullName}
                            </p>

                            <p className="text-xs text-slate-500">
                              ID #{String(person.id).padStart(4, "0")}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-300">
                        {person.role}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-300">
                        {person.phone}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-300">
                        {person.site}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                            person.status
                          )}`}
                        >
                          {person.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(person)}
                            className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-blue-500 hover:text-blue-400"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deletePersonnel(person.id)}
                            className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? "Edit Personnel" : "Add Personnel"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update this personnel record."
                    : "Register a new security officer."}
                </p>
              </div>

              <button
                onClick={closeForm}
                className="text-2xl text-slate-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={savePersonnel} className="space-y-5 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Full Name
                  </label>

                  <input
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    placeholder="e.g. John Kamau"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Role
                  </label>

                  <input
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                    placeholder="e.g. Security Officer"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Phone
                  </label>

                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="e.g. 0712 345 678"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Assigned Site
                  </label>

                  <input
                    value={form.site}
                    onChange={(e) =>
                      setForm({ ...form, site: e.target.value })
                    }
                    placeholder="e.g. Nyali Site"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-slate-400">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as PersonnelStatus,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-red-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="OFF_DUTY">Off Duty</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold hover:bg-red-500"
                >
                  {editingId ? "Save Changes" : "Add Personnel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
