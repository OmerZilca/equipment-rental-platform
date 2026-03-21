from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserCreate
from app.services.users_service import create_user_service, get_users_service

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user_service(db, user)


@router.get("")
def get_users(db: Session = Depends(get_db)):
    return get_users_service(db)