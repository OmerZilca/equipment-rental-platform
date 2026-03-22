from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models import Product, Store, User
from app.schemas.product import ProductCreate


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