"""
Main entry point of the FastAPI application.

Initializes the FastAPI app, connects to the database,
creates tables, registers routers, and configures middleware.
This file ties all backend components together.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.db import models

from app.api.routers import bookings, products, users

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(bookings.router)
app.include_router(products.router)
app.include_router(users.router)

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