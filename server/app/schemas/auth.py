from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginUserOut(BaseModel):
    id: int
    fullName: str
    email: str
    role: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    accessToken: str
    user: LoginUserOut

    class Config:
        from_attributes = True