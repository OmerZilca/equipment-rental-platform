from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.product import ProductCreate, ProductOut, ProductListResponse
from app.services.product_service import (
    create_product,
    get_all_products,
    get_products_by_store,
)

router = APIRouter(prefix="/api/products", tags=["products"])


@router.post("", response_model=ProductOut)
def create_new_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    created_product = create_product(db, product, current_user.id)

    return ProductOut(
        id=created_product.id,
        storeId=created_product.store_id,
        productName=created_product.product_name,
        description=created_product.description,
        category=created_product.category,
        pricePerDay=created_product.price_per_day,
        depositAmount=created_product.deposit_amount,
        totalQuantity=created_product.total_quantity,
        imageUrl=created_product.image_url,
    )


@router.get("", response_model=ProductListResponse)
def read_products(db: Session = Depends(get_db)):
    products = get_all_products(db)

    return ProductListResponse(
        items=[
            ProductOut(
                id=p.id,
                storeId=p.store_id,
                productName=p.product_name,
                description=p.description,
                category=p.category,
                pricePerDay=p.price_per_day,
                depositAmount=p.deposit_amount,
                totalQuantity=p.total_quantity,
                imageUrl=p.image_url,
            )
            for p in products
        ],
        total=len(products),
    )


@router.get("/store/{store_id}", response_model=ProductListResponse)
def get_products_for_store(store_id: int, db: Session = Depends(get_db)):
    products = get_products_by_store(db, store_id)

    return ProductListResponse(
        items=[
            ProductOut(
                id=p.id,
                storeId=p.store_id,
                productName=p.product_name,
                description=p.description,
                category=p.category,
                pricePerDay=p.price_per_day,
                depositAmount=p.deposit_amount,
                totalQuantity=p.total_quantity,
                imageUrl=p.image_url,
            )
            for p in products
        ],
        total=len(products),
    )