import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EquipmentDetailsView from "../components/EquipmentDetailsView";
import { getEquipmentById, createBooking, checkAvailability } from "../../../services/api";
import type { Equipment } from "../../../types";

const EquipmentDetailsContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityResult, setAvailabilityResult] = useState<null | {
    equipmentId: number;
    available: boolean;
    requestedQuantity: number;
    availableQuantity: number;
    overlappingQuantity: number;
  }>(null);

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
      setAvailabilityError("Failed to check availability");
      setAvailabilityResult(null);
    }
  };

  const handleBooking = async () => {
    if (!equipment) return;

    try {
      await createBooking({
        equipmentId: equipment.id,
        quantity: quantity,
        startDate: startDate,
        endDate: endDate,
      });

      alert("Booking created successfully");
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