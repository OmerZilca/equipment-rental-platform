import axios from "axios";
import type { Equipment, EquipmentResponse } from "../types";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getEquipmentList = async (): Promise<EquipmentResponse> => {
  const response = await api.get<EquipmentResponse>("/api/equipment");
  return response.data;
};

export const getEquipmentById = async (id: string): Promise<Equipment> => {
  const response = await api.get<Equipment>(`/api/equipment/${id}`);
  return response.data;
};
export const getBookings = async () => {
  const response = await api.get("/api/bookings");
  return response.data;
};

export const createBooking = async (booking: {
  equipmentId: number;
  quantity: number;
  startDate: string;
  endDate: string;
}) => {
  const response = await api.post("/api/bookings", booking);
  return response.data;
};
export default api;