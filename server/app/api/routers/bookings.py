from fastapi import APIRouter
from app.schemas.pydantic import BookingCreate

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.get("")
def list_bookings():
    return {
        "items": [],
        "total": 0
    }


@router.post("")
def create_booking(booking: BookingCreate):
    return {
        "message": "Booking created successfully",
        "booking": booking
    }