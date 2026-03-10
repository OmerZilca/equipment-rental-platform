import React from "react";
import type { Equipment } from "../../../types";

type Props = {
  equipment: Equipment;
  quantity: number;
  setQuantity: (value: number) => void;
  onBook: () => void;
};

const EquipmentDetailsView: React.FC<Props> = ({
  equipment,
  quantity,
  setQuantity,
  onBook,
  message 
}) => {
  return (
    <div style={{ padding: "24px" }}>
      <h1>{equipment.name}</h1>
      {message && (
      <p style={{ color: "green", fontWeight: "bold" }}>
        {message}
      </p>
       )}
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
        <label>Quantity: </label>
        <input
          type="number"
          value={quantity}
          min={1}
          max={equipment.availableQuantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

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
    </div>
  );
};

export default EquipmentDetailsView;