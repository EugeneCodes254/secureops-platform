export default function ResetPasswordPage() {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8">
          <h1 className="mb-4 text-3xl font-bold text-cyan-400">
            Reset Password
          </h1>
  
          <input
            type="password"
            placeholder="New Password"
            className="mb-4 w-full rounded-lg bg-slate-800 p-3 text-white"
          />
  
          <input
            type="password"
            placeholder="Confirm Password"
            className="mb-6 w-full rounded-lg bg-slate-800 p-3 text-white"
          />
  
          <button className="w-full rounded-lg bg-cyan-500 py-3 font-semibold">
            Reset Password
          </button>
        </div>
      </main>
    );
  }