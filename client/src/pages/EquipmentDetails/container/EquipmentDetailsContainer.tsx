import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EquipmentDetailsView from "../components/EquipmentDetailsView";
import { getEquipmentById, createBooking } from "../../../services/api";
import type { Equipment } from "../../../types";

const EquipmentDetailsContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

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
      } catch (err) {
        setError("Failed to load equipment details");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);

  const handleBooking = async () => {
    if (!equipment) return;

    try {
      await createBooking({
        equipmentId: equipment.id,
        quantity: quantity,
        startDate: "2026-03-10",
        endDate: "2026-03-12",
      });

      window.location.reload();
    } catch (err) {
      alert("Failed to create booking");
    }
  };

  if (loading) return <p>Loading equipment details...</p>;
  if (error) return <p>{error}</p>;
  if (!equipment) return <p>Equipment not found</p>;

  return (
  <EquipmentDetailsView
    equipment={equipment}
    quantity={quantity}
    setQuantity={setQuantity}
    onBook={handleBooking}
  />
);
};

export default EquipmentDetailsContainer;