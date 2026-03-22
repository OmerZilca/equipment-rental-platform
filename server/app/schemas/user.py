from pydantic import BaseModel


class UserCreate(BaseModel):
    fullName: str
    email: str
    phoneNumber: str | None = None
    password: str
    role: str


class UserOut(BaseModel):
    id: int
    fullName: str
    email: str
    phoneNumber: str | None = None
    role: str

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    items: list[UserOut]
    total: int

    class Config:
        from_attributes = True