"""Booking business rules and database work.

create_booking_service — validates dates and stock, computes price/deposit, saves booking + line item.
get_all_bookings_service, get_bookings_by_customer_service, get_bookings_by_store_service — list views.
cancel_booking_service — customer cancels own future non-cancelled booking.
check_availability_service — how many units are free in a date range (non-cancelled bookings count).
"""

from calendar import monthrange
from datetime import date, datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import Date, and_, case, cast, func
from sqlalchemy.orm import Session, joinedload

from app.db.models import Booking, BookingItem, BookingReview, Product, Store, User
from app.schemas.booking import BookingCreate

_FULFILLMENT_VALUES = frozenset({"pending", "picked_up", "returned"})
_DAMAGE_REPORT_MAX_AGE_AFTER_RETURN = timedelta(hours=24)


def _booking_effective_end_date_expr():
    """Last calendar day the booking blocks inventory (actual return day when already returned)."""
    return case(
        (
            and_(
                Booking.fulfillment_status == "returned",
                Booking.returned_at.isnot(None),
            ),
            cast(Booking.returned_at, Date),
        ),
        else_=Booking.end_date,
    )


def _calendar_today() -> date:
    """Wall-clock calendar date for booking rules (tests may monkeypatch)."""
    return date.today()


def _auto_close_expired_pending_bookings(db: Session) -> None:
    """Set fulfillment to not_picked_up when the rental ended and gear was never picked up."""
    today = _calendar_today()
    rows = (
        db.query(Booking)
        .filter(Booking.fulfillment_status == "pending")
        .filter(Booking.status != "cancelled")
        .filter(Booking.end_date < today)
        .all()
    )
    if not rows:
        return
    for b in rows:
        b.fulfillment_status = "not_picked_up"
        b.returned_at = None
        b.picked_up_at = None
    db.commit()


def _build_booking_response(booking: Booking):
    first_item = booking.items[0] if booking.items else None
    image_url = ""
    equipment_id = 0
    quantity = 0
    if first_item:
        equipment_id = first_item.product_id
        quantity = first_item.quantity
        if first_item.product is not None:
            image_url = (first_item.product.image_url or "").strip()

    customer_name = None
    cust = getattr(booking, "customer", None)
    if cust is not None:
        customer_name = cust.full_name

    fulfillment = getattr(booking, "fulfillment_status", None) or "pending"
    returned_at = getattr(booking, "returned_at", None)
    damage_notes = getattr(booking, "damage_notes", None)
    damage_reported_at = getattr(booking, "damage_reported_at", None)

    return {
        "id": booking.id,
        "equipmentId": equipment_id,
        "quantity": quantity,
        "startDate": booking.start_date,
        "endDate": booking.end_date,
        "status": booking.status,
        "imageUrl": image_url,
        "hasReview": False,
        "canReview": False,
        "fulfillmentStatus": fulfillment,
        "returnedAt": returned_at,
        "customerName": customer_name,
        "damageNotes": (damage_notes or "").strip() or None,
        "damageReportedAt": damage_reported_at,
        "damageReportAllowed": False,
    }


def _first_line_product_id(booking: Booking) -> int | None:
    if not booking.items:
        return None
    return booking.items[0].product_id


def _another_pickup_same_product_after_return(
    db: Session,
    booking: Booking,
    product_id: int,
    returned_at: datetime,
) -> bool:
    """True if another renter picked up the same product after this booking was returned."""
    rows = (
        db.query(Booking)
        .join(BookingItem, BookingItem.booking_id == Booking.id)
        .filter(BookingItem.product_id == product_id)
        .filter(Booking.id != booking.id)
        .filter(Booking.status != "cancelled")
        .filter(Booking.fulfillment_status == "picked_up")
        .distinct()
        .all()
    )
    for other in rows:
        if other.picked_up_at is not None and other.picked_up_at > returned_at:
            return True
        if other.picked_up_at is None and other.start_date > booking.end_date:
            return True
    return False


def damage_report_allowed_for_booking(db: Session, booking: Booking) -> bool:
    """Owner may file/update damage only within 24h of return and before another pickup."""
    if booking.status == "cancelled":
        return False
    if booking.fulfillment_status != "returned" or not booking.returned_at:
        return False
    now = datetime.utcnow()
    if now > booking.returned_at + _DAMAGE_REPORT_MAX_AGE_AFTER_RETURN:
        return False
    pid = _first_line_product_id(booking)
    if pid is None:
        return False
    if _another_pickup_same_product_after_return(db, booking, pid, booking.returned_at):
        return False
    return True


