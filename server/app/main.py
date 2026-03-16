from fastapi import FastAPI
from app.api.routers import equipment, bookings
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.db import models

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(equipment.router)
app.include_router(bookings.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Equipment Rental API is running"}