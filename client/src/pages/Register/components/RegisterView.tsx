/**
 * Sign-up form UI (profile fields and role choice).
 */
import React from "react";

type Role = "customer" | "business_owner";

type Props = {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  role: Role;
  setRole: (value: Role) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
  success: string;
};

const field =
  "h-12 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

const RegisterView: React.FC<Props> = ({
  fullName,
  setFullName,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  password,
  setPassword,
  role,
  setRole,
  onSubmit,
  loading,
  error,
  success,
}) => {
  return (
    <main className="mx-auto max-w-lg px-4 py-12 md:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
          Create account
        </h1>
        <p className="mb-6 text-sm font-medium text-slate-500">
          Customers rent equipment; business owners manage a store and products.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Full name
            </span>
            <input
              className={field}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="Full name"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Email
            </span>
            <input
              className={field}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Phone (optional)
            </span>
            <input
              className={field}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              autoComplete="tel"
              placeholder="0500000000"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Password
            </span>
            <input
              className={field}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Role
            </span>
            <select
              className={field}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="customer">Customer</option>
              <option value="business_owner">Business owner</option>
            </select>
          </label>

          <button
            type="button"
            className="h-12 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition-colors hover:bg-brand-700 disabled:opacity-50"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {success}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default RegisterView;
