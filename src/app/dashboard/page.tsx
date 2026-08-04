export default function DashboardPage() {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-900 p-6">
            <h1 className="text-2xl font-bold text-cyan-400 mb-8">
              🛡 SecureOps
            </h1>
  
            <nav className="space-y-4">
              <a href="#" className="block hover:text-cyan-400">
                Dashboard
              </a>
              <a href="#" className="block hover:text-cyan-400">
                Assets
              </a>
              <a href="#" className="block hover:text-cyan-400">
                Vulnerabilities
              </a>
              <a href="#" className="block hover:text-cyan-400">
                Incidents
              </a>
              <a href="#" className="block hover:text-cyan-400">
                Threat Intelligence
              </a>
              <a href="#" className="block hover:text-cyan-400">
                Reports
              </a>
              <a href="#" className="block hover:text-cyan-400">
                Settings
              </a>
            </nav>
          </aside>
  
          {/* Main Content */}
          <section className="flex-1 p-8">
            <h2 className="text-4xl font-bold mb-8">
              Security Dashboard
            </h2>
  
            <div className="grid grid-cols-4 gap-6">
              <div className="rounded-xl bg-slate-900 p-6">
                <h3 className="text-slate-400">Assets</h3>
                <p className="mt-4 text-4xl font-bold text-cyan-400">247</p>
              </div>
  
              <div className="rounded-xl bg-slate-900 p-6">
                <h3 className="text-slate-400">Critical Alerts</h3>
                <p className="mt-4 text-4xl font-bold text-red-500">5</p>
              </div>
  
              <div className="rounded-xl bg-slate-900 p-6">
                <h3 className="text-slate-400">Open Incidents</h3>
                <p className="mt-4 text-4xl font-bold text-yellow-400">12</p>
              </div>
  
              <div className="rounded-xl bg-slate-900 p-6">
                <h3 className="text-slate-400">Compliance</h3>
                <p className="mt-4 text-4xl font-bold text-green-400">97%</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }