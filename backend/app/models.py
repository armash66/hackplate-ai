import uuid
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Uuid
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    clerk_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, nullable=True) # Will be populated from Clerk
    created_at = Column(DateTime, default=datetime.utcnow)

    notification_rules = relationship("NotificationRule", back_populates="user")
    notification_preferences = relationship("NotificationPreference", back_populates="user", uselist=False)
    saved_events = relationship("SavedEvent", back_populates="user")
    saved_searches = relationship("SavedSearch", back_populates="user")


class Event(Base):
    __tablename__ = "events"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, default="")
    url = Column(String(1000), unique=True, nullable=False, index=True) # V4: url must be unique
    city = Column(String(200), default="Unknown")
    event_type = Column(String(50), default="Unknown")  # Online / Offline / Hybrid
    lat = Column(Float, nullable=True, index=True) # V4: index latitude
    lon = Column(Float, nullable=True, index=True) # V4: index longitude
    food_score = Column(Integer, default=0)
    relevance_score = Column(Integer, default=0)
    total_score = Column(Integer, default=0, index=True) # V4: Add total_score with index
    food_confidence = Column(Float, default=0.0) # V4: Add food_confidence
    source = Column(String(100), default="unknown")
    keywords = Column(JSON, default=list)
    start_date = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    saved_by = relationship("SavedEvent", back_populates="event")


class NotificationRule(Base):
    __tablename__ = "notification_rules"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    location = Column(String(200), nullable=False)
    radius_km = Column(Integer, default=50)
    min_score = Column(Integer, default=3)
    food_required = Column(Boolean, default=True)
    channel = Column(String(50), default="telegram")  # telegram / email
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notification_rules")


class SavedEvent(Base):
    __tablename__ = "saved_events"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    event_id = Column(Uuid(as_uuid=True), ForeignKey("events.id"), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_events")
    event = relationship("Event", back_populates="saved_by")


class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Integer, default=50)
    min_score = Column(Integer, default=0)
    food_required = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_searches")


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    frequency = Column(String(50), default="instant") # instant, daily, weekly
    telegram_enabled = Column(Boolean, default=False)
    email_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notification_preferences")
