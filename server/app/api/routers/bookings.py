from fastapi import APIRouter
from app.schemas.pydantic import BookingCreate
from app.services.bookings_service import create_booking_service, BOOKINGS

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.get("")
def list_bookings():
    return {
        "items": BOOKINGS,
        "total": len(BOOKINGS)
    }


@router.post("")
def create_booking(booking: BookingCreate):
    return create_booking_service(booking)