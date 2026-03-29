"""User registration and listing (public).

- POST /api/users — create a new account.
- GET /api/users — list all users (count included).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserCreate, UserOut, UserListResponse
from app.services.users_service import create_user_service, get_users_service

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user_service(db, user)


@router.get("", response_model=UserListResponse)
def get_users(db: Session = Depends(get_db)):
    users = get_users_service(db)
    return UserListResponse(items=users, total=len(users))