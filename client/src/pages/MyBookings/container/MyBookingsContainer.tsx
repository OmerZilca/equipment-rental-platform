/**
 * Customer bookings: load `/api/bookings/me`, split future/past, cancel with guards.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import MyBookingsView from "../components/MyBookingsView";
import {
  cancelBooking,
  getMyBookings,
  hydrateAuthRoleIfNeeded,
  isCustomer,
  isLoggedIn,
  submitBookingReview,
} from "../../../services/api";

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

function reviewApiError(err: unknown): string {
  if (!axios.isAxiosError(err)) return "";
  const d = err.response?.data as { detail?: unknown } | undefined;
  const detail = d?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "object" && item !== null && "msg" in item
          ? String((item as { msg: string }).msg)
          : ""
      )
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

const todayString = () => new Date().toISOString().split("T")[0];

const MyBookingsContainer: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

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

  const handleSubmitReview = async (
    rating: number | null,
    comment: string
  ) => {
    if (!reviewBooking) return;
    setReviewError("");
    setReviewSubmitting(true);
    try {
      await submitBookingReview({
        bookingId: reviewBooking.id,
        rating: rating ?? null,
        comment: comment.trim() === "" ? null : comment.trim(),
      });
      setReviewBooking(null);
      await fetchData();
    } catch (err) {
      setReviewError(
        reviewApiError(err) || "Could not submit your review. Try again."
      );
    } finally {
      setReviewSubmitting(false);
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
        reviewBooking={reviewBooking}
        onOpenReview={setReviewBooking}
        onCloseReview={() => {
          setReviewBooking(null);
          setReviewError("");
        }}
        onSubmitReview={handleSubmitReview}
        reviewSubmitting={reviewSubmitting}
        reviewError={reviewError}
      />
    </div>
  );
};

export default MyBookingsContainer;

