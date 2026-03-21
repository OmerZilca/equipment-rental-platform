from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.product import ProductCreate
from app.services.product_service import create_product, get_all_products

router = APIRouter(prefix="/api/products", tags=["products"])


@router.post("")
def create_new_product(product: ProductCreate, db: Session = Depends(get_db)):
    return create_product(db, product)


@router.get("")
def read_products(db: Session = Depends(get_db)):
    return get_all_products(db)