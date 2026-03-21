from sqlalchemy.orm import Session
from app.db.models import Product
from app.schemas.product import ProductCreate

def create_product(db: Session, product_data: ProductCreate) -> Product:
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