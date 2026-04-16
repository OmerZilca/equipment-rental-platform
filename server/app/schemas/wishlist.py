from pydantic import BaseModel


class WishlistAdd(BaseModel):
    equipmentId: int


class WishlistEquipmentOut(BaseModel):
    id: int
    name: str
    category: str
    pricePerDay: float
    availableQuantity: int
    imageUrl: str
    storeId: int
    storeName: str


class WishlistListResponse(BaseModel):
    items: list[WishlistEquipmentOut]
    total: int
