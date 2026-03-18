from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, nullable=False)

    product_name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    category = Column(String(50), nullable=True)

    price_per_day = Column(Float, nullable=False)
    deposit_amount = Column(Float, nullable=False)

    total_quantity = Column(Integer, nullable=False)
    image_url = Column(String(255), nullable=True)

    booking_items = relationship("BookingItem", back_populates="product")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(Integer, nullable=False)
    store_id = Column(Integer, nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    status = Column(String(20), nullable=False, default="confirmed")

    total_price = Column(Float, nullable=False)
    deposit_amount = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

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