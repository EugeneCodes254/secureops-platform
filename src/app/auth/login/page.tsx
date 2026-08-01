export default function LoginPage() {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-6">
            SecureOps Login
          </h1>
  
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
            />
  
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
            />
  
            <button
              className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black hover:bg-cyan-400"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    );
  }