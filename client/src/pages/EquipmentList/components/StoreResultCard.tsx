/**
 * Store preview card in store-search results; links to `/stores/:id`.
 */
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Store as StoreIcon } from "lucide-react";
import type { StoreOut } from "../../../services/api";

type Props = {
  store: StoreOut;
};

const StoreResultCard: React.FC<Props> = ({ store }) => {
  const desc = (store.description || "").trim();
  const preview =
    desc.length > 120 ? `${desc.slice(0, 120).trim()}…` : desc || "View equipment from this store.";

  return (
    <Link
      to={`/stores/${store.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl no-underline"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <StoreIcon size={22} strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-brand-600">
            {store.storeName}
          </h3>
          {store.address ? (
            <p className="mt-0.5 text-xs font-medium text-slate-500">{store.address}</p>
          ) : null}
        </div>
      </div>
      <p className="mb-4 flex-grow text-sm leading-relaxed text-slate-600">{preview}</p>
      <span className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition-colors group-hover:bg-brand-600">
        View store
        <ChevronRight size={18} aria-hidden />
      </span>
    </Link>
  );
};

export default StoreResultCard;
