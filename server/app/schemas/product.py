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


class ProductUpdate(BaseModel):
    productName: str | None = None
    description: str | None = None
    category: str | None = None
    pricePerDay: float | None = None
    depositAmount: float | None = None
    totalQuantity: int | None = None
    imageUrl: str | None = None


class ProductOut(BaseModel):
    id: int
    storeId: int
    productName: str
    description: str | None = None
    category: str | None = None
    pricePerDay: float
    depositAmount: float
    totalQuantity: int
    imageUrl: str | None = None

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: list[ProductOut]
    total: int

    class Config:
        from_attributes = True