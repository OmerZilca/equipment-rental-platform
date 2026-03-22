from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.store import StoreCreate, StoreOut, StoreListResponse
from app.services.stores_service import create_store_service, get_all_stores_service

router = APIRouter(prefix="/api/stores", tags=["stores"])


@router.post("", response_model=StoreOut)
def create_store(
    store: StoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    created_store = create_store_service(db, store, current_user.id)

    return StoreOut(
        id=created_store.id,
        ownerId=created_store.owner_id,
        storeName=created_store.store_name,
        description=created_store.description,
        address=created_store.address,
        openingHours=created_store.opening_hours,
    )


@router.get("", response_model=StoreListResponse)
def get_stores(db: Session = Depends(get_db)):
    stores = get_all_stores_service(db)

    return StoreListResponse(
        items=[
            StoreOut(
                id=s.id,
                ownerId=s.owner_id,
                storeName=s.store_name,
                description=s.description,
                address=s.address,
                openingHours=s.opening_hours,
            )
            for s in stores
        ],
        total=len(stores),
    )