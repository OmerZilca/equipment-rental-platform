from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models import Store, User
from app.schemas.store import StoreCreate


def create_store_service(db: Session, store_data: StoreCreate, user_id: int):
    owner = db.query(User).filter(User.id == user_id).first()

    if not owner:
        raise HTTPException(status_code=404, detail="User not found")

    if owner.role != "business_owner":
        raise HTTPException(
            status_code=403,
            detail="Only business owners can create stores"
        )

    new_store = Store(
        owner_id=user_id,
        store_name=store_data.storeName,
        description=store_data.description,
        address=store_data.address,
        opening_hours=store_data.openingHours,
    )

    db.add(new_store)
    db.commit()
    db.refresh(new_store)

    return new_store


def get_all_stores_service(db: Session):
    return db.query(Store).all()