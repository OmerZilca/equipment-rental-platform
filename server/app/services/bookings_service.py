from datetime import date
from fastapi import HTTPException
from app.schemas.pydantic import BookingCreate
from app.services.inventory import get_equipment_by_id

BOOKINGS = []


def dates_overlap(start_1: str, end_1: str, start_2: str, end_2: str) -> bool:
    start_date_1 = date.fromisoformat(start_1)
    end_date_1 = date.fromisoformat(end_1)
    start_date_2 = date.fromisoformat(start_2)
    end_date_2 = date.fromisoformat(end_2)

    return start_date_1 <= end_date_2 and start_date_2 <= end_date_1

def check_equipment_availability(
    equipment_id: int,
    start_date: str,
    end_date: str,
    quantity: int,
):
    equipment = get_equipment_by_id(equipment_id)

    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    overlapping_quantity = 0

    for existing_booking in BOOKINGS:
        is_same_equipment = existing_booking["equipmentId"] == equipment_id
        has_date_overlap = dates_overlap(
            existing_booking["startDate"],
            existing_booking["endDate"],
            start_date,
            end_date,
        )

        if is_same_equipment and has_date_overlap:
            overlapping_quantity += existing_booking["quantity"]

    total_requested_quantity = overlapping_quantity + quantity
    is_available = total_requested_quantity <= equipment["availableQuantity"]

    return {
        "equipmentId": equipment_id,
        "available": is_available,
        "requestedQuantity": quantity,
        "availableQuantity": equipment["availableQuantity"],
        "overlappingQuantity": overlapping_quantity,
    }

def create_booking_service(booking: BookingCreate):
    equipment = get_equipment_by_id(booking.equipmentId)

    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if booking.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    if booking.quantity > equipment["availableQuantity"]:
        raise HTTPException(status_code=400, detail="Not enough equipment available")

    overlapping_quantity = 0

    for existing_booking in BOOKINGS:
        is_same_equipment = existing_booking["equipmentId"] == booking.equipmentId
        has_date_overlap = dates_overlap(
            existing_booking["startDate"],
            existing_booking["endDate"],
            booking.startDate,
            booking.endDate,
        )

        if is_same_equipment and has_date_overlap:
            overlapping_quantity += existing_booking["quantity"]

    total_requested_quantity = overlapping_quantity + booking.quantity

    if total_requested_quantity > equipment["availableQuantity"]:
        raise HTTPException(
            status_code=400,
            detail="Not enough equipment available for the selected dates",
        )

    booking_dict = booking.model_dump()
    BOOKINGS.append(booking_dict)

    return {
        "message": "Booking created successfully",
        "booking": booking_dict,
    }