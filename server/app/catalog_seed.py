"""
Demo catalog: several fictional rental businesses and their products.

Image files live under server/uploads/; names must match image_file exactly
on case-sensitive systems. URLs use PUBLIC_API_BASE (must match the port the
API listens on, default http://localhost:8001 — same as the Vite client’s API).
"""
import os

# One store per business_owner account (app rule). Each entry = owner + store + products.
DEMO_BUSINESSES: list[dict] = [
    {
        "owner_email": "owner@example.com",
        "owner_full_name": "Demo Owner",
        "owner_phone": "0500000000",
        "store": {
            "store_name": "Optic House — Camera rental",
            "description": "Demo shop for pro mirrorless bodies, lenses, and accessories. Pickup in Tel Aviv.",
            "address": "12 HaArba'a St, Tel Aviv",
            "opening_hours": "Sun–Thu 9:00–19:00, Fri 9:00–14:00",
        },
        "products": [
            {
                "id": 1,
                "product_name": "Sony Alpha 7 IV",
                "description": "Full-frame 33 MP, S-Log, fast AF — ideal for stills and video on small productions or location work.",
                "category": "Camera",
                "price_per_day": 150.0,
                "deposit_amount": 450.0,
                "total_quantity": 2,
                "image_file": "camera1.jpg",
            },
            {
                "id": 2,
                "product_name": "Canon EOS R6 Mark II",
                "description": "Full-frame mirrorless with IBIS and strong burst shooting — great for sports and events.",
                "category": "Camera",
                "price_per_day": 135.0,
                "deposit_amount": 400.0,
                "total_quantity": 2,
                "image_file": "camera2.jpg",
            },
            {
                "id": 3,
                "product_name": "Fujifilm X-T5",
                "description": "Compact body, 40 MP sensor, film-simulation profiles — light for travel and street work.",
                "category": "Camera",
                "price_per_day": 110.0,
                "deposit_amount": 330.0,
                "total_quantity": 3,
                "image_file": "camera3.jpg",
            },
        ],
    },
    {
        "owner_email": "speakers.owner@example.com",
        "owner_full_name": "Sound Yard Demo",
        "owner_phone": "0500000002",
        "store": {
            "store_name": "Sound Yard — Speakers & PA",
            "description": "Demo PA for parties, corporate events, and small gigs. Pickup or delivery by arrangement.",
            "address": "35 HaMasger St, Tel Aviv",
            "opening_hours": "Sun–Thu 10:00–20:00",
        },
        "products": [
            {
                "id": 4,
                "product_name": 'Powered 12" loudspeaker',
                "description": "Use as a pair with a sub — suits small halls and backyard setups.",
                "category": "Audio",
                "price_per_day": 85.0,
                "deposit_amount": 200.0,
                "total_quantity": 6,
                "image_file": "speaker1.jpg",
            },
            {
                "id": 5,
                "product_name": '15" subwoofer',
                "description": "Deep low end for events — pairs with a main speaker pair.",
                "category": "Audio",
                "price_per_day": 95.0,
                "deposit_amount": 250.0,
                "total_quantity": 4,
                "image_file": "speaker2.jpg",
            },
            {
                "id": 6,
                "product_name": "Portable speaker pair + compact mixer",
                "description": "All-in-one day rental — quick setup for a stall or rooftop party.",
                "category": "Audio",
                "price_per_day": 120.0,
                "deposit_amount": 300.0,
                "total_quantity": 3,
                "image_file": "speaker3.jpg",
            },
        ],
    },
    {
        "owner_email": "tents.owner@example.com",
        "owner_full_name": "Trail Base Demo",
        "owner_phone": "0500000003",
        "store": {
            "store_name": "Trail Base — Tent rental",
            "description": "Demo camping and event tents for families, festivals, and nights outdoors.",
            "address": "8 Derech HaShalom, Ramat Gan",
            "opening_hours": "Sun–Fri 9:00–18:00",
        },
        "products": [
            {
                "id": 7,
                "product_name": "Family dome tent (4-person)",
                "description": "Roomy with easy entry and solid airflow — weekend camping friendly.",
                "category": "Tent",
                "price_per_day": 45.0,
                "deposit_amount": 120.0,
                "total_quantity": 5,
                "image_file": "tent1.jpg",
            },
            {
                "id": 8,
                "product_name": "Lightweight 2-person backpacking tent",
                "description": "Low pack weight for trails and day hikes — includes stakes and guy lines.",
                "category": "Tent",
                "price_per_day": 35.0,
                "deposit_amount": 90.0,
                "total_quantity": 8,
                "image_file": "tent2.jpg",
            },
            {
                "id": 9,
                "product_name": "Event canopy 3×3 m",
                "description": "Shade and a stable frame for markets or a backyard celebration.",
                "category": "Tent",
                "price_per_day": 55.0,
                "deposit_amount": 150.0,
                "total_quantity": 4,
                "image_file": "tent3.jpg",
            },
            {
                "id": 10,
                "product_name": "4-season 3-person tent",
                "description": "Better insulation for cold nights — open ground and mild winter use.",
                "category": "Tent",
                "price_per_day": 65.0,
                "deposit_amount": 180.0,
                "total_quantity": 3,
                "image_file": "tent4.jpg",
            },
        ],
    },
    {
        "owner_email": "bags.owner@example.com",
        "owner_full_name": "Carry On Demo",
        "owner_phone": "0500000004",
        "store": {
            "store_name": "Carry On — Bags & backpacks",
            "description": "Demo gear bags, backpacks, and rolling cases for photo, travel, and events.",
            "address": "102 Allenby St, Tel Aviv",
            "opening_hours": "Sun–Thu 9:00–19:00",
        },
        "products": [
            {
                "id": 11,
                "product_name": "XL rolling gear case",
                "description": "Protects fragile kit — cameras, drones, and small audio gear.",
                "category": "Bag",
                "price_per_day": 40.0,
                "deposit_amount": 100.0,
                "total_quantity": 6,
                "image_file": "bag1.jpg",
            },
            {
                "id": 12,
                "product_name": "40L technical backpack",
                "description": "Laptop and lens compartments — comfortable for a full day on location.",
                "category": "Bag",
                "price_per_day": 28.0,
                "deposit_amount": 70.0,
                "total_quantity": 10,
                "image_file": "bag2.jpg",
            },
            {
                "id": 13,
                "product_name": "90L waterproof duffel",
                "description": "Beach or wet conditions — roll-top seal and carry straps.",
                "category": "Bag",
                "price_per_day": 22.0,
                "deposit_amount": 50.0,
                "total_quantity": 8,
                "image_file": "bag3.jpg",
            },
            {
                "id": 14,
                "product_name": "Laptop + camera day bag",
                "description": "City-friendly size — padded dividers and a pocket for personal items.",
                "category": "Bag",
                "price_per_day": 18.0,
                "deposit_amount": 40.0,
                "total_quantity": 12,
                "image_file": "bag4.jpg",
            },
        ],
    },
    {
        "owner_email": "drones.owner@example.com",
        "owner_full_name": "Skyline Demo",
        "owner_phone": "0500000005",
        "store": {
            "store_name": "Skyline — Drone rental",
            "description": "Demo fleet for aerial photo/video, inspections, and events. Briefing on local rules included.",
            "address": "7 HaYarkon St, Tel Aviv",
            "opening_hours": "Sun–Thu 9:00–18:00",
        },
        "products": [
            {
                "id": 15,
                "product_name": "Compact 4K folding drone kit",
                "description": "Small footprint for travel — stabilized 4K video, obstacle sensing, three batteries in the case.",
                "category": "Drone",
                "price_per_day": 95.0,
                "deposit_amount": 350.0,
                "total_quantity": 4,
                "image_file": "drone1.jpg",
            },
            {
                "id": 16,
                "product_name": "Pro aerial camera drone (1\" sensor)",
                "description": "Higher dynamic range and low-light performance — suitable for real-estate and production B-roll.",
                "category": "Drone",
                "price_per_day": 185.0,
                "deposit_amount": 600.0,
                "total_quantity": 2,
                "image_file": "drone2.jpg",
            },
            {
                "id": 17,
                "product_name": "Cinema gimbal drone bundle",
                "description": "Heavier lift for cinema cameras (payload limits apply) — includes dual-operator option and hard case.",
                "category": "Drone",
                "price_per_day": 320.0,
                "deposit_amount": 1200.0,
                "total_quantity": 1,
                "image_file": "drone3.jpg",
            },
        ],
    },
]


def default_public_base() -> str:
    return os.environ.get("PUBLIC_API_BASE", "http://localhost:8001").rstrip("/")


def upload_file_url(public_base: str, filename: str) -> str:
    return f"{public_base.rstrip('/')}/uploads/{filename}"
