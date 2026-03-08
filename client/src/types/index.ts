export interface Equipment {
  id: number;
  name: string;
  category: string;
  pricePerDay: number;
  availableQuantity: number;
  imageUrl: string;
}

export interface EquipmentResponse {
  items: Equipment[];
  total: number;
}