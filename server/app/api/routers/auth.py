"""Auth API routes: sign in and read the logged-in user.

- POST /api/auth/login — OAuth2 form with password; put the user’s email in the
  username field. Returns an access token for later requests.
- GET /api/auth/me — returns the current user profile; requires a valid token.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.user import UserOut
from app.services.auth_service import login_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    return login_service(db, form_data)


@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=current_user.id,
        fullName=current_user.full_name,
        email=current_user.email,
        phoneNumber=current_user.phone_number,
        role=current_user.role,
    )