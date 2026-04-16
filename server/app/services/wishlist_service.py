"""Wish list: save equipment (products) for a logged-in user without booking."""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from fastapi import HTTPException

from app.db.models import WishlistItem, Product
from app.services.equipment_catalog import _product_to_item


def list_wishlist(db: Session, user_id: int) -> list[dict]:
    rows = (
        db.query(WishlistItem)
        .options(joinedload(WishlistItem.product).joinedload(Product.store))
        .filter(WishlistItem.user_id == user_id)
        .order_by(WishlistItem.id)
        .all()
    )
    out: list[dict] = []
    for w in rows:
        if w.product is None:
            continue
        out.append(_product_to_item(w.product))
    return out


def add_wishlist(db: Session, user_id: int, equipment_id: int) -> dict:
    p = (
        db.query(Product)
        .options(joinedload(Product.store))
        .filter(Product.id == equipment_id)
        .first()
    )
    if not p:
        raise HTTPException(status_code=404, detail="Equipment not found")

    existing = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == user_id,
            WishlistItem.product_id == equipment_id,
        )
        .first()
    )
    if existing:
        return _product_to_item(p)

    row = WishlistItem(user_id=user_id, product_id=equipment_id)
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    return _product_to_item(p)


def remove_wishlist(db: Session, user_id: int, equipment_id: int) -> None:
    row = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == user_id,
            WishlistItem.product_id == equipment_id,
        )
        .first()
    )
    if row:
        db.delete(row)
        db.commit()
