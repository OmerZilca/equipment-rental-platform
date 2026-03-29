"""Product (rental item) CRUD for store owners.

create_product — must own the target store and be a business_owner.
get_all_products / get_products_by_store — simple queries for lists.
get_products_for_owner / get_product_owned_by_user — scope by store owner.
update_product_for_owner / delete_product_for_owner — patch fields or remove;
  delete is blocked if the product appears on any booking.
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models import BookingItem, Product, Store, User
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(db: Session, product_data: ProductCreate, user_id: int) -> Product:
    store = db.query(Store).filter(Store.id == product_data.storeId).first()

    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role != "business_owner":
        raise HTTPException(
            status_code=403,
            detail="Only business owners can create products"
        )

    if store.owner_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only create products for your own store"
        )

    product = Product(
        store_id=product_data.storeId,
        product_name=product_data.productName,
        description=product_data.description,
        category=product_data.category,
        price_per_day=product_data.pricePerDay,
        deposit_amount=product_data.depositAmount,
        total_quantity=product_data.totalQuantity,
        image_url=product_data.imageUrl,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def get_all_products(db: Session):
    return db.query(Product).all()


def get_products_by_store(db: Session, store_id: int):
    return db.query(Product).filter(Product.store_id == store_id).all()


def get_products_for_owner(db: Session, user_id: int) -> list[Product]:
    return (
        db.query(Product)
        .join(Store, Store.id == Product.store_id)
        .filter(Store.owner_id == user_id)
        .all()
    )


def get_product_owned_by_user(
    db: Session, product_id: int, user_id: int
) -> Product | None:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None
    store = db.query(Store).filter(Store.id == product.store_id).first()
    if not store or store.owner_id != user_id:
        return None
    return product


def update_product_for_owner(
    db: Session, product_id: int, user_id: int, data: ProductUpdate
) -> Product:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "business_owner":
        raise HTTPException(
            status_code=403,
            detail="Only business owners can update products",
        )

    product = get_product_owned_by_user(db, product_id, user_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    patch = data.model_dump(exclude_unset=True)
    if "productName" in patch:
        product.product_name = patch["productName"]
    if "description" in patch:
        product.description = patch["description"]
    if "category" in patch:
        product.category = patch["category"]
    if "pricePerDay" in patch:
        product.price_per_day = patch["pricePerDay"]
    if "depositAmount" in patch:
        product.deposit_amount = patch["depositAmount"]
    if "totalQuantity" in patch:
        if patch["totalQuantity"] < 0:
            raise HTTPException(
                status_code=400,
                detail="totalQuantity must be non-negative",
            )
        product.total_quantity = patch["totalQuantity"]
    if "imageUrl" in patch:
        product.image_url = patch["imageUrl"]

    db.commit()
    db.refresh(product)
    return product


def delete_product_for_owner(db: Session, product_id: int, user_id: int) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "business_owner":
        raise HTTPException(
            status_code=403,
            detail="Only business owners can delete products",
        )

    product = get_product_owned_by_user(db, product_id, user_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if (
        db.query(BookingItem)
        .filter(BookingItem.product_id == product_id)
        .first()
    ):
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a product that appears on any booking.",
        )

    db.delete(product)
    db.commit()