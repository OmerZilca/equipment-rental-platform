from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.database import get_db
from app.schemas.booking import BookingCreate
from app.services.bookings_service import create_booking_service, check_availability_service

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("")
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    return create_booking_service(db, booking)


@router.get("/check-availability")
def check_availability(
    productId: int,
    startDate: str,
    endDate: str,
    quantity: int,
    db: Session = Depends(get_db)
):
    return check_availability_service(
        db,
        product_id=productId,
        start_date=datetime.strptime(startDate, "%Y-%m-%d").date(),
        end_date=datetime.strptime(endDate, "%Y-%m-%d").date(),
        quantity=quantity
    )