def create_booking_service(db: Session, booking: BookingCreate, customer_id: int | None = None):
    _auto_close_expired_pending_bookings(db)
    today = _calendar_today()

    if booking.startDate > booking.endDate:
        raise HTTPException(status_code=400, detail="Invalid date range")

    if booking.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    if booking.startDate < today:
        raise HTTPException(status_code=400, detail="Start date cannot be in the past")

    if booking.endDate < today:
        raise HTTPException(status_code=400, detail="End date cannot be in the past")

    if customer_id is None:
        customer = db.query(User).filter(User.role == "customer").first()
    else:
        customer = db.query(User).filter(User.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found. Create a customer user first.")

    rental_days = (booking.endDate - booking.startDate).days + 1

    # Row lock serializes concurrent bookings for the same product (PostgreSQL).
    # Overlap check + inserts then run in one transaction so two clients cannot both pass the stock check.
    product = (
        db.query(Product)
        .filter(Product.id == booking.equipmentId)
        .with_for_update()
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail=f"Equipment {booking.equipmentId} not found")

    store = db.query(Store).filter(Store.id == product.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    overlapping_quantity = (
        db.query(func.coalesce(func.sum(BookingItem.quantity), 0))
        .join(Booking, Booking.id == BookingItem.booking_id)
        .filter(BookingItem.product_id == booking.equipmentId)
        .filter(Booking.start_date <= booking.endDate)
        .filter(_booking_effective_end_date_expr() >= booking.startDate)
        .filter(Booking.status != "cancelled")
        .scalar()
    )

    available_quantity = product.total_quantity - overlapping_quantity
    if booking.quantity > available_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough quantity available for equipment {booking.equipmentId}"
        )

    total_price = booking.quantity * product.price_per_day * rental_days
    total_deposit = booking.quantity * product.deposit_amount

    new_booking = Booking(
        customer_id=customer.id,
        store_id=product.store_id,
        start_date=booking.startDate,
        end_date=booking.endDate,
        status="confirmed",
        fulfillment_status="pending",
        returned_at=None,
        total_price=total_price,
        deposit_amount=total_deposit,
    )

    db.add(new_booking)
    db.flush()

    booking_item = BookingItem(
        booking_id=new_booking.id,
        product_id=booking.equipmentId,
        quantity=booking.quantity,
        price_per_day=product.price_per_day,
        deposit_amount=product.deposit_amount,
    )
    db.add(booking_item)

    db.commit()
    db.refresh(new_booking)

    return _build_booking_response(new_booking)


def get_bookings_by_customer_service(db: Session, customer_id: int):
    _auto_close_expired_pending_bookings(db)
    customer = db.query(User).filter(User.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    bookings = (
        db.query(Booking)
        .options(
            joinedload(Booking.items).joinedload(BookingItem.product),
            joinedload(Booking.customer),
        )
        .filter(Booking.customer_id == customer_id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    reviewed_ids: set[int] = set()
    if bookings:
        bid_list = [b.id for b in bookings]
        rows = (
            db.query(BookingReview.booking_id)
            .filter(BookingReview.booking_id.in_(bid_list))
            .all()
        )
        reviewed_ids = {r[0] for r in rows}

    today = _calendar_today()
    out: list[dict] = []
    for b in bookings:
        d = _build_booking_response(b)
        has_r = b.id in reviewed_ids
        eligible = b.status != "cancelled" and b.end_date < today
        d["hasReview"] = has_r
        d["canReview"] = eligible
        out.append(d)
    return out


def get_all_bookings_service(db: Session):
    _auto_close_expired_pending_bookings(db)
    bookings = (
        db.query(Booking)
        .options(
            joinedload(Booking.items).joinedload(BookingItem.product),
            joinedload(Booking.customer),
        )
        .order_by(Booking.created_at.desc())
        .all()
    )
    return [_build_booking_response(booking) for booking in bookings]


def get_bookings_by_store_service(db: Session, store_id: int):
    _auto_close_expired_pending_bookings(db)
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    bookings = (
        db.query(Booking)
        .options(
            joinedload(Booking.items).joinedload(BookingItem.product),
            joinedload(Booking.customer),
        )
        .filter(Booking.store_id == store_id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    return [_build_booking_response(booking) for booking in bookings]


def get_bookings_for_store_owner_service(db: Session, owner_id: int):
    _auto_close_expired_pending_bookings(db)
    store_ids = [s.id for s in db.query(Store).filter(Store.owner_id == owner_id).all()]
    if not store_ids:
        return []

    bookings = (
        db.query(Booking)
        .options(
            joinedload(Booking.items).joinedload(BookingItem.product),
            joinedload(Booking.customer),
        )
        .filter(Booking.store_id.in_(store_ids))
        .order_by(Booking.created_at.desc())
        .all()
    )
    out: list[dict] = []
    for b in bookings:
        d = _build_booking_response(b)
        d["damageReportAllowed"] = damage_report_allowed_for_booking(db, b)
        out.append(d)
    return out


def update_booking_fulfillment_service(
    db: Session, booking_id: int, owner_id: int, fulfillment_status: str
):
    if fulfillment_status not in _FULFILLMENT_VALUES:
        raise HTTPException(status_code=400, detail="Invalid fulfillment status")

    store_ids = {s.id for s in db.query(Store).filter(Store.owner_id == owner_id).all()}
    if not store_ids:
        raise HTTPException(status_code=403, detail="You do not own any store")

    _auto_close_expired_pending_bookings(db)

    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.items).joinedload(BookingItem.product),
            joinedload(Booking.customer),
        )
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.store_id not in store_ids:
        raise HTTPException(status_code=403, detail="You can only update bookings for your stores")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot change fulfillment for a cancelled booking")

    if booking.fulfillment_status == "not_picked_up":
        raise HTTPException(
            status_code=400,
            detail="This booking was closed automatically: equipment was not picked up before the rental period ended.",
        )

    today = _calendar_today()
    if fulfillment_status == "picked_up" and today < booking.start_date:
        raise HTTPException(
            status_code=400,
            detail="Pickup can only be confirmed on or after the rental start date.",
        )

    if fulfillment_status == "picked_up" and today > booking.end_date:
        raise HTTPException(
            status_code=400,
            detail="Pickup cannot be confirmed after the rental end date.",
        )

    booking.fulfillment_status = fulfillment_status

    if fulfillment_status == "picked_up":
        booking.picked_up_at = datetime.utcnow()
    elif fulfillment_status in ("pending", "not_picked_up"):
        booking.picked_up_at = None

    if fulfillment_status == "returned":
        booking.returned_at = datetime.utcnow()
    else:
        booking.returned_at = None

    db.commit()
    db.refresh(booking)

    d = _build_booking_response(booking)
    reviewed = (
        db.query(BookingReview.id).filter(BookingReview.booking_id == booking.id).first()
        is not None
    )
    d["hasReview"] = reviewed
    d["canReview"] = booking.status != "cancelled" and booking.end_date < today
    d["damageReportAllowed"] = damage_report_allowed_for_booking(db, booking)
    return d


def report_booking_damage_service(
    db: Session, booking_id: int, owner_id: int, description: str
):
    """Store owner documents customer-caused damage on a booking."""
    _auto_close_expired_pending_bookings(db)
    store_ids = {s.id for s in db.query(Store).filter(Store.owner_id == owner_id).all()}
    if not store_ids:
        raise HTTPException(status_code=403, detail="You do not own any store")

    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.items).joinedload(BookingItem.product),
            joinedload(Booking.customer),
        )
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.store_id not in store_ids:
        raise HTTPException(status_code=403, detail="You can only update bookings for your stores")

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Cannot add a damage report for a cancelled booking.",
        )

    if not damage_report_allowed_for_booking(db, booking):
        raise HTTPException(
            status_code=400,
            detail=(
                "Damage can only be filed within 24 hours after the equipment was marked returned, "
                "and only if no other customer has picked up the same product since that return."
            ),
        )

    text = (description or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Description is required.")

    booking.damage_notes = text[:4000]
    booking.damage_reported_at = datetime.utcnow()
    db.commit()
    db.refresh(booking)

    d = _build_booking_response(booking)
    reviewed = (
        db.query(BookingReview.id).filter(BookingReview.booking_id == booking.id).first()
        is not None
    )
    today = _calendar_today()
    d["hasReview"] = reviewed
    d["canReview"] = booking.status != "cancelled" and booking.end_date < today
    d["damageReportAllowed"] = damage_report_allowed_for_booking(db, booking)
    return d


def clear_booking_damage_report_service(db: Session, booking_id: int, owner_id: int):
    _auto_close_expired_pending_bookings(db)
    store_ids = {s.id for s in db.query(Store).filter(Store.owner_id == owner_id).all()}
    if not store_ids:
        raise HTTPException(status_code=403, detail="You do not own any store")

    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.items).joinedload(BookingItem.product),
            joinedload(Booking.customer),
        )
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.store_id not in store_ids:
        raise HTTPException(status_code=403, detail="You can only update bookings for your stores")

    booking.damage_notes = None
    booking.damage_reported_at = None
    db.commit()
    db.refresh(booking)

    d = _build_booking_response(booking)
    reviewed = (
        db.query(BookingReview.id).filter(BookingReview.booking_id == booking.id).first()
        is not None
    )
    today = _calendar_today()
    d["hasReview"] = reviewed
    d["canReview"] = booking.status != "cancelled" and booking.end_date < today
    d["damageReportAllowed"] = damage_report_allowed_for_booking(db, booking)
    return d


