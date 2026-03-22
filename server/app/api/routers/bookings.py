from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from app.db.database import get_db
from app.schemas.booking import (
    BookingCreate,
    BookingOut,
    BookingListResponse,
    AvailabilityResponse,
)
from app.services.bookings_service import (
    create_booking_service,
    get_bookings_by_customer_service,
    get_bookings_by_store_service,
    cancel_booking_service,
    check_availability_service,
)
from app.api.dependencies.auth import get_current_user
from app.db.models import User

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_booking_service(db, booking, current_user.id)


@router.get("/customer/{customer_id}", response_model=BookingListResponse)
def get_bookings_by_customer(customer_id: int, db: Session = Depends(get_db)):
    bookings = get_bookings_by_customer_service(db, customer_id)
    return BookingListResponse(items=bookings, total=len(bookings))


@router.get("/store/{store_id}", response_model=BookingListResponse)
def get_bookings_by_store(store_id: int, db: Session = Depends(get_db)):
    bookings = get_bookings_by_store_service(db, store_id)
    return BookingListResponse(items=bookings, total=len(bookings))


@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    return cancel_booking_service(db, booking_id)


@router.get("/check-availability", response_model=AvailabilityResponse)
def check_availability(
    productId: int,
    startDate: date,
    endDate: date,
    quantity: int,
    db: Session = Depends(get_db)
):
    return check_availability_service(
        db,
        product_id=productId,
        start_date=startDate,
        end_date=endDate,
        quantity=quantity
    )