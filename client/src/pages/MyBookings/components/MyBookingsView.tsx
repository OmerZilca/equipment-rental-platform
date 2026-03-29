/**
 * Lists current, upcoming, and past bookings; cancel button for eligible rows.
 */
import React from "react";

type Booking = {
  id: number;
  equipmentId: number;
  quantity: number;
  startDate: string;
  endDate: string;
  status: string;
};

type Props = {
  current: Booking[];
  future: Booking[];
  history: Booking[];
  onCancel: (bookingId: number) => void;
  cancellingId: number | null;
  successMessage: string;
};

const BookingCard: React.FC<{
  booking: Booking;
  showCancel: boolean;
  onCancel: (bookingId: number) => void;
  cancellingId: number | null;
}> = ({ booking, showCancel, onCancel, cancellingId }) => (
  <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
  </div>
);

const MyBookingsView: React.FC<Props> = ({
  current,
  future,
  history,
  onCancel,
  cancellingId,
  successMessage,
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
          />
        ))}
      </section>
    </div>
  );
};

export default MyBookingsView;
