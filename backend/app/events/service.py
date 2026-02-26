from sqlalchemy.orm import Session
from .. import models
from ..intelligence.geo import geocode, haversine


def search_events(
    db: Session,
    location: str | None = None,
    radius_km: int = 50,
    min_score: int = 0,
    source: str | None = None,
    event_type: str | None = None,
    food_only: bool = False,
    page: int = 1,
    per_page: int = 20,
) -> list[models.Event]:
    """
    Search events with optional geo-radius filter, scoring threshold, and pagination.
    """
    query = db.query(models.Event)

    # Basic filters
    if source:
        query = query.filter(models.Event.source == source)
    if event_type:
        query = query.filter(models.Event.event_type == event_type)
    if food_only:
        query = query.filter(models.Event.food_score > 0)
    if min_score > 0:
        query = query.filter(models.Event.relevance_score >= min_score)

    # Get all matching events first
    events = query.order_by(models.Event.relevance_score.desc()).all()

    # Apply geo filter if location provided
    if location:
        center_lat, center_lon = geocode(location)
        if center_lat and center_lon:
            events = [
                e for e in events
                if e.lat and e.lon and haversine(center_lat, center_lon, e.lat, e.lon) <= radius_km
            ]

    # Pagination
    start = (page - 1) * per_page
    return events[start:start + per_page]
