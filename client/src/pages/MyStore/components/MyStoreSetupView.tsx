/**
 * Presentational form for creating a new store (setup wizard).
 */
import React from "react";

const field =
  "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

type Props = {
  storeName: string;
  setStoreName: (v: string) => void;
  logoUrl: string;
  setLogoUrl: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  openingHours: string;
  setOpeningHours: (v: string) => void;
  onCreateStore: () => void;
  createLoading: boolean;
  createError: string;
};

const MyStoreSetupView: React.FC<Props> = (props) => (
  <main className="mx-auto max-w-lg px-4 py-10 md:px-6">
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
        Open your store
      </h1>
      <p className="mb-6 text-sm font-medium text-slate-500">
        One store per account. After you create it, you can edit details anytime
        and add products on your dashboard.
      </p>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase text-slate-500">
            Store name (required)
          </span>
          <input
            className={field}
            value={props.storeName}
            onChange={(e) => props.setStoreName(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase text-slate-500">
            Logo image URL (optional)
          </span>
          <input
            className={field}
            value={props.logoUrl}
            onChange={(e) => props.setLogoUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase text-slate-500">
            Description
          </span>
          <textarea
            className={field}
            value={props.description}
            onChange={(e) => props.setDescription(e.target.value)}
            rows={3}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase text-slate-500">
            Address
          </span>
          <input
            className={field}
            value={props.address}
            onChange={(e) => props.setAddress(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase text-slate-500">
            Opening hours
          </span>
          <input
            className={field}
            value={props.openingHours}
            onChange={(e) => props.setOpeningHours(e.target.value)}
            placeholder="09:00 - 18:00"
          />
        </label>
        <button
          type="button"
          className="h-12 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
          onClick={props.onCreateStore}
          disabled={props.createLoading}
        >
          {props.createLoading ? "Saving…" : "Create store"}
        </button>
        {props.createError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {props.createError}
          </p>
        ) : null}
      </div>
    </div>
  </main>
);

export default MyStoreSetupView;
