from pydantic import BaseModel


class ProductCreate(BaseModel):
    storeId: int
    productName: str
    description: str | None = None
    category: str | None = None
    pricePerDay: float
    depositAmount: float
    totalQuantity: int
    imageUrl: str | None = None


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