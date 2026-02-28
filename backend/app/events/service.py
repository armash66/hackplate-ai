from sqlalchemy.orm import Session
from .. import models
from ..intelligence.geo import geocode, haversine


from uuid import UUID

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
    user_id: UUID | None = None,
) -> list[models.Event]:
    """
    Search events with optional geo-radius filter, scoring threshold, and pagination.
    If a user_id is provided, their primary SavedSearch implicitly overrides the defaults.
    """
    
    # If user context passed, try to apply their saved search
    if user_id and not location:
        saved = db.query(models.SavedSearch).filter(models.SavedSearch.user_id == user_id).first()
        if saved:
            # We skip location text geo-coding and just filter by direct lat/lon later
            radius_km = saved.radius_km
            min_score = saved.min_score
            food_only = saved.food_required 
            # Inject a custom attribute to signal direct lat/lon filtering
            setattr(search_events, "direct_lat", saved.latitude)
            setattr(search_events, "direct_lon", saved.longitude)

    query = db.query(models.Event)

    # Basic strict filters
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

    # Apply geo filter if location provided or SavedSearch lat/lon was extracted
    direct_lat = getattr(search_events, "direct_lat", None)
    direct_lon = getattr(search_events, "direct_lon", None)

    if direct_lat and direct_lon:
        events = [
            e for e in events
            if e.lat and e.lon and haversine(direct_lat, direct_lon, e.lat, e.lon) <= radius_km
        ]
        # Clear the hacky attribute
        delattr(search_events, "direct_lat")
        delattr(search_events, "direct_lon")
    elif location:
        center_lat, center_lon = geocode(location)
        if center_lat and center_lon:
            events = [
                e for e in events
                if e.lat and e.lon and haversine(center_lat, center_lon, e.lat, e.lon) <= radius_km
            ]

    # Pagination
    start = (page - 1) * per_page
    return events[start:start + per_page]
