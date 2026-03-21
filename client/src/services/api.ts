/**
 * API service layer.
 *REACT "IS TOKING" TO FASTAPI
 * Handles all communication with the backend server using axios.
 * Defines functions for fetching equipment, bookings,
 * creating bookings, and checking availability.
 */
import axios from "axios";
import type { Equipment, EquipmentResponse } from "../types";
// Create axios instance with base URL of the backend
const api = axios.create({
  baseURL: "http://localhost:8000",
});
// Get list of all equipment
export const getEquipmentList = async (): Promise<EquipmentResponse> => {
  const response = await api.get<EquipmentResponse>("/api/equipment");
  return response.data;
};
// Get a single equipment by ID
export const getEquipmentById = async (id: string): Promise<Equipment> => {
  const response = await api.get<Equipment>(`/api/equipment/${id}`);
  return response.data;
};
// Create a new booking
export const createBooking = async (booking: {
  equipmentId: number;
  quantity: number;
  startDate: string;
  endDate: string;
}) => {
  const response = await api.post("/api/bookings", booking);
  return response.data;
};
// Get all bookings
export const getBookings = async () => {
  const response = await api.get("/api/bookings");
  return response.data;
};
// Check availability of equipment for given dates and quantity
export const checkAvailability = async (
  equipmentId: number,
  startDate: string,
  endDate: string,
  quantity: number
) => {
  const response = await api.get("/api/bookings/check-availability", {
    params: {
      equipment_id: equipmentId,
      start_date: startDate,
      end_date: endDate,
      quantity: quantity,
    },
  });

  return response.data;
};

export default api;