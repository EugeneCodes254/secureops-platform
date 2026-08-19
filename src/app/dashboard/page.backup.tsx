"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const user = useMemo<User | null>(() => {
    if (typeof window === "undefined") return null;

    const storedUser = localStorage.getItem("user");

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  }, []);

  if (!token) {
    router.replace("/auth/login");
    return null;
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            SecureOps Dashboard
          </h1>

          {user && (
            <p className="mt-2 text-slate-400">
              Welcome, {user.email}
            </p>
          )}
        </div>

        <button
          onClick={logout}
          className="rounded-lg bg-red-600 px-5 py-2 hover:bg-red-500"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Incidents</h2>
          <p className="mt-4 text-4xl font-bold text-cyan-400">0</p>
        </div>

        <div className="rounded-xl bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Assets</h2>
          <p className="mt-4 text-4xl font-bold text-green-400">0</p>
        </div>

        <div className="rounded-xl bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Threats</h2>
          <p className="mt-4 text-4xl font-bold text-red-400">0</p>
        </div>
      </div>
    </main>
  );
}