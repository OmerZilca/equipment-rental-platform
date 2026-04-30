/**
 * Equipment details — booking UI (presentation).
 */
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import type { Equipment } from "../../../types";
import type { EquipmentReviewRow } from "../../../services/api";

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
  wishlistLoggedIn: boolean;
  wishlistInList: boolean;
  wishlistBusy: boolean;
  wishlistError: string;
  onAddWishlist: () => void;
  onRemoveWishlist: () => void;
  equipmentReviews: EquipmentReviewRow[];
  reviewsLoading: boolean;
  reviewsError: string;
};

const input =
  "rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

const wishlistHeartBtnClass =
  "inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:opacity-45";

function AverageStarsRow({ average }: { average: number }) {
  const rounded = Math.min(5, Math.max(0, Math.round(average)));
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={18}
          strokeWidth={1.5}
          className={
            i <= rounded ? "fill-amber-400" : "fill-transparent opacity-30"
          }
        />
      ))}
    </span>
  );
}

function ReviewStars({ rating }: { rating: number | null | undefined }) {
  if (rating == null || rating < 1) return null;
  const r = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <span className="inline-flex gap-0.5 text-amber-400" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          strokeWidth={1.5}
          className={i <= r ? "fill-amber-400" : "fill-transparent opacity-30"}
        />
      ))}
    </span>
  );
}

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
  wishlistLoggedIn,
  wishlistInList,
  wishlistBusy,
  wishlistError,
  onAddWishlist,
  onRemoveWishlist,
  equipmentReviews,
  reviewsLoading,
  reviewsError,
}) => {
  const location = useLocation();
  const authReturnState = {
    from: `${location.pathname}${location.search}`,
  };
  const guestWishlistWrapRef = useRef<HTMLDivElement>(null);
  const [guestAuthPopoverOpen, setGuestAuthPopoverOpen] = useState(false);
  const guestAuthPopoverVisible = guestAuthPopoverOpen && !wishlistLoggedIn;

  useEffect(() => {
    if (!guestAuthPopoverVisible) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = guestWishlistWrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setGuestAuthPopoverOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [guestAuthPopoverVisible]);

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
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-400">Customer rating</span>
              {(equipment.reviewCount ?? 0) > 0 ? (
                <>
                  <AverageStarsRow average={equipment.averageRating ?? 0} />
                  <span className="font-semibold text-slate-800">
                    {(equipment.averageRating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-slate-500">
                    ({equipment.reviewCount} from renters)
                  </span>
                </>
              ) : (
                <span className="text-slate-500">No reviews yet</span>
              )}
            </p>
          </div>

          <div className="mb-6">
            {wishlistLoggedIn ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className={wishlistHeartBtnClass}
                  onClick={
                    wishlistInList ? onRemoveWishlist : onAddWishlist
                  }
                  disabled={wishlistBusy}
                  aria-pressed={wishlistInList}
                  aria-label={
                    wishlistInList
                      ? "Remove from wish list"
                      : "Add to wish list"
                  }
                  title={
                    wishlistInList
                      ? "Remove from wish list"
                      : "Add to wish list"
                  }
                >
                  <Heart
                    size={24}
                    strokeWidth={2}
                    className={
                      wishlistInList
                        ? "text-brand-600"
                        : "text-slate-400"
                    }
                    fill={wishlistInList ? "currentColor" : "none"}
                    aria-hidden
                  />
                </button>
                {wishlistError ? (
                  <p className="max-w-md rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                    {wishlistError}
                  </p>
                ) : null}
              </div>
            ) : (
              <div ref={guestWishlistWrapRef} className="relative inline-block">
                <button
                  type="button"
                  className={wishlistHeartBtnClass}
                  onClick={() =>
                    setGuestAuthPopoverOpen((open) => !open)
                  }
                  aria-expanded={guestAuthPopoverVisible}
                  aria-haspopup="true"
                  aria-label="Wish list — log in or register"
                  title="Wish list"
                >
                  <Heart
                    size={24}
                    strokeWidth={2}
                    className="text-slate-400"
                    fill="none"
                    aria-hidden
                  />
                </button>
                {guestAuthPopoverVisible ? (
                  <div
                    className="absolute left-0 top-[calc(100%+0.5rem)] z-30 min-w-[11rem] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
                    role="menu"
                    aria-label="Continue with account"
                  >
                    <Link
                      to="/login"
                      state={authReturnState}
                      role="menuitem"
                      onClick={() => setGuestAuthPopoverOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 no-underline transition-colors hover:bg-slate-100"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      state={authReturnState}
                      role="menuitem"
                      onClick={() => setGuestAuthPopoverOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-bold text-brand-600 no-underline transition-colors hover:bg-brand-50"
                    >
                      Register
                    </Link>
                  </div>
                ) : null}
              </div>
            )}
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

          <section
            id="customer-reviews"
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            aria-label="Renter feedback"
          >
            {reviewsLoading ? (
              <p className="text-sm font-medium text-slate-500">Loading reviews…</p>
            ) : null}
            {reviewsError ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {reviewsError}
              </p>
            ) : null}
            {!reviewsLoading && !reviewsError && equipmentReviews.length === 0 ? (
              <p className="text-sm text-slate-500">No feedback yet.</p>
            ) : null}
            <ul className="space-y-4">
              {equipmentReviews.map((rev) => (
                <li
                  key={rev.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  <div
                    className={`flex flex-wrap items-center gap-2 ${rev.comment ? "mb-1" : ""}`}
                  >
                    <ReviewStars rating={rev.rating} />
                    <span className="text-sm font-bold text-slate-900">
                      {rev.reviewerName}
                    </span>
                    {rev.createdAt ? (
                      <span className="text-xs text-slate-500">
                        {rev.createdAt.slice(0, 10)}
                      </span>
                    ) : null}
                  </div>
                  {rev.comment ? (
                    <p className="text-sm leading-relaxed text-slate-700">
                      {rev.comment}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
};

export default EquipmentDetailsView;
