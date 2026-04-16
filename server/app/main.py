"""
Main entry point of the FastAPI application.

Initializes the FastAPI app, connects to the database,
creates tables, registers routers, and configures middleware.
This file ties all backend components together.
"""
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from app.db.database import Base, engine
from app.demo_seed import run_demo_seed
from app.api.routers import bookings, products, users, stores, equipment, uploads, wishlist, reviews
from app.api.routers import auth

app = FastAPI()

_TESTING = os.environ.get("TESTING") == "1"

Base.metadata.create_all(bind=engine)


def _ensure_booking_fulfillment_columns():
    """Existing DBs may lack fulfillment columns; create_all does not add new columns."""
    with engine.begin() as conn:
        if engine.dialect.name == "sqlite":
            rows = conn.execute(text("PRAGMA table_info(bookings)")).fetchall()
            col_names = {row[1] for row in rows}
            if "fulfillment_status" not in col_names:
                conn.execute(
                    text(
                        "ALTER TABLE bookings ADD COLUMN fulfillment_status VARCHAR(20) DEFAULT 'pending'"
                    )
                )
            if "returned_at" not in col_names:
                conn.execute(
                    text("ALTER TABLE bookings ADD COLUMN returned_at DATETIME")
                )
            conn.execute(
                text(
                    "UPDATE bookings SET fulfillment_status = 'pending' "
                    "WHERE fulfillment_status IS NULL"
                )
            )
        elif engine.dialect.name == "postgresql":
            conn.execute(
                text(
                    "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(20) NOT NULL DEFAULT 'pending'"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS returned_at TIMESTAMP"
                )
            )


def _ensure_booking_damage_columns():
    """Existing DBs may lack damage report columns."""
    with engine.begin() as conn:
        if engine.dialect.name == "sqlite":
            rows = conn.execute(text("PRAGMA table_info(bookings)")).fetchall()
            col_names = {row[1] for row in rows}
            if "damage_notes" not in col_names:
                conn.execute(text("ALTER TABLE bookings ADD COLUMN damage_notes TEXT"))
            if "damage_reported_at" not in col_names:
                conn.execute(
                    text("ALTER TABLE bookings ADD COLUMN damage_reported_at DATETIME")
                )
            if "picked_up_at" not in col_names:
                conn.execute(
                    text("ALTER TABLE bookings ADD COLUMN picked_up_at DATETIME")
                )
        elif engine.dialect.name == "postgresql":
            conn.execute(
                text(
                    "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS damage_notes TEXT"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS damage_reported_at TIMESTAMP"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP"
                )
            )


def _ensure_stores_logo_url_column():
    """Existing DBs may lack logo_url; create_all does not add new columns."""
    if engine.dialect.name != "postgresql":
        return
    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500)"
            )
        )


if not _TESTING:
    _ensure_booking_fulfillment_columns()
    _ensure_booking_damage_columns()
    _ensure_stores_logo_url_column()

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


if not _TESTING:
    run_demo_seed()

app.include_router(bookings.router)
app.include_router(products.router)
app.include_router(users.router)
app.include_router(stores.router)
app.include_router(equipment.router)
app.include_router(auth.router)
app.include_router(uploads.router)
app.include_router(wishlist.router)
app.include_router(reviews.router)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
# Configure CORS middleware:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint to verify that the API is running
@app.get("/")
def root():
    return {"message": "Equipment Rental API is running"}