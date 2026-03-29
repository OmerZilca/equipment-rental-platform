/**
 * HTTP client for the FastAPI backend (axios).
 * Auth token and role live in `localStorage`; Bearer header is set on login.
 */
import axios from "axios";
import type { Equipment, EquipmentResponse } from "../types";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_ROLE_KEY = "auth_role";

export type CurrentUser = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
};

export type StoreOut = {
  id: number;
  ownerId: number;
  storeName: string;
  description: string | null;
  address: string | null;
  openingHours: string | null;
  logoUrl: string | null;
};

export type StoreListResponse = {
  items: StoreOut[];
  total: number;
};

export type ProductOut = {
  id: number;
  storeId: number;
  productName: string;
  description: string | null;
  category: string | null;
  pricePerDay: number;
  depositAmount: number;
  totalQuantity: number;
  imageUrl: string | null;
};
/** Backend origin. Override with VITE_API_BASE_URL (e.g. http://localhost:8001). */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8001";

const api = axios.create({
  baseURL: API_BASE_URL,
});

const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
if (savedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
}

/** Auth: OAuth2-style login form, `/api/auth/me`, register, logout. */
export const login = async (email: string, password: string) => {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);

  const response = await api.post("/api/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const token = response.data?.access_token as string | undefined;
  if (!token) throw new Error("Login succeeded but token is missing");

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;

  return token;
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await api.get<CurrentUser>("/api/auth/me");
  return response.data;
};

export const register = async (user: {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: "customer" | "business_owner";
}) => {
  const response = await api.post("/api/users", user);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem("auth_email");
  localStorage.removeItem(AUTH_ROLE_KEY);
  delete api.defaults.headers.common.Authorization;
  window.dispatchEvent(new Event("auth:changed"));
};

export const isLoggedIn = () => Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

export const isBusinessOwner = () =>
  localStorage.getItem(AUTH_ROLE_KEY) === "business_owner";

export const isCustomer = () =>
  localStorage.getItem(AUTH_ROLE_KEY) === "customer";

/** Fetches `/api/auth/me` once per session if the token exists but role is not cached (e.g. older logins). */
export const hydrateAuthRoleIfNeeded = async (): Promise<void> => {
  if (!isLoggedIn() || localStorage.getItem(AUTH_ROLE_KEY)) return;
  try {
    const me = await getCurrentUser();
    localStorage.setItem(AUTH_ROLE_KEY, me.role);
    window.dispatchEvent(new Event("auth:changed"));
  } catch {
    /* token invalid or network */
  }
};

/** Stores: owner's stores, public list/detail, create, patch mine. */
export const getMyStores = async (): Promise<StoreListResponse> => {
  const response = await api.get<StoreListResponse>("/api/stores/mine");
  return response.data;
};

/** Public catalog of all stores (no auth). */
export const getPublicStores = async (): Promise<StoreListResponse> => {
  const response = await api.get<StoreListResponse>("/api/stores");
  return response.data;
};

export const getPublicStore = async (storeId: number): Promise<StoreOut> => {
  const response = await api.get<StoreOut>(`/api/stores/${storeId}`);
  return response.data;
};

export const createStore = async (body: {
  storeName: string;
  description?: string;
  address?: string;
  openingHours?: string;
  logoUrl?: string;
}): Promise<StoreOut> => {
  const response = await api.post<StoreOut>("/api/stores", body);
  return response.data;
};

export const updateMyStore = async (body: {
  storeName?: string;
  description?: string;
  address?: string;
  openingHours?: string;
  logoUrl?: string;
}): Promise<StoreOut> => {
  const response = await api.patch<StoreOut>("/api/stores/mine", body);
  return response.data;
};

/** Products: list mine, CRUD, optional image upload URL. */
export const getMyProducts = async (): Promise<{
  items: ProductOut[];
  total: number;
}> => {
  const response = await api.get<{ items: ProductOut[]; total: number }>(
    "/api/products/mine"
  );
  return response.data;
};

export const updateProduct = async (
  productId: number,
  body: {
    productName?: string;
    description?: string;
    category?: string;
    pricePerDay?: number;
    depositAmount?: number;
    totalQuantity?: number;
    imageUrl?: string;
  }
): Promise<ProductOut> => {
  const response = await api.patch<ProductOut>(
    `/api/products/${productId}`,
    body
  );
  return response.data;
};

export const deleteProduct = async (productId: number): Promise<void> => {
  await api.delete(`/api/products/${productId}`);
};

export const createProduct = async (body: {
  storeId: number;
  productName: string;
  description?: string;
  category?: string;
  pricePerDay: number;
  depositAmount: number;
  totalQuantity: number;
  imageUrl?: string;
}): Promise<ProductOut> => {
  const response = await api.post<ProductOut>("/api/products", body);
  return response.data;
};

/** Upload a product image; returns absolute URL to store on `imageUrl`. Business owners only. */
export const uploadProductImage = async (
  file: File
): Promise<{ url: string }> => {
  const form = new FormData();
  form.append("file", file);
  const response = await api.post<{ url: string }>(
    "/api/uploads/product-image",
    form
  );
  return response.data;
};

/** Equipment catalog (legacy `/api/equipment`) and customer bookings. */
export const getEquipmentList = async (): Promise<EquipmentResponse> => {
  const response = await api.get<EquipmentResponse>("/api/equipment");
  return response.data;
};
// Get a single equipment by ID
export const getEquipmentById = async (id: string): Promise<Equipment> => {
  const response = await api.get<Equipment>(`/api/equipment/${id}`);
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
export const getMyBookings = async () => {
  const response = await api.get("/api/bookings/me");
  return response.data;
};

export const cancelBooking = async (bookingId: number) => {
  const response = await api.patch(`/api/bookings/${bookingId}/cancel`);
  return response.data;
};

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

/** Shared axios instance (base URL, default Bearer). */
export default api;