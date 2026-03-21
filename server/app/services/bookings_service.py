"""
Create a new booking.

This function checks the booking dates, verifies that the requested
products exist and have enough quantity, calculates the total price
and deposit, saves the booking and its items in the database,
and returns a success response.
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from app.db.models import Booking, BookingItem, Product
from app.schemas.booking import BookingCreate

def create_booking_service(db: Session, booking: BookingCreate):
   # Check that the date range is valid
    if booking.startDate > booking.endDate:
        raise HTTPException(status_code=400, detail="Invalid date range")

    total_price = 0
    total_deposit = 0

    products = {}

    # Check products and calculate total price/deposit
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

    # Create the main booking record
    new_booking = Booking(
        customer_id=booking.customerId,
        store_id=booking.storeId,
        start_date=booking.startDate,
        end_date=booking.endDate,
        total_price=total_price,
        deposit_amount=total_deposit,
        status="confirmed"
    )
    # Save booking to the database

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # Create booking item records for each product
    for item in booking.items:

        product = products[item.productId]
        
        # Create a booking item row
        booking_item = BookingItem(
            booking_id=new_booking.id,
            product_id=item.productId,
            quantity=item.quantity,
            price_per_day=product.price_per_day,
            deposit_amount=product.deposit_amount
        )
        # Add booking item to the database session
        db.add(booking_item)

    db.commit()
    # Return success response
    return {
        "message": "Booking created successfully",
        "bookingId": new_booking.id
    }
def check_availability_service(
    db: Session,
    product_id: int,
    start_date: date,
    end_date: date,
    quantity: int
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Invalid date range")

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
