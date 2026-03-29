"""Store products: CRUD and public lists.

- POST /api/products — create (business owner, logged in).
- GET /api/products — all products (public).
- GET /api/products/mine — owner’s products (business owner).
- GET /api/products/store/{store_id} — products for one store (public).
- GET/PATCH/DELETE /api/products/{product_id} — read/update/delete own product
  (business owner; GET/PATCH/DELETE require login).
"""
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models import Product, User
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductOut,
    ProductUpdate,
)
from app.services.product_service import (
    create_product,
    delete_product_for_owner,
    get_all_products,
    get_product_owned_by_user,
    get_products_by_store,
    get_products_for_owner,
    update_product_for_owner,
)

router = APIRouter(prefix="/api/products", tags=["products"])


def _require_business_owner(user: User) -> None:
    if user.role != "business_owner":
        raise HTTPException(
            status_code=403,
            detail="Only business owners can access this resource",
        )


def _to_out(p: Product) -> ProductOut:
    return ProductOut(
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


@router.post("", response_model=ProductOut)
def create_new_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    created_product = create_product(db, product, current_user.id)
    return _to_out(created_product)


@router.get("", response_model=ProductListResponse)
def read_products(db: Session = Depends(get_db)):
    products = get_all_products(db)
    return ProductListResponse(
        items=[_to_out(p) for p in products],
        total=len(products),
    )


@router.get("/mine", response_model=ProductListResponse)
def read_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_business_owner(current_user)
    products = get_products_for_owner(db, current_user.id)
    return ProductListResponse(
        items=[_to_out(p) for p in products],
        total=len(products),
    )


@router.get("/store/{store_id}", response_model=ProductListResponse)
def get_products_for_store(store_id: int, db: Session = Depends(get_db)):
    products = get_products_by_store(db, store_id)
    return ProductListResponse(
        items=[_to_out(p) for p in products],
        total=len(products),
    )


@router.get("/{product_id}", response_model=ProductOut)
def read_product_by_id(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_business_owner(current_user)
    product = get_product_owned_by_user(db, product_id, current_user.id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _to_out(product)


@router.patch("/{product_id}", response_model=ProductOut)
def patch_product(
    product_id: int,
    body: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = update_product_for_owner(db, product_id, current_user.id, body)
    return _to_out(updated)


@router.delete("/{product_id}", status_code=204)
def remove_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_product_for_owner(db, product_id, current_user.id)
    return Response(status_code=204)
