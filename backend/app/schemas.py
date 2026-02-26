from pydantic import BaseModel, EmailStr
from datetime import datetime


# --- Auth ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Events ---
class EventResponse(BaseModel):
    id: int
    title: str
    description: str
    url: str
    city: str
    event_type: str
    lat: float | None
    lon: float | None
    food_score: int
    relevance_score: int
    source: str
    keywords: list[str]
    start_date: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class EventSearchParams(BaseModel):
    location: str | None = None
    radius_km: int = 50
    min_score: int = 0
    source: str | None = None
    event_type: str | None = None
    food_only: bool = False
    page: int = 1
    per_page: int = 20


# --- Notifications ---
class NotificationRuleCreate(BaseModel):
    location: str
    radius_km: int = 50
    min_score: int = 3
    food_required: bool = True
    channel: str = "telegram"


class NotificationRuleResponse(BaseModel):
    id: int
    location: str
    radius_km: int
    min_score: int
    food_required: bool
    channel: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Analytics ---
class AnalyticsOverview(BaseModel):
    total_events: int
    food_events: int
    total_sources: int
    top_city: str
    events_by_source: dict[str, int]


class AnalyticsTrend(BaseModel):
    date: str
    count: int
