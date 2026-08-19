export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="max-w-5xl text-center px-6">
        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          Powered by Tech Solutions
        </span>

        <h1 className="mt-8 text-6xl font-extrabold tracking-tight">
          Secure<span className="text-red-500">Ops</span>
        </h1>

        <p className="mt-6 text-xl text-slate-400">
          Enterprise Security Operations Management Platform
        </p>

        <div className="mt-12 flex justify-center gap-4">
          <a
            href="/auth/login"
            className="rounded-xl bg-red-600 px-6 py-3 font-semibold hover:bg-red-700 transition"
          >
            Launch Dashboard
          </a>

          <a
            href="#stats"
            className="rounded-xl border border-slate-700 px-6 py-3 hover:bg-slate-800 transition"
          >
            Learn More
          </a>
        </div>

        <div id="stats" className="mt-20 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8">
            <h2 className="text-4xl font-bold text-red-500">128</h2>
            <p className="mt-2 text-slate-400">Security Officers</p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8">
            <h2 className="text-4xl font-bold text-green-500">97</h2>
            <p className="mt-2 text-slate-400">On Duty</p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8">
            <h2 className="text-4xl font-bold text-yellow-500">4</h2>
            <p className="mt-2 text-slate-400">Active Incidents</p>
          </div>
        </div>
      </div>
    </main>
  );
}