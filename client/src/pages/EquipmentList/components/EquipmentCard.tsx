/**
 * Single catalog card: image, price, availability; navigates to equipment details.
 */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, ChevronRight, Info } from "lucide-react";
import type { Equipment } from "../../../types";

type Props = {
  equipment: Equipment;
};

const EquipmentCard: React.FC<Props> = ({ equipment }) => {
  const navigate = useNavigate();
  const avail = equipment.availableQuantity;

  return (
    <div
      role="button"
      tabIndex={0}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={() => navigate(`/equipment/${equipment.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/equipment/${equipment.id}`);
        }
      }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
        <img
          src={equipment.imageUrl}
          alt={equipment.name}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur">
            {equipment.category}
          </span>
        </div>
      </div>

      <div className="flex flex-grow flex-col p-5 text-slate-900">
        <div className="mb-1 flex items-center gap-1 text-xs font-medium text-brand-600">
          <Info size={12} strokeWidth={2.5} aria-hidden />
          {avail > 0 ? `${avail} available` : "Out of stock"}
        </div>

        <h3 className="mb-2 text-lg font-bold leading-tight tracking-tight transition-colors group-hover:text-brand-600">
          {equipment.name}
        </h3>
        <Link
          to={`/stores/${equipment.storeId}`}
          className="relative z-10 mb-4 inline-flex max-w-full text-xs font-bold text-brand-600 no-underline hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {equipment.storeName || "Store"}
        </Link>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Daily rate
              </p>
              <p className="text-xl font-black text-slate-900">
                ${equipment.pricePerDay}
                <span className="ml-1 text-sm font-normal text-slate-500">
                  / day
                </span>
              </p>
            </div>
            <div
              className="flex flex-col items-center gap-0.5 text-slate-400 transition-colors group-hover:text-brand-600"
              aria-hidden
            >
              <Calendar size={18} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">
                Dates
              </span>
            </div>
          </div>

          <span className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-colors group-hover:bg-brand-600">
            Book now
            <ChevronRight size={18} aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
