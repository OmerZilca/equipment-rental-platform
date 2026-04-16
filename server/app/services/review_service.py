"""Product reviews tied to completed bookings (one review per booking)."""

from datetime import date, datetime

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.db.models import Booking, BookingItem, BookingReview, Product, User


def _reviewer_display_name(user: User | None) -> str:
    if not user or not user.full_name:
        return "Customer"
    name = user.full_name.strip()
    if not name:
        return "Customer"
    return name


def get_product_rating_summary(db: Session, product_id: int) -> tuple[float, int]:
    """Average and count use only rows with a star rating (rating 1–5)."""
    row = (
        db.query(
            func.coalesce(func.avg(BookingReview.rating), 0.0),
            func.count(BookingReview.id),
        )
        .filter(BookingReview.product_id == product_id)
        .filter(BookingReview.rating > 0)
        .first()
    )
    if not row:
        return 0.0, 0
    avg, cnt = float(row[0] or 0), int(row[1] or 0)
    if cnt == 0:
        return 0.0, 0
    return round(avg, 2), cnt


def _written_comment_filter():
    """List on the product page: only rows with a written comment (≥3 chars).

    Star-only ratings still count in get_product_rating_summary but are omitted here.
    """
    return func.length(func.trim(func.coalesce(BookingReview.comment, ""))) >= 3


def list_product_reviews(db: Session, product_id: int, limit: int = 100) -> dict:
    avg, rcount = get_product_rating_summary(db, product_id)
    total_vis = (
        db.query(func.count(BookingReview.id))
        .filter(BookingReview.product_id == product_id)
        .filter(_written_comment_filter())
        .scalar()
        or 0
    )
    rows = (
        db.query(BookingReview)
        .options(joinedload(BookingReview.customer))
        .filter(BookingReview.product_id == product_id)
        .filter(_written_comment_filter())
        .order_by(BookingReview.created_at.desc())
        .limit(limit)
        .all()
    )
    items = []
    for r in rows:
        rt = int(r.rating) if r.rating is not None else 0
        ct = (r.comment or "").strip()
        items.append(
            {
                "id": r.id,
                "rating": rt if rt > 0 else None,
                "comment": ct if ct else None,
                "reviewerName": _reviewer_display_name(r.customer),
                "createdAt": r.created_at,
            }
        )
    return {
        "items": items,
        "total": int(total_vis),
        "averageRating": avg,
        "reviewCount": rcount,
    }


def create_review_from_booking(
    db: Session,
    *,
    customer: User,
    booking_id: int,
    rating: int | None,
    comment: str | None,
) -> BookingReview:
    if customer.role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customer accounts can submit reviews.",
        )

    text = (comment or "").strip()
    rating_store = 0 if rating is None else int(rating)
    if rating_store not in range(0, 6):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    has_stars = rating_store >= 1
    has_text = len(text) >= 3
    if not has_stars and not has_text:
        raise HTTPException(
            status_code=400,
            detail=(
                "Provide a star rating and/or a comment of at least 3 characters."
            ),
        )
    if len(text) > 2000:
        raise HTTPException(
            status_code=400,
            detail="Comment cannot exceed 2000 characters.",
        )

    today = date.today()
    booking = (
        db.query(Booking)
        .options(joinedload(Booking.items).joinedload(BookingItem.product))
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.customer_id != customer.id:
        raise HTTPException(
            status_code=403,
            detail="You can only review your own bookings.",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Cancelled bookings cannot be reviewed.",
        )

    if booking.end_date >= today:
        raise HTTPException(
            status_code=400,
            detail="You can only review after the rental end date has passed.",
        )

    existing = (
        db.query(BookingReview).filter(BookingReview.booking_id == booking_id).first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="A review has already been submitted for this booking.",
        )

    first_item = booking.items[0] if booking.items else None
    if not first_item:
        raise HTTPException(status_code=400, detail="Booking has no line items.")

    product_id = first_item.product_id

    row = BookingReview(
        booking_id=booking_id,
        customer_id=customer.id,
        product_id=product_id,
        rating=rating_store,
        comment=text,
        created_at=datetime.utcnow(),
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A review has already been submitted for this booking.",
        ) from None

    db.refresh(row)
    return row
