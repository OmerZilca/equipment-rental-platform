/**
 * Equipment detail route: fetch by id, check availability, create booking; drives the view.
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import EquipmentDetailsView from "../components/EquipmentDetailsView";
import {
  getEquipmentById,
  createBooking,
  checkAvailability,
  isLoggedIn,
  isBusinessOwner,
} from "../../../services/api";
import type { Equipment } from "../../../types";

function apiErrorDetail(err: unknown): string {
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

function bookingFailureMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return "We could not complete your booking. Check your internet connection and try again.";
  }
  const status = err.response?.status;
  const detail = apiErrorDetail(err);

  if (status === 401) {
    return (
      "You need to sign in to place a booking. " +
      "We tie each rental to your account for confirmations and so you can see it under My bookings. " +
      "Use Log in in the header, then try again."
    );
  }
  if (status === 403) {
    if (detail) return detail;
    return "You do not have permission to create this booking.";
  }
  if (status === 404) {
    return (
      detail ||
      "This item or your account could not be found. Refresh the page or sign in again."
    );
  }
  if (status === 400) {
    return detail || "Some booking details are invalid. Check your dates and quantity.";
  }
  return detail || "We could not complete your booking. Please try again.";
}

const EquipmentDetailsContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
 // State for equipment data and page status
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for booking form values
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // State for availability check result and error message
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityResult, setAvailabilityResult] = useState<null | {
    equipmentId: number;
    available: boolean;
    requestedQuantity: number;
    availableQuantity: number;
    overlappingQuantity: number;
  }>(null);
  
  // Fetch equipment details when the page loads or when the ID changes
  useEffect(() => {
    const fetchEquipment = async () => {
      if (!id) {
        setError("Equipment ID is missing");
        setLoading(false);
        return;
      }

      try {
        const data = await getEquipmentById(id);
        setEquipment(data);
      } catch {
        setError("Failed to load equipment details");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);
  // Check equipment availability for selected dates and quantity
  const handleCheckAvailability = async () => {
    if (!equipment) return;

    if (!startDate || !endDate) {
      setAvailabilityError("Please select start and end dates");
      setAvailabilityResult(null);
      return;
    }

    try {
      const result = await checkAvailability(
        equipment.id,
        startDate,
        endDate,
        quantity
      );

      setAvailabilityResult(result);
      setAvailabilityError("");
    } catch (err) {
      const detail = apiErrorDetail(err);
      setAvailabilityError(
        detail ||
          "We could not check availability. Verify your dates and connection, then try again."
      );
      setAvailabilityResult(null);
    }
  };
  // Create a booking for the selected equipment

  const handleBooking = async () => {
    if (!equipment) return;

    if (!startDate || !endDate) {
      alert(
        "Please choose a start date and an end date before booking. You can use Check availability first to see if the item is free."
      );
      return;
    }

    if (!isLoggedIn()) {
      alert(
        "Sign in required\n\n" +
          "Only signed-in users can complete a booking. " +
          "We need your account to confirm the rental and to list it under My bookings.\n\n" +
          "Open Log in in the header (or create an account as a customer), then return here and try Book now again."
      );
      return;
    }

    if (isBusinessOwner()) {
      alert(
        "Customer account required\n\n" +
          "Equipment bookings are for customer accounts only. " +
          "As a store owner you manage inventory under My store—you cannot rent other stores’ gear with this login.\n\n" +
          "Sign out and sign in with a customer account, or register a separate customer profile to rent equipment."
      );
      return;
    }

    try {
      await createBooking({
        equipmentId: equipment.id,
        quantity: quantity,
        startDate: startDate,
        endDate: endDate,
      });

      alert("Booking created successfully. You can review it under My bookings.");
    } catch (err) {
      alert(bookingFailureMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm font-medium text-slate-500">
        Loading equipment details…
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      </div>
    );
  }
  if (!equipment) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <p className="text-slate-500">Equipment not found.</p>
      </div>
    );
  }
  // Pass data and actions to the view component
  return (
  <EquipmentDetailsView
    equipment={equipment}
    quantity={quantity}
    setQuantity={setQuantity}
    startDate={startDate}
    setStartDate={setStartDate}
    endDate={endDate}
    setEndDate={setEndDate}
    onBook={handleBooking}
    onCheckAvailability={handleCheckAvailability}
    availabilityResult={availabilityResult}
    availabilityError={availabilityError}
  />
);
};

export default EquipmentDetailsContainer;