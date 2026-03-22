"""
Database models.

Defines the main tables in the system:
- User: system users such as customers and business owners
- Store: a business store owned by a user
- Product: equipment available for rent
- Booking: a customer order with dates and total price
- BookingItem: links products to a booking with quantity and pricing

These models represent the database structure and relationships.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone_number = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)

    stores = relationship("Store", back_populates="owner")
    bookings = relationship("Booking", back_populates="customer")


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    store_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String(255), nullable=True)
    opening_hours = Column(String(100), nullable=True)

    owner = relationship("User", back_populates="stores")
    products = relationship("Product", back_populates="store")
    bookings = relationship("Booking", back_populates="store")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)

    product_name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    category = Column(String(50), nullable=True)

    price_per_day = Column(Float, nullable=False)
    deposit_amount = Column(Float, nullable=False)

    total_quantity = Column(Integer, nullable=False)
    image_url = Column(String(255), nullable=True)

    store = relationship("Store", back_populates="products")
    booking_items = relationship("BookingItem", back_populates="product")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    status = Column(String(20), nullable=False, default="confirmed")

    total_price = Column(Float, nullable=False)
    deposit_amount = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("User", back_populates="bookings")
    store = relationship("Store", back_populates="bookings")
    items = relationship("BookingItem", back_populates="booking")


class BookingItem(Base):
    __tablename__ = "booking_items"

    id = Column(Integer, primary_key=True, index=True)

    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    quantity = Column(Integer, nullable=False)

    price_per_day = Column(Float, nullable=False)
    deposit_amount = Column(Float, nullable=False)

    booking = relationship("Booking", back_populates="items")
    product = relationship("Product", back_populates="booking_items")