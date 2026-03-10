import React, { useEffect, useState } from "react";
import { getBookings } from "../../../services/api";

type Booking = {
  equipmentId: number;
  quantity: number;
  startDate: string;
  endDate: string;
};

const BookingsContainer: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getBookings();
        setBookings(data.items);
      } catch (err) {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h1>Bookings</h1>
      {bookings.map((booking, index) => (
        <div key={index}>
          <p>Equipment ID: {booking.equipmentId}</p>
          <p>Quantity: {booking.quantity}</p>
          <p>Start Date: {booking.startDate}</p>
          <p>End Date: {booking.endDate}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default BookingsContainer;