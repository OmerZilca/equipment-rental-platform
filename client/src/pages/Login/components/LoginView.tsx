/**
 * Login form UI (email, password, errors).
 */
import React from "react";

type Props = {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
};

const LoginView: React.FC<Props> = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  loading,
  error,
}) => {
  return (
    <main className="mx-auto max-w-md px-4 py-12 md:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mb-6 text-sm font-medium text-slate-500">
          Sign in to manage bookings or your store.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Email
            </span>
            <input
              className="h-12 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Password
            </span>
            <input
              className="h-12 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <button
            type="button"
            className="h-12 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition-colors hover:bg-brand-700 disabled:opacity-50"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default LoginView;
