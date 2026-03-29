/**
 * Customer bookings: load `/api/bookings/me`, split future/past, cancel with guards.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MyBookingsView from "../components/MyBookingsView";
import {
  cancelBooking,
  getMyBookings,
  hydrateAuthRoleIfNeeded,
  isCustomer,
  isLoggedIn,
} from "../../../services/api";

type Booking = {
  id: number;
  equipmentId: number;
  quantity: number;
  startDate: string;
  endDate: string;
  status: string;
};

const todayString = () => new Date().toISOString().split("T")[0];

const MyBookingsContainer: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyBookings();
      setBookings(data.items ?? []);
    } catch {
      setError("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isLoggedIn()) {
        setLoading(false);
        navigate("/login", { replace: true });
        return;
      }
      await hydrateAuthRoleIfNeeded();
      if (cancelled) return;
      if (!isCustomer()) {
        setLoading(false);
        navigate("/", { replace: true });
        return;
      }
      await fetchData();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [navigate, fetchData]);

  const { current, future, history } = useMemo(() => {
    const today = todayString();
    const currentItems: Booking[] = [];
    const futureItems: Booking[] = [];
    const historyItems: Booking[] = [];

    bookings.forEach((b) => {
      if (b.status === "cancelled" || b.endDate < today) {
        historyItems.push(b);
      } else if (b.startDate > today) {
        futureItems.push(b);
      } else {
        currentItems.push(b);
      }
    });

    return { current: currentItems, future: futureItems, history: historyItems };
  }, [bookings]);

  const handleCancel = async (bookingId: number) => {
    setCancellingId(bookingId);
    setSuccessMessage("");
    try {
      await cancelBooking(bookingId);
      await fetchData();
      const email = localStorage.getItem("auth_email") || "current user";
      setSuccessMessage(`Booking #${bookingId} for ${email} was cancelled.`);
    } catch {
      alert("Cancel failed.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm font-medium text-slate-500">
        Loading your bookings…
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <Link
        to="/"
        className="mb-6 inline-flex text-sm font-bold text-slate-500 no-underline hover:text-brand-600"
      >
        ← Back to equipment
      </Link>
      <MyBookingsView
        current={current}
        future={future}
        history={history}
        onCancel={handleCancel}
        cancellingId={cancellingId}
        successMessage={successMessage}
      />
    </div>
  );
};

export default MyBookingsContainer;

