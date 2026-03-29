"""Rental bookings: create, list, cancel, and check availability.

- POST /api/bookings — new booking; logged-in customer only (store owners get 403).
- GET /api/bookings — all bookings.
- GET /api/bookings/me — current user’s bookings (login required).
- GET /api/bookings/customer/{id} — bookings for one customer.
- GET /api/bookings/store/{id} — bookings for one store.
- PATCH /api/bookings/{id}/cancel — cancel a booking (login required).
- GET /api/bookings/check-availability — same check as equipment availability.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.booking import (
    BookingCreate,
    BookingOut,
    BookingListResponse,
    AvailabilityResponse,
)
from app.services.bookings_service import (
    create_booking_service,
    get_all_bookings_service,
    get_bookings_by_customer_service,
    get_bookings_by_store_service,
    cancel_booking_service,
    check_availability_service,
)

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=403,
            detail=(
                "Equipment rentals are only available to customer accounts. "
                "While signed in as a store owner you cannot place bookings—use My store to manage your listings. "
                "Sign out and sign in with a customer account, or register a separate customer profile to rent gear."
            ),
        )

    return create_booking_service(db, booking, customer_id=current_user.id)


@router.get("", response_model=BookingListResponse)
def get_all_bookings(db: Session = Depends(get_db)):
    bookings = get_all_bookings_service(db)
    return BookingListResponse(items=bookings, total=len(bookings))


@router.get("/me", response_model=BookingListResponse)
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = get_bookings_by_customer_service(db, current_user.id)
    return BookingListResponse(items=bookings, total=len(bookings))


@router.get("/customer/{customer_id}", response_model=BookingListResponse)
def get_bookings_by_customer(customer_id: int, db: Session = Depends(get_db)):
    bookings = get_bookings_by_customer_service(db, customer_id)
    return BookingListResponse(items=bookings, total=len(bookings))


@router.get("/store/{store_id}", response_model=BookingListResponse)
def get_bookings_by_store(store_id: int, db: Session = Depends(get_db)):
    bookings = get_bookings_by_store_service(db, store_id)
    return BookingListResponse(items=bookings, total=len(bookings))


@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return cancel_booking_service(db, booking_id, current_user.id)


@router.get("/check-availability", response_model=AvailabilityResponse)
def check_availability(
    equipment_id: int,
    start_date: date,
    end_date: date,
    quantity: int,
    db: Session = Depends(get_db)
):
    return check_availability_service(
        db,
        equipment_id=equipment_id,
        start_date=start_date,
        end_date=end_date,
        quantity=quantity
    )