def _month_bounds_utc(year: int, month: int) -> tuple[datetime, datetime]:
    _, last_day = monthrange(year, month)
    start = datetime(year, month, 1)
    end = datetime(year, month, last_day, 23, 59, 59, 999999)
    return start, end


def get_owner_store_stats_service(db: Session, owner_id: int, year: int, month: int) -> dict:
    _auto_close_expired_pending_bookings(db)
    store_ids = [s.id for s in db.query(Store).filter(Store.owner_id == owner_id).all()]
    if not store_ids:
        return {
            "year": year,
            "month": month,
            "revenue": 0.0,
            "returnedBookingsCount": 0,
            "topProducts": [],
        }

    start, end = _month_bounds_utc(year, month)

    revenue_row = (
        db.query(func.coalesce(func.sum(Booking.total_price), 0.0))
        .filter(Booking.store_id.in_(store_ids))
        .filter(Booking.status != "cancelled")
        .filter(Booking.fulfillment_status == "returned")
        .filter(Booking.returned_at.isnot(None))
        .filter(Booking.returned_at >= start)
        .filter(Booking.returned_at <= end)
        .scalar()
    )
    revenue = float(revenue_row or 0.0)

    returned_count = (
        db.query(func.count(Booking.id))
        .filter(Booking.store_id.in_(store_ids))
        .filter(Booking.status != "cancelled")
        .filter(Booking.fulfillment_status == "returned")
        .filter(Booking.returned_at.isnot(None))
        .filter(Booking.returned_at >= start)
        .filter(Booking.returned_at <= end)
        .scalar()
    )

    top_rows = (
        db.query(
            Product.id,
            Product.product_name,
            func.coalesce(func.sum(BookingItem.quantity), 0),
        )
        .join(BookingItem, BookingItem.product_id == Product.id)
        .join(Booking, Booking.id == BookingItem.booking_id)
        .filter(Booking.store_id.in_(store_ids))
        .filter(Booking.status != "cancelled")
        .filter(Booking.fulfillment_status == "returned")
        .filter(Booking.returned_at.isnot(None))
        .filter(Booking.returned_at >= start)
        .filter(Booking.returned_at <= end)
        .group_by(Product.id, Product.product_name)
        .order_by(func.sum(BookingItem.quantity).desc())
        .limit(5)
        .all()
    )

    top_products = [
        {
            "productId": int(pid),
            "productName": str(pname),
            "unitsRented": int(units or 0),
        }
        for pid, pname, units in top_rows
    ]

    return {
        "year": year,
        "month": month,
        "revenue": revenue,
        "returnedBookingsCount": int(returned_count or 0),
        "topProducts": top_products,
    }


