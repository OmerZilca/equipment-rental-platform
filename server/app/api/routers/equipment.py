"""
Equipment router.

Defines API endpoints related to equipment.
It receives requests from the client, checks the data,
gets access to the database, and sends the request to the service
that handles the main logic.
"""
from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session

from app.services.inventory import get_available_equipment_list, get_equipment_by_id
from app.schemas.pydantic import EquipmentListResponse, AvailabilityResponse, EquipmentOut
from app.services.bookings_service import check_equipment_availability
from app.db.database import get_db

# Create router with a common prefix and tag
router = APIRouter(prefix="/api/equipment", tags=["equipment"])


# Return list of all available equipment
@router.get("", response_model=EquipmentListResponse)
def list_equipment():
    return get_available_equipment_list()


# Return details of one equipment item
@router.get("/{equipment_id}", response_model=EquipmentOut)
def get_equipment_details(equipment_id: int):
    equipment = get_equipment_by_id(equipment_id)

    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")

    return equipment

# Check if equipment is available for given dates and quantity
@router.get("/{equipment_id}/availability", response_model=AvailabilityResponse)
def get_equipment_availability(
    equipment_id: int,
    startDate: str = Query(...),
    endDate: str = Query(...),
    quantity: int = Query(...),
    db: Session = Depends(get_db),
):
    # Call service to check availability
    return check_equipment_availability(
        db=db,
        equipment_id=equipment_id,
        start_date=startDate,
        end_date=endDate,
        quantity=quantity,
    )