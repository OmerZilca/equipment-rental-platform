from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.db.models import Booking, BookingItem, Product
from app.schemas.pydantic import BookingCreate


def create_booking_service(db: Session, booking: BookingCreate):

    if booking.startDate > booking.endDate:
        raise HTTPException(status_code=400, detail="Invalid date range")

    total_price = 0
    total_deposit = 0

    products = {}

    # בדיקת מוצרים וחישוב מחיר
    for item in booking.items:

        product = db.query(Product).filter(Product.id == item.productId).first()

        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.productId} not found")

        if item.quantity > product.total_quantity:
            raise HTTPException(status_code=400, detail="Not enough quantity available")

        days = (booking.endDate - booking.startDate).days or 1

        price = item.quantity * product.price_per_day * days
        deposit = item.quantity * product.deposit_amount

        total_price += price
        total_deposit += deposit

        products[item.productId] = product

    # יצירת booking
    new_booking = Booking(
        customer_id=booking.customerId,
        store_id=booking.storeId,
        start_date=booking.startDate,
        end_date=booking.endDate,
        total_price=total_price,
        deposit_amount=total_deposit,
        status="confirmed"
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # יצירת booking items
    for item in booking.items:

        product = products[item.productId]

        booking_item = BookingItem(
            booking_id=new_booking.id,
            product_id=item.productId,
            quantity=item.quantity,
            price_per_day=product.price_per_day,
            deposit_amount=product.deposit_amount
        )

        db.add(booking_item)

    db.commit()

    return {
        "message": "Booking created successfully",
        "bookingId": new_booking.id
    }