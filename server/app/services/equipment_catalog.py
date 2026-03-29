"""Read-only helpers for the /api/equipment.

Products are exposed as “equipment” with camelCase fields (name, pricePerDay, etc.).
list_equipment — all products with store name loaded.
get_equipment_detail — one product by id, or None if missing.
"""

from sqlalchemy.orm import Session, joinedload

from app.db.models import Product


def _product_to_item(p: Product) -> dict:
    store_name = ""
    if p.store is not None:
        store_name = (p.store.store_name or "").strip()
    return {
        "id": p.id,
        "name": p.product_name,
        "category": (p.category or "Other").strip() or "Other",
        "pricePerDay": float(p.price_per_day),
        "availableQuantity": int(p.total_quantity),
        "imageUrl": (p.image_url or "").strip(),
        "storeId": int(p.store_id),
        "storeName": store_name,
    }


def list_equipment(db: Session) -> dict:
    products = (
        db.query(Product)
        .options(joinedload(Product.store))
        .order_by(Product.id)
        .all()
    )
    items = [_product_to_item(p) for p in products]
    return {"items": items, "total": len(items)}


def get_equipment_detail(db: Session, equipment_id: int) -> dict | None:
    p = (
        db.query(Product)
        .options(joinedload(Product.store))
        .filter(Product.id == equipment_id)
        .first()
    )
    if not p:
        return None
    return _product_to_item(p)
