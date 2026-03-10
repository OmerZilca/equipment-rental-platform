
from enum import Enum
from pydantic import BaseModel


class EquipmentOut(BaseModel):
    id: int
    name: str
    category: str
    pricePerDay: float
    availableQuantity: int
    imageUrl: str


class EquipmentListResponse(BaseModel):
    items: list[EquipmentOut]
    total: int


class UserRole(str, Enum):
    GUEST = "guest"
    CUSTOMER = "customer"
    STORE_OWNER = "store_owner"


class UserOut(BaseModel):
    id: int
    fullName: str
    email: str
    role: UserRole

class BookingCreate(BaseModel):
    equipmentId: int
    quantity: int
    startDate: str
    endDate: str