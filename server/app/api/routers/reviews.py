"""Customer reviews for equipment (products), one per completed booking."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.review import ReviewCreate, ReviewCreatedOut
from app.services import review_service

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=ReviewCreatedOut)
def create_review(
    body: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = review_service.create_review_from_booking(
        db,
        customer=current_user,
        booking_id=body.bookingId,
        rating=body.rating,
        comment=body.comment,
    )
    return ReviewCreatedOut(
        id=row.id,
        bookingId=row.booking_id,
        productId=row.product_id,
        rating=row.rating if row.rating > 0 else None,
        comment=(row.comment or "").strip() or None,
    )
