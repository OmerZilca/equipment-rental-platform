"""Create or refresh demo users, stores, and seeded products (multi-store catalog)."""

from sqlalchemy.orm import Session

from app.catalog_seed import DEMO_BUSINESSES, default_public_base, upload_file_url
from app.core.security import get_password_hash, verify_password
from app.db import models
from app.db.database import SessionLocal

_DEMO_PASSWORD = "123456"


def run_demo_seed(public_base: str | None = None) -> None:
    base = (public_base or default_public_base()).rstrip("/")
    db = SessionLocal()
    try:
        _run_demo_seed_session(db, base)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def _run_demo_seed_session(db: Session, public_base: str) -> None:
    customer = db.query(models.User).filter(models.User.email == "customer@example.com").first()
    if not customer:
        customer = models.User(
            full_name="Demo Customer",
            email="customer@example.com",
            phone_number="0500000001",
            password_hash=get_password_hash(_DEMO_PASSWORD),
            role="customer",
        )
        db.add(customer)
        db.flush()
    else:
        # If the demo user exists with an unknown/legacy hash, refresh it so login works.
        if not verify_password(_DEMO_PASSWORD, customer.password_hash):
            customer.password_hash = get_password_hash(_DEMO_PASSWORD)

    for biz in DEMO_BUSINESSES:
        _seed_one_business(db, public_base, biz)


def _seed_one_business(db: Session, public_base: str, biz: dict) -> None:
    owner = db.query(models.User).filter(models.User.email == biz["owner_email"]).first()
    if not owner:
        owner = models.User(
            full_name=biz["owner_full_name"],
            email=biz["owner_email"],
            phone_number=biz["owner_phone"],
            password_hash=get_password_hash(_DEMO_PASSWORD),
            role="business_owner",
        )
        db.add(owner)
        db.flush()
    else:
        # Same for owners: keep demo accounts loginable across schema/hash changes.
        if not verify_password(_DEMO_PASSWORD, owner.password_hash):
            owner.password_hash = get_password_hash(_DEMO_PASSWORD)

    store_meta = biz["store"]
    store = db.query(models.Store).filter(models.Store.owner_id == owner.id).first()
    if not store:
        store = models.Store(
            owner_id=owner.id,
            store_name=store_meta["store_name"],
            description=store_meta["description"],
            address=store_meta["address"],
            opening_hours=store_meta["opening_hours"],
        )
        db.add(store)
        db.flush()
    else:
        store.store_name = store_meta["store_name"]
        store.description = store_meta["description"]
        store.address = store_meta["address"]
        store.opening_hours = store_meta["opening_hours"]

    seed_ids = {row["id"] for row in biz["products"]}

    for spec in biz["products"]:
        image_url = upload_file_url(public_base, spec["image_file"])
        existing = db.query(models.Product).filter(models.Product.id == spec["id"]).first()
        if existing:
            existing.store_id = store.id
            existing.product_name = spec["product_name"]
            existing.description = spec["description"]
            existing.category = spec["category"]
            existing.price_per_day = float(spec["price_per_day"])
            existing.deposit_amount = float(spec["deposit_amount"])
            existing.total_quantity = int(spec["total_quantity"])
            existing.image_url = image_url
        else:
            db.add(
                models.Product(
                    id=spec["id"],
                    store_id=store.id,
                    product_name=spec["product_name"],
                    description=spec["description"],
                    category=spec["category"],
                    price_per_day=float(spec["price_per_day"]),
                    deposit_amount=float(spec["deposit_amount"]),
                    total_quantity=int(spec["total_quantity"]),
                    image_url=image_url,
                )
            )

    extra_products = (
        db.query(models.Product)
        .filter(models.Product.store_id == store.id)
        .filter(~models.Product.id.in_(seed_ids))
        .all()
    )
    for p in extra_products:
        has_booking = (
            db.query(models.BookingItem).filter(models.BookingItem.product_id == p.id).first()
            is not None
        )
        if not has_booking:
            db.delete(p)
