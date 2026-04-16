from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    equipmentId: int
    quantity: int
    startDate: date
    endDate: date


class BookingOut(BaseModel):
    id: int
    equipmentId: int
    quantity: int
    startDate: date
    endDate: date
    status: str
    imageUrl: str = ""
    hasReview: bool = False
    canReview: bool = False
    fulfillmentStatus: str = "pending"
    returnedAt: datetime | None = None
    customerName: str | None = None
    damageNotes: str | None = None
    damageReportedAt: datetime | None = None
    damageReportAllowed: bool = False

    class Config:
        from_attributes = True


FulfillmentStatus = Literal["pending", "picked_up", "returned"]


class BookingFulfillmentUpdate(BaseModel):
    fulfillmentStatus: FulfillmentStatus


class BookingDamageReportUpdate(BaseModel):
    description: str = Field(..., min_length=1, max_length=4000)


class TopProductRow(BaseModel):
    productId: int
    productName: str
    unitsRented: int


class StoreStatsOut(BaseModel):
    year: int
    month: int
    revenue: float
    returnedBookingsCount: int
    topProducts: list[TopProductRow]


class BookingListResponse(BaseModel):
    items: list[BookingOut]
    total: int

    class Config:
        from_attributes = True


class AvailabilityResponse(BaseModel):
    equipmentId: int
    available: bool
    requestedQuantity: int
    availableQuantity: int
    overlappingQuantity: int

    class Config:
        from_attributes = True