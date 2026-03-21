EQUIPMENT_ITEMS = [
    {
        "id": 1,
        "name": "Canon EOS R6",
        "category": "Camera",
        "pricePerDay": 120,
        "availableQuantity": 3,
        "imageUrl": "https://picsum.photos/200/140?random=1",
    },
    {
        "id": 2,
        "name": "Sony A7 III",
        "category": "Camera",
        "pricePerDay": 140,
        "availableQuantity": 2,
        "imageUrl": "https://picsum.photos/200/140?random=2",
    },
    {
        "id": 3,
        "name": "Tripod Pro",
        "category": "Accessories",
        "pricePerDay": 35,
        "availableQuantity": 5,
        "imageUrl": "https://picsum.photos/200/140?random=3",
    },
]

# Return all available equipment items and total count
def get_available_equipment_list():
    return {
        "items": EQUIPMENT_ITEMS,
        "total": len(EQUIPMENT_ITEMS),
    }

# Find and return a single equipment item by its ID
def get_equipment_by_id(equipment_id: int):
    for item in EQUIPMENT_ITEMS:
        if item["id"] == equipment_id:
            return item
    return None