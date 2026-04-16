"""Wish list API: logged-in users save equipment without booking.

- GET /api/wishlist — list saved items (camelCase equipment shape).
- POST /api/wishlist — body `{ equipmentId }`; idempotent if already saved.
- DELETE /api/wishlist/{equipment_id} — remove; idempotent (204 even if missing).
"""
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.wishlist import WishlistAdd, WishlistEquipmentOut, WishlistListResponse
from app.services import wishlist_service

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.get("", response_model=WishlistListResponse)
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = wishlist_service.list_wishlist(db, current_user.id)
    return WishlistListResponse(items=items, total=len(items))


@router.post("", response_model=WishlistEquipmentOut)
def add_to_wishlist(
    body: WishlistAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return wishlist_service.add_wishlist(db, current_user.id, body.equipmentId)


@router.delete("/{equipment_id}", status_code=204)
def remove_from_wishlist(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wishlist_service.remove_wishlist(db, current_user.id, equipment_id)
    return Response(status_code=204)
