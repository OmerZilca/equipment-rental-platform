from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price_per_day = Column(Float, nullable=False)
    available_quantity = Column(Integer, nullable=False)
    image_url = Column(String, nullable=False)

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)

    equipment = relationship("Equipment")