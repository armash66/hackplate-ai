from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    notification_rules = relationship("NotificationRule", back_populates="user")
    saved_events = relationship("SavedEvent", back_populates="user")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, default="")
    url = Column(String(1000), unique=True, nullable=False, index=True)
    city = Column(String(200), default="Unknown")
    event_type = Column(String(50), default="Unknown")  # Online / Offline / Hybrid
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    food_score = Column(Integer, default=0)
    relevance_score = Column(Integer, default=0)
    source = Column(String(100), default="unknown")
    keywords = Column(JSON, default=list)
    start_date = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    saved_by = relationship("SavedEvent", back_populates="event")


class NotificationRule(Base):
    __tablename__ = "notification_rules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    location = Column(String(200), nullable=False)
    radius_km = Column(Integer, default=50)
    min_score = Column(Integer, default=3)
    food_required = Column(Boolean, default=True)
    channel = Column(String(50), default="telegram")  # telegram / email
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notification_rules")


class SavedEvent(Base):
    __tablename__ = "saved_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_events")
    event = relationship("Event", back_populates="saved_by")
