from enum import Enum
from pydantic import BaseModel
from datetime import date


class ProductOut(BaseModel):
    id: int
    storeId: int
    productName: str
    description: str | None
    category: str | None
    pricePerDay: float
    depositAmount: float
    totalQuantity: int
    imageUrl: str | None


class ProductListResponse(BaseModel):
    items: list[ProductOut]
    total: int


class BookingItemCreate(BaseModel):
    productId: int
    quantity: int

#Validation
class BookingCreate(BaseModel):
    customerId: int
    storeId: int
    startDate: date
    endDate: date
    items: list[BookingItemCreate]


class BookingItemOut(BaseModel):
    productId: int
    quantity: int
    pricePerDay: float
    depositAmount: float


class BookingOut(BaseModel):
    id: int
    customerId: int
    storeId: int
    startDate: date
    endDate: date
    status: str
    totalPrice: float
    depositAmount: float
    items: list[BookingItemOut]