def cancel_booking_service(db: Session, booking_id: int, current_user_id: int):
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.items).joinedload(BookingItem.product),
            joinedload(Booking.customer),
        )
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.customer_id != current_user_id:
        raise HTTPException(status_code=403, detail="You can only cancel your own bookings")

    today = _calendar_today()
    if booking.start_date < today:
        raise HTTPException(status_code=400, detail="Cannot cancel a booking that already started")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)

    return _build_booking_response(booking)


def check_availability_service(
    db: Session,
    equipment_id: int,
    start_date: date,
    end_date: date,
    quantity: int
):
    _auto_close_expired_pending_bookings(db)
    today = _calendar_today()

    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Invalid date range")

    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    if start_date < today:
        raise HTTPException(status_code=400, detail="Start date cannot be in the past")

    if end_date < today:
        raise HTTPException(status_code=400, detail="End date cannot be in the past")

    product = db.query(Product).filter(Product.id == equipment_id).first()

    if not product:
        raise HTTPException(status_code=404, detail=f"Equipment {equipment_id} not found")

    overlapping_quantity = (
        db.query(func.coalesce(func.sum(BookingItem.quantity), 0))
        .join(Booking, Booking.id == BookingItem.booking_id)
        .filter(BookingItem.product_id == equipment_id)
        .filter(Booking.start_date <= end_date)
        .filter(_booking_effective_end_date_expr() >= start_date)
        .filter(Booking.status != "cancelled")
        .scalar()
    )

    available_quantity = product.total_quantity - overlapping_quantity

    return {
        "equipmentId": equipment_id,
        "available": available_quantity >= quantity,
        "requestedQuantity": quantity,
        "availableQuantity": available_quantity,
        "overlappingQuantity": overlapping_quantity,
    }