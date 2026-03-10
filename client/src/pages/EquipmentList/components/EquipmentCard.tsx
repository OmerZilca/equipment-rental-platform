import React from "react";
import { Link } from "react-router-dom";
import type { Equipment } from "../../../types";

type Props = {
  equipment: Equipment;
};

const EquipmentCard: React.FC<Props> = ({ equipment }) => {
  return (
    <Link
      to={`/equipment/${equipment.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        padding: "16px",
        width: "220px",
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
      }}
    >
        <img
          src={equipment.imageUrl}
          alt={equipment.name}
          style={{
            width: "100%",
            height: "140px",
            objectFit: "cover",
            borderRadius: "8px",
            marginBottom: "12px",
          }}
        />

        <h3>{equipment.name}</h3>
        <p>{equipment.category}</p>
        <p>${equipment.pricePerDay} per day</p>
        <p>Available: {equipment.availableQuantity}</p>

        <button
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Book
        </button>
      </div>
    </Link>
  );
};

export default EquipmentCard;