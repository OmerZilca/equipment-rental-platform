/**
 * HTTP client for the FastAPI backend (axios).
 * Auth token and role live in `localStorage`; Bearer header is set on login.
 */
import axios from "axios";
import type { Equipment, EquipmentResponse } from "../types";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_ROLE_KEY = "auth_role";
const AUTH_FULL_NAME_KEY = "auth_full_name";

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
  localStorage.removeItem(AUTH_FULL_NAME_KEY);
  delete api.defaults.headers.common.Authorization;
  window.dispatchEvent(new Event("auth:changed"));
};

export const isLoggedIn = () => Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

export const isBusinessOwner = () =>
  localStorage.getItem(AUTH_ROLE_KEY) === "business_owner";

export const isCustomer = () =>
  localStorage.getItem(AUTH_ROLE_KEY) === "customer";

/** Display name for the header (set on login; refreshed if missing). */
export const getAuthDisplayName = (): string => {
  const name = localStorage.getItem(AUTH_FULL_NAME_KEY)?.trim();
  if (name) return name;
  return localStorage.getItem("auth_email")?.trim() ?? "";
};

/** Fetches `/api/auth/me` if token exists but role or display name is not cached. */
export const hydrateAuthRoleIfNeeded = async (): Promise<void> => {
  if (!isLoggedIn()) return;
  if (localStorage.getItem(AUTH_ROLE_KEY) && localStorage.getItem(AUTH_FULL_NAME_KEY))
    return;
  try {
    const me = await getCurrentUser();
    localStorage.setItem(AUTH_ROLE_KEY, me.role);
    localStorage.setItem(AUTH_FULL_NAME_KEY, me.fullName);
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

export type FulfillmentStatus =
  | "pending"
  | "picked_up"
  | "returned"
  | "not_picked_up";

export type BookingOut = {
  id: number;
  equipmentId: number;
  quantity: number;
  startDate: string;
  endDate: string;
  status: string;
  imageUrl: string;
  hasReview: boolean;
  canReview: boolean;
  fulfillmentStatus: FulfillmentStatus;
  returnedAt: string | null;
  customerName: string | null;
  damageNotes: string | null;
  damageReportedAt: string | null;
  /** Owner list only; true when damage may be filed or updated (24h + no later pickup). */
  damageReportAllowed?: boolean;
};

export type BookingListResponse = {
  items: BookingOut[];
  total: number;
};

/** Owner: all bookings across owned stores. */
export const getMyStoreBookings = async (): Promise<BookingListResponse> => {
  const response = await api.get<BookingListResponse>(
    "/api/bookings/store/mine"
  );
  return response.data;
};

export const updateBookingFulfillment = async (
  bookingId: number,
  fulfillmentStatus: FulfillmentStatus
): Promise<BookingOut> => {
  const response = await api.patch<BookingOut>(
    `/api/bookings/${bookingId}/fulfillment`,
    { fulfillmentStatus }
  );
  return response.data;
};

export const reportBookingDamage = async (
  bookingId: number,
  description: string
): Promise<BookingOut> => {
  const response = await api.patch<BookingOut>(
    `/api/bookings/${bookingId}/damage-report`,
    { description }
  );
  return response.data;
};

export const clearBookingDamageReport = async (
  bookingId: number
): Promise<BookingOut> => {
  const response = await api.delete<BookingOut>(
    `/api/bookings/${bookingId}/damage-report`
  );
  return response.data;
};

export type StoreStatsOut = {
  year: number;
  month: number;
  revenue: number;
  returnedBookingsCount: number;
  topProducts: { productId: number; productName: string; unitsRented: number }[];
};

export const getMyStoreStats = async (params: {
  year: number;
  month: number;
}): Promise<StoreStatsOut> => {
  const response = await api.get<StoreStatsOut>("/api/stores/mine/stats", {
    params: { year: params.year, month: params.month },
  });
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

/** Wish list: saved equipment for the signed-in user (any role). */
export const getWishlist = async (): Promise<EquipmentResponse> => {
  const response = await api.get<EquipmentResponse>("/api/wishlist");
  return response.data;
};

export const addToWishlist = async (
  equipmentId: number
): Promise<Equipment> => {
  const response = await api.post<Equipment>("/api/wishlist", {
    equipmentId,
  });
  return response.data;
};

export const removeFromWishlist = async (
  equipmentId: number
): Promise<void> => {
  await api.delete(`/api/wishlist/${equipmentId}`);
};

export type EquipmentReviewRow = {
  id: number;
  rating?: number | null;
  comment?: string | null;
  reviewerName: string;
  createdAt: string | null;
};

export type EquipmentReviewsResponse = {
  items: EquipmentReviewRow[];
  total: number;
  averageRating: number;
  reviewCount: number;
};

export const getEquipmentReviews = async (
  equipmentId: number
): Promise<EquipmentReviewsResponse> => {
  const response = await api.get<EquipmentReviewsResponse>(
    `/api/equipment/${equipmentId}/reviews`
  );
  return response.data;
};

export const submitBookingReview = async (body: {
  bookingId: number;
  rating?: number | null;
  comment?: string | null;
}): Promise<{
  id: number;
  bookingId: number;
  productId: number;
  rating?: number | null;
  comment?: string | null;
}> => {
  const response = await api.post("/api/reviews", body);
  return response.data;
};

/** Shared axios instance (base URL, default Bearer). */
export default api;