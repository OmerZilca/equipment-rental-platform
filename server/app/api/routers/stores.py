"""Rental stores: create, list, and update.

- POST /api/stores — create a store (logged-in user becomes owner).
- GET /api/stores/mine — stores owned by the current user.
- PATCH /api/stores/mine — update the owner’s store.
- GET /api/stores — list all stores (public).
- GET /api/stores/{store_id} — one store’s public profile (404 if missing).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models import Store, User
from app.schemas.store import StoreCreate, StoreOut, StoreListResponse, StoreUpdate
from app.services.stores_service import (
    create_store_service,
    get_all_stores_service,
    get_stores_for_owner,
    update_store_for_owner,
)

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
        logoUrl=created_store.logo_url,
    )


@router.patch("/mine", response_model=StoreOut)
def patch_my_store(
    updates: StoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store = update_store_for_owner(db, current_user.id, updates)
    return StoreOut(
        id=store.id,
        ownerId=store.owner_id,
        storeName=store.store_name,
        description=store.description,
        address=store.address,
        openingHours=store.opening_hours,
        logoUrl=store.logo_url,
    )


@router.get("/mine", response_model=StoreListResponse)
def get_my_stores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stores = get_stores_for_owner(db, current_user.id)

    return StoreListResponse(
        items=[
            StoreOut(
                id=s.id,
                ownerId=s.owner_id,
                storeName=s.store_name,
                description=s.description,
                address=s.address,
                openingHours=s.opening_hours,
                logoUrl=s.logo_url,
            )
            for s in stores
        ],
        total=len(stores),
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
                logoUrl=s.logo_url,
            )
            for s in stores
        ],
        total=len(stores),
    )


@router.get("/{store_id}", response_model=StoreOut)
def get_public_store(store_id: int, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return StoreOut(
        id=store.id,
        ownerId=store.owner_id,
        storeName=store.store_name,
        description=store.description,
        address=store.address,
        openingHours=store.opening_hours,
        logoUrl=store.logo_url,
    )