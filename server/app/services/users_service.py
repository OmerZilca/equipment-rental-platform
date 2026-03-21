from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models import User
from app.schemas.user import UserCreate


def create_user_service(db: Session, user: UserCreate):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        full_name=user.fullName,
        email=user.email,
        phone_number=user.phoneNumber,
        password_hash=user.password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "fullName": new_user.full_name,
        "email": new_user.email,
        "phoneNumber": new_user.phone_number,
        "role": new_user.role
    }


def get_users_service(db: Session):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
            "phoneNumber": user.phone_number,
            "role": user.role
        }
        for user in users
    ]