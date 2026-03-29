"""Public equipment catalog and availability (no login required).

- GET /api/equipment — list all rentable equipment.
- GET /api/equipment/{id} — one item’s details (404 if missing).
- GET /api/equipment/{id}/availability — check stock for date range and quantity.
"""
from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import date

from app.schemas.booking import AvailabilityResponse
from app.services.bookings_service import check_availability_service
from app.db.database import get_db
from app.services.equipment_catalog import get_equipment_detail, list_equipment

# Create router with a common prefix and tag
router = APIRouter(prefix="/api/equipment", tags=["equipment"])


# Return list of all available equipment
@router.get("")
def list_equipment_endpoint(db: Session = Depends(get_db)):
    return list_equipment(db)


# Return details of one equipment item
@router.get("/{equipment_id}")
def get_equipment_details(equipment_id: int, db: Session = Depends(get_db)):
    equipment = get_equipment_detail(db, equipment_id)

    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")

    return equipment

# Check if equipment is available for given dates and quantity
@router.get("/{equipment_id}/availability", response_model=AvailabilityResponse)
def get_equipment_availability(
    equipment_id: int,
    startDate: date = Query(...),
    endDate: date = Query(...),
    quantity: int = Query(...),
    db: Session = Depends(get_db),
):
    # Call service to check availability
    return check_availability_service(
        db=db,
        equipment_id=equipment_id,
        start_date=startDate,
        end_date=endDate,
        quantity=quantity,
    )