from pydantic import BaseModel
from datetime import date


class BookingItemCreate(BaseModel):
    productId: int
    quantity: int


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


class AvailabilityResponse(BaseModel):
    available: bool