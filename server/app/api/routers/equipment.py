from fastapi import APIRouter, Query, HTTPException
from app.services.inventory import get_available_equipment_list, get_equipment_by_id
from app.schemas.pydantic import EquipmentListResponse, AvailabilityResponse, EquipmentOut
from app.services.bookings_service import check_equipment_availability

router = APIRouter(prefix="/api/equipment", tags=["equipment"])


@router.get("", response_model=EquipmentListResponse)
def list_equipment():
    return get_available_equipment_list()


@router.get("/{equipment_id}", response_model=EquipmentOut)
def get_equipment_details(equipment_id: int):
    equipment = get_equipment_by_id(equipment_id)

    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")

    return equipment


@router.get("/{equipment_id}/availability", response_model=AvailabilityResponse)
def get_equipment_availability(
    equipment_id: int,
    startDate: str = Query(...),
    endDate: str = Query(...),
    quantity: int = Query(...),
):
    return check_equipment_availability(
        equipment_id=equipment_id,
        start_date=startDate,
        end_date=endDate,
        quantity=quantity,
    )