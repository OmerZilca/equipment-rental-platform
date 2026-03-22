"""
Booking services.

Contains the business logic for:
- creating bookings with multiple booking items
- checking product availability for a given date range
- retrieving bookings by customer
- retrieving bookings by store
- cancelling bookings
"""

from datetime import date

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import Booking, BookingItem, Product, Store, User
from app.schemas.booking import BookingCreate


def _build_booking_response(booking: Booking):
    items = [
        {
            "productId": item.product_id,
            "quantity": item.quantity,
            "pricePerDay": item.price_per_day,
            "depositAmount": item.deposit_amount,
        }
        for item in booking.items
    ]

    return {
        "id": booking.id,
        "customerId": booking.customer_id,
        "storeId": booking.store_id,
        "startDate": booking.start_date,
        "endDate": booking.end_date,
        "status": booking.status,
        "totalPrice": booking.total_price,
        "depositAmount": booking.deposit_amount,
        "items": items,
    }


def create_booking_service(db: Session, booking: BookingCreate, customer_id: int):
    if booking.startDate > booking.endDate:
        raise HTTPException(status_code=400, detail="Invalid date range")

    customer = db.query(User).filter(User.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    store = db.query(Store).filter(Store.id == booking.storeId).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    if not booking.items:
        raise HTTPException(status_code=400, detail="Booking must include at least one item")

    total_price = 0
    total_deposit = 0
    products_map = {}

    rental_days = (booking.endDate - booking.startDate).days + 1

    for item in booking.items:
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

        product = db.query(Product).filter(Product.id == item.productId).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.productId} not found"
            )

        if product.store_id != booking.storeId:
            raise HTTPException(
                status_code=400,
                detail=f"Product {item.productId} does not belong to store {booking.storeId}"
            )

        overlapping_quantity = (
            db.query(func.coalesce(func.sum(BookingItem.quantity), 0))
            .join(Booking, Booking.id == BookingItem.booking_id)
            .filter(BookingItem.product_id == item.productId)
            .filter(Booking.start_date <= booking.endDate)
            .filter(Booking.end_date >= booking.startDate)
            .filter(Booking.status != "cancelled")
            .scalar()
        )

        available_quantity = product.total_quantity - overlapping_quantity

        if item.quantity > available_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough quantity available for product {item.productId}"
            )

        item_total_price = item.quantity * product.price_per_day * rental_days
        item_total_deposit = item.quantity * product.deposit_amount

        total_price += item_total_price
        total_deposit += item_total_deposit

        products_map[item.productId] = product

    new_booking = Booking(
        customer_id=customer_id,
        store_id=booking.storeId,
        start_date=booking.startDate,
        end_date=booking.endDate,
        status="confirmed",
        total_price=total_price,
        deposit_amount=total_deposit,
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    for item in booking.items:
        product = products_map[item.productId]

        booking_item = BookingItem(
            booking_id=new_booking.id,
            product_id=item.productId,
            quantity=item.quantity,
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


def cancel_booking_service(db: Session, booking_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)

    return _build_booking_response(booking)


def check_availability_service(
    db: Session,
    product_id: int,
    start_date: date,
    end_date: date,
    quantity: int
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Invalid date range")

    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    overlapping_quantity = (
        db.query(func.coalesce(func.sum(BookingItem.quantity), 0))
        .join(Booking, Booking.id == BookingItem.booking_id)
        .filter(BookingItem.product_id == product_id)
        .filter(Booking.start_date <= end_date)
        .filter(Booking.end_date >= start_date)
        .filter(Booking.status != "cancelled")
        .scalar()
    )

    available_quantity = product.total_quantity - overlapping_quantity

    return {
        "available": available_quantity >= quantity
    }