def get_available_equipment_list():
    return {
        "items": [
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
        ],
        "total": 3,
    }