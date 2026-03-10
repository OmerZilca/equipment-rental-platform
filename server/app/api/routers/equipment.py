
from fastapi import APIRouter
from app.services.inventory import get_available_equipment_list
from app.schemas.pydantic import EquipmentListResponse

router = APIRouter(prefix="/api/equipment", tags=["equipment"])


@router.get("", response_model=EquipmentListResponse)
def list_equipment():
    return get_available_equipment_list()