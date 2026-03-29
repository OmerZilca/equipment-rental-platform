"""Store records for business owners.

create_store_service — one store per business_owner account; saves name, address, hours, logo.
get_all_stores_service — every store.
get_stores_for_owner — stores owned by a user id.
update_store_for_owner — partial update for the logged-in owner’s store (name cannot become empty).
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models import Store, User
from app.schemas.store import StoreCreate, StoreUpdate


def create_store_service(db: Session, store_data: StoreCreate, user_id: int):
    owner = db.query(User).filter(User.id == user_id).first()

    if not owner:
        raise HTTPException(status_code=404, detail="User not found")

    if owner.role != "business_owner":
        raise HTTPException(
            status_code=403,
            detail="Only business owners can create stores"
        )

    if db.query(Store).filter(Store.owner_id == user_id).first():
        raise HTTPException(
            status_code=400,
            detail="You already have a store. Only one store per account is allowed.",
        )

    new_store = Store(
        owner_id=user_id,
        store_name=store_data.storeName,
        description=store_data.description,
        address=store_data.address,
        opening_hours=store_data.openingHours,
        logo_url=store_data.logoUrl,
    )

    db.add(new_store)
    db.commit()
    db.refresh(new_store)

    return new_store


def get_all_stores_service(db: Session):
    return db.query(Store).all()


def get_stores_for_owner(db: Session, owner_id: int):
    return db.query(Store).filter(Store.owner_id == owner_id).all()


def update_store_for_owner(db: Session, user_id: int, data: StoreUpdate):
    owner = db.query(User).filter(User.id == user_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="User not found")
    if owner.role != "business_owner":
        raise HTTPException(
            status_code=403,
            detail="Only business owners can update stores",
        )

    store = db.query(Store).filter(Store.owner_id == user_id).first()
    if not store:
        raise HTTPException(
            status_code=404,
            detail="No store found for this account",
        )

    patch = data.model_dump(exclude_unset=True)
    if "storeName" in patch:
        name = (patch["storeName"] or "").strip()
        if not name:
            raise HTTPException(
                status_code=400,
                detail="Store name cannot be empty",
            )
        store.store_name = name
    def _opt_str(v):
        if v is None:
            return None
        if isinstance(v, str) and not v.strip():
            return None
        return v

    if "description" in patch:
        store.description = _opt_str(patch["description"])
    if "address" in patch:
        store.address = _opt_str(patch["address"])
    if "openingHours" in patch:
        store.opening_hours = _opt_str(patch["openingHours"])
    if "logoUrl" in patch:
        store.logo_url = _opt_str(patch["logoUrl"])

    db.commit()
    db.refresh(store)
    return store