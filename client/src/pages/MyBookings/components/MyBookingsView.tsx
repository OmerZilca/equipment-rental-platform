/**
 * Lists current, upcoming, and past bookings; cancel button for eligible rows.
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

type Booking = {
  id: number;
  equipmentId: number;
  quantity: number;
  startDate: string;
  endDate: string;
  status: string;
  imageUrl?: string;
  hasReview?: boolean;
  canReview?: boolean;
};

type Props = {
  current: Booking[];
  future: Booking[];
  history: Booking[];
  onCancel: (bookingId: number) => void;
  cancellingId: number | null;
  successMessage: string;
  reviewBooking: Booking | null;
  onOpenReview: (booking: Booking) => void;
  onCloseReview: () => void;
  onSubmitReview: (rating: number | null, comment: string) => void;
  reviewSubmitting: boolean;
  reviewError: string;
};

const thumbWrap =
  "relative block h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

const BookingCard: React.FC<{
  booking: Booking;
  showCancel: boolean;
  onCancel: (bookingId: number) => void;
  cancellingId: number | null;
  showReviewCta?: boolean;
  onOpenReview?: (booking: Booking) => void;
}> = ({
  booking,
  showCancel,
  onCancel,
  cancellingId,
  showReviewCta,
  onOpenReview,
}) => {
  const img = (booking.imageUrl ?? "").trim();
  const detailHref =
    booking.equipmentId > 0 ? `/equipment/${booking.equipmentId}` : "#";

  return (
    <div className="mb-3 flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {booking.equipmentId > 0 ? (
        <Link
          to={detailHref}
          className={thumbWrap}
          aria-label="Open equipment details to book again or review"
        >
          {img ? (
            <img
              src={img}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">
              No photo
            </span>
          )}
        </Link>
      ) : (
        <div className={thumbWrap} aria-hidden>
          <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400">
            —
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-700">
          <strong className="text-slate-900">Booking ID:</strong> {booking.id}
        </p>
        <p className="text-sm text-slate-700">
          <strong className="text-slate-900">Equipment ID:</strong>{" "}
          {booking.equipmentId}
        </p>
        <p className="text-sm text-slate-700">
          <strong className="text-slate-900">Quantity:</strong> {booking.quantity}
        </p>
        <p className="text-sm text-slate-700">
          <strong className="text-slate-900">Dates:</strong> {booking.startDate} –{" "}
          {booking.endDate}
        </p>
        <p className="text-sm text-slate-700">
          <strong className="text-slate-900">Status:</strong> {booking.status}
        </p>
        {showCancel ? (
          <button
            type="button"
            className="mt-3 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
            onClick={() => onCancel(booking.id)}
            disabled={cancellingId === booking.id}
          >
            {cancellingId === booking.id ? "Cancelling..." : "Cancel booking"}
          </button>
        ) : null}
        {showReviewCta && onOpenReview ? (
          <button
            type="button"
            className="mt-3 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-brand-800 transition-colors hover:bg-brand-100 sm:w-auto"
            onClick={() => onOpenReview(booking)}
          >
            Rate &amp; review
          </button>
        ) : null}
      </div>
    </div>
  );
};

const ReviewModal: React.FC<{
  booking: Booking;
  onClose: () => void;
  onSubmit: (rating: number | null, comment: string) => void;
  submitting: boolean;
  error: string;
}> = ({ booking, onClose, onSubmit, submitting, error }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setRating(null);
    setComment("");
  }, [booking.id]);

  const canSend =
    !submitting &&
    (rating !== null || comment.trim().length >= 3);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="review-modal-title"
          className="mb-1 text-lg font-black text-slate-900"
        >
          Rate &amp; review
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Booking #{booking.id} · equipment #{booking.equipmentId}
        </p>

        <p className="mb-1 text-xs font-bold uppercase text-slate-500">
          Rating <span className="font-medium normal-case text-slate-400">(optional)</span>
        </p>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="rounded-lg p-1 text-amber-400 transition-transform hover:scale-110"
                onClick={() => setRating(n)}
                aria-label={`${n} stars`}
              >
                <Star
                  size={28}
                  strokeWidth={1.5}
                  className={
                    rating !== null && n <= rating
                      ? "fill-amber-400"
                      : "fill-transparent opacity-40"
                  }
                />
              </button>
            ))}
          </div>
          {rating !== null ? (
            <button
              type="button"
              className="text-xs font-bold text-slate-500 underline decoration-slate-300 hover:text-slate-800"
              onClick={() => setRating(null)}
            >
              Clear stars
            </button>
          ) : null}
        </div>

        <label className="mb-4 flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase text-slate-500">
            Your review{" "}
            <span className="font-medium normal-case text-slate-400">(optional)</span>
          </span>
          <textarea
            className="min-h-[100px] rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            placeholder="At least 3 characters if you skip stars…"
          />
        </label>

        {error ? (
          <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
            disabled={!canSend}
            onClick={() => onSubmit(rating, comment)}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MyBookingsView: React.FC<Props> = ({
  current,
  future,
  history,
  onCancel,
  cancellingId,
  successMessage,
  reviewBooking,
  onOpenReview,
  onCloseReview,
  onSubmitReview,
  reviewSubmitting,
  reviewError,
}) => {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">
        My Bookings
      </h1>
      {successMessage ? (
        <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
          {successMessage}
        </p>
      ) : null}

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-slate-900">
          Current bookings
        </h2>
        {current.length === 0 ? (
          <p className="text-sm text-slate-500">No current bookings.</p>
        ) : null}
        {current.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            showCancel={false}
            onCancel={onCancel}
            cancellingId={cancellingId}
          />
        ))}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-slate-900">
          Future bookings
        </h2>
        {future.length === 0 ? (
          <p className="text-sm text-slate-500">No future bookings.</p>
        ) : null}
        {future.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            showCancel={booking.status !== "cancelled"}
            onCancel={onCancel}
            cancellingId={cancellingId}
          />
        ))}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-slate-900">
          Booking history
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">No booking history.</p>
        ) : null}
        {history.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            showCancel={false}
            onCancel={onCancel}
            cancellingId={cancellingId}
            showReviewCta={Boolean(booking.canReview && !booking.hasReview)}
            onOpenReview={onOpenReview}
          />
        ))}
      </section>

      {reviewBooking ? (
        <ReviewModal
          booking={reviewBooking}
          onClose={onCloseReview}
          onSubmit={onSubmitReview}
          submitting={reviewSubmitting}
          error={reviewError}
        />
      ) : null}
    </div>
  );
};

export default MyBookingsView;
