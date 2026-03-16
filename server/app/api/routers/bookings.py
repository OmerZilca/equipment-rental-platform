from fastapi import APIRouter
from app.schemas.pydantic import BookingCreate
from app.services.bookings_service import create_booking_service, BOOKINGS, check_equipment_availability

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.get("")
def list_bookings():
    return {
        "items": BOOKINGS,
        "total": len(BOOKINGS)
    }


@router.get("/check-availability")
def check_availability(
    equipment_id: int,
    start_date: str,
    end_date: str,
    quantity: int,
):
    return check_equipment_availability(
        equipment_id=equipment_id,
        start_date=start_date,
        end_date=end_date,
        quantity=quantity,
    )


@router.post("")
def create_booking(booking: BookingCreate):
    return create_booking_service(booking)