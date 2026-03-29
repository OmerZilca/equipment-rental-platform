from pydantic import BaseModel
from datetime import date


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

    class Config:
        from_attributes = True


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