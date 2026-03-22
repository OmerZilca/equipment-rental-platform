from pydantic import BaseModel


class StoreCreate(BaseModel):
    storeName: str
    description: str | None = None
    address: str | None = None
    openingHours: str | None = None


class StoreOut(BaseModel):
    id: int
    ownerId: int
    storeName: str
    description: str | None = None
    address: str | None = None
    openingHours: str | None = None

    class Config:
        from_attributes = True


class StoreListResponse(BaseModel):
    items: list[StoreOut]
    total: int

    class Config:
        from_attributes = True