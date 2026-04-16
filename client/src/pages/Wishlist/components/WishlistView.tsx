/**
 * Wish list grid: link to equipment detail and remove from list.
 */
import React from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import type { Equipment } from "../../../types";

type Props = {
  items: Equipment[];
  removingId: number | null;
  onRemove: (equipmentId: number) => void;
};

const WishlistView: React.FC<Props> = ({ items, removingId, onRemove }) => {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">
        Wish list
      </h1>
      <p className="mb-8 text-sm font-medium text-slate-600">
        Items you saved without booking. Open one to check availability or rent.
      </p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
          <Heart
            className="mx-auto mb-3 text-brand-500"
            size={40}
            strokeWidth={1.75}
            aria-hidden
          />
          <p className="text-sm font-semibold text-slate-700">
            Your wish list is empty.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Browse the catalog and use &quot;Add to wish list&quot; on any item.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white no-underline shadow-sm shadow-brand-500/25 transition-colors hover:bg-brand-700"
          >
            Browse equipment
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((eq) => (
            <li
              key={eq.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <Link
                to={`/equipment/${eq.id}`}
                className="relative aspect-[16/10] block shrink-0 overflow-hidden bg-slate-100"
              >
                <img
                  src={eq.imageUrl}
                  alt={eq.name}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <Link
                  to={`/equipment/${eq.id}`}
                  className="text-base font-bold leading-snug text-slate-900 no-underline hover:text-brand-600"
                >
                  {eq.name}
                </Link>
                <p className="text-xs font-medium text-slate-500">
                  {eq.storeName || "Store"} · ₪{eq.pricePerDay}/day
                </p>
                <button
                  type="button"
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 transition-colors hover:bg-rose-100 disabled:opacity-50"
                  onClick={() => onRemove(eq.id)}
                  disabled={removingId === eq.id}
                >
                  <Trash2 size={14} aria-hidden />
                  {removingId === eq.id ? "Removing…" : "Remove"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WishlistView;
