"use client";

import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8">
        <h1 className="mb-4 text-3xl font-bold text-cyan-400">
          Verify OTP
        </h1>

        <p className="mb-6 text-slate-400">
          Enter the verification code sent to your email.
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit code"
          className="mb-4 w-full rounded-lg bg-slate-800 p-3 text-center text-2xl tracking-[0.5em] text-white"
        />

        <button
          onClick={() => router.push("/auth/reset-password")}
          className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-slate-900"
        >
          Verify Code
        </button>
      </div>
    </main>
  );
}