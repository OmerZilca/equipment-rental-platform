from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.pydantic import BookingCreate
from app.services.bookings_service import create_booking_service

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("")
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    return create_booking_service(db, booking)