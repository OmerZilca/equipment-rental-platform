/**
 * Equipment details view component.
 *
 * Displays equipment information, allows the user to select dates and quantity,
 * check availability, and create a booking.
 * This component is responsible only for UI (presentation).
 */
import React from "react";
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
        <div style={{ padding: "24px" }}>
          <h1>{equipment.name}</h1>
          <p>
            <strong>Category:</strong> {equipment.category}
          </p>

          <p>
            <strong>Price per day:</strong> ₪{equipment.pricePerDay}
          </p>

          <p>
            <strong>Available:</strong> {equipment.availableQuantity}
          </p>

          <div>
            <strong>Image:</strong>
            <br />
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              style={{ width: "300px", marginTop: "12px", borderRadius: "8px" }}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
      <label>Start Date: </label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
    </div>

    <div style={{ marginTop: "10px" }}>
      <label>End Date: </label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </div>

      <button
  onClick={onCheckAvailability}
  style={{
    marginTop: "20px",
    marginRight: "10px",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#16a34a",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  Check Availability
</button>

<button
  onClick={onBook}
  style={{
    marginTop: "20px",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  Book Now
</button>
{availabilityError && (
  <p style={{ color: "red", marginTop: "12px" }}>
    {availabilityError}
  </p>
)}

{availabilityResult && (
  <p style={{ color: availabilityResult.available ? "green" : "red", marginTop: "12px" }}>
    {availabilityResult.available
      ? "Equipment is available for the selected dates"
      : "Equipment is not available for the selected dates"}
  </p>
)}
    </div>
  );
};

export default EquipmentDetailsView;