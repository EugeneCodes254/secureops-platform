export default function ForgotPasswordPage() {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-4">
            Forgot Password
          </h1>
  
          <p className="text-slate-400 mb-6">
            Enter your email to receive a password reset link.
          </p>
  
          <input
            type="email"
            placeholder="Email Address"
            className="w-full rounded-lg bg-slate-800 p-3 text-white mb-4"
          />
  
          <button className="w-full rounded-lg bg-cyan-500 py-3 font-semibold">
            Send Reset Link
          </button>
        </div>
      </main>
    );
  }