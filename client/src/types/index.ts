export interface Equipment {
  id: number;
  name: string;
  category: string;
  pricePerDay: number;
  availableQuantity: number;
  imageUrl: string;
  storeId: number;
  storeName: string;
  /** From booking-based reviews only; 0 when none. */
  averageRating?: number;
  reviewCount?: number;
}

export interface EquipmentResponse {
  items: Equipment[];
  total: number;
}