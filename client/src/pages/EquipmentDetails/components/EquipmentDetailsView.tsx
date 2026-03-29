/**
 * Equipment details — booking UI (presentation).
 */
import React from "react";
import { Link } from "react-router-dom";
import type { Equipment } from "../../../types";

type Props = {
  equipment: Equipment;
  quantity: number;
  setQuantity: (value: number) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  onBook: () => void;
  onCheckAvailability: () => void;
  availabilityResult: {
    equipmentId: number;
    available: boolean;
    requestedQuantity: number;
    availableQuantity: number;
    overlappingQuantity: number;
  } | null;
  availabilityError: string;
};

const input =
  "rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

const EquipmentDetailsView: React.FC<Props> = ({
  equipment,
  quantity,
  setQuantity,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onBook,
  onCheckAvailability,
  availabilityResult,
  availabilityError,
}) => {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-10">
      <Link
        to="/"
        className="mb-6 inline-flex text-sm font-bold text-slate-500 no-underline hover:text-brand-600"
      >
        ← Back to catalog
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-stretch lg:gap-10">
        {/* Fill grid row height; object-cover scales to frame (may crop mismatched aspects) */}
        <div className="relative isolate min-h-[min(20rem,78vw)] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm lg:min-h-0 lg:h-full">
          <img
            src={equipment.imageUrl}
            alt={equipment.name}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </div>

        <div>
          <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {equipment.name}
          </h1>
          <div className="mb-6 space-y-2 text-sm font-medium text-slate-600">
            <p>
              <span className="font-bold text-slate-400">Store</span>{" "}
              <Link
                to={`/stores/${equipment.storeId}`}
                className="font-semibold text-brand-600 no-underline hover:underline"
              >
                {equipment.storeName || "View store"}
              </Link>
            </p>
            <p>
              <span className="font-bold text-slate-400">Category</span>{" "}
              {equipment.category}
            </p>
            <p>
              <span className="font-bold text-slate-400">Price / day</span> ₪
              {equipment.pricePerDay}
            </p>
            <p>
              <span className="font-bold text-slate-400">Stock</span>{" "}
              {equipment.availableQuantity}
            </p>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm ring-1 ring-brand-500/10">
            <h2 className="mb-4 text-lg font-black text-slate-900">Reserve</h2>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Start date
                </span>
                <input
                  className={input}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase text-slate-500">
                  End date
                </span>
                <input
                  className={input}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Quantity
                </span>
                <input
                  className={`${input} w-24`}
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition-colors hover:border-brand-300 hover:bg-brand-50"
                onClick={onCheckAvailability}
              >
                Check availability
              </button>
              <button
                type="button"
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-500/25 transition-colors hover:bg-brand-700"
                onClick={onBook}
              >
                Book now
              </button>
            </div>

            {availabilityError ? (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {availabilityError}
              </p>
            ) : null}

            {availabilityResult ? (
              <p
                className={`mt-4 text-sm font-semibold ${availabilityResult.available ? "text-emerald-600" : "text-rose-600"}`}
              >
                {availabilityResult.available
                  ? "Equipment is available for the selected dates."
                  : "Equipment is not available for the selected dates."}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
};

export default EquipmentDetailsView;
