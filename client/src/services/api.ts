import axios from "axios";
import type { EquipmentResponse } from "../types";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getEquipmentList = async (): Promise<EquipmentResponse> => {
  const response = await api.get<EquipmentResponse>("/api/equipment");
  return response.data;
};

export default api;