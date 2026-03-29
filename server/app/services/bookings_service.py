"""Booking business rules and database work.

create_booking_service — validates dates and stock, computes price/deposit, saves booking + line item.
get_all_bookings_service, get_bookings_by_customer_service, get_bookings_by_store_service — list views.
cancel_booking_service — customer cancels own future non-cancelled booking.
check_availability_service — how many units are free in a date range (non-cancelled bookings count).
"""

from datetime import date

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import Booking, BookingItem, Product, Store, User
from app.schemas.booking import BookingCreate


def _build_booking_response(booking: Booking):
    first_item = booking.items[0] if booking.items else None

    return {
        "id": booking.id,
        "equipmentId": first_item.product_id if first_item else 0,
        "quantity": first_item.quantity if first_item else 0,
        "startDate": booking.start_date,
        "endDate": booking.end_date,
        "status": booking.status,
    }


def create_booking_service(db: Session, booking: BookingCreate, customer_id: int | None = None):
    today = date.today()

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

    product = db.query(Product).filter(Product.id == booking.equipmentId).first()
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
        .filter(Booking.end_date >= booking.startDate)
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
        total_price=total_price,
        deposit_amount=total_deposit,
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

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
    customer = db.query(User).filter(User.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    bookings = (
        db.query(Booking)
        .filter(Booking.customer_id == customer_id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    return [_build_booking_response(booking) for booking in bookings]


def get_all_bookings_service(db: Session):
    bookings = (
        db.query(Booking)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return [_build_booking_response(booking) for booking in bookings]


def get_bookings_by_store_service(db: Session, store_id: int):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    bookings = (
        db.query(Booking)
        .filter(Booking.store_id == store_id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    return [_build_booking_response(booking) for booking in bookings]


def cancel_booking_service(db: Session, booking_id: int, current_user_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.customer_id != current_user_id:
        raise HTTPException(status_code=403, detail="You can only cancel your own bookings")

    today = date.today()
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
    today = date.today()

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
        .filter(Booking.end_date >= start_date)
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