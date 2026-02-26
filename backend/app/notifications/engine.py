from sqlalchemy.orm import Session
from .. import models
from ..intelligence.geo import geocode, haversine
from .telegram import send_telegram


def match_and_notify(db: Session, new_events: list[models.Event]):
    """
    Match new events against all user notification rules.
    If a match: dispatch via the configured channel.
    """
    rules = db.query(models.NotificationRule).all()
    if not rules:
        return

    for event in new_events:
        for rule in rules:
            if _matches(event, rule):
                try:
                    _dispatch(event, rule)
                except Exception as e:
                    print(f"  [notify] Dispatch failed for rule {rule.id}: {e}")


def _matches(event: models.Event, rule: models.NotificationRule) -> bool:
    """Check if event matches a notification rule."""
    # Score check
    if event.relevance_score < rule.min_score:
        return False

    # Food check
    if rule.food_required and event.food_score == 0:
        return False

    # Location check (if rule has location)
    if rule.location:
        rule_lat, rule_lon = geocode(rule.location)
        if not rule_lat or not rule_lon:
            print(f"  [notify] Warning: Rule location '{rule.location}' could not be geocoded. Falling back to exact match.")
            if event.city.lower() != rule.location.lower():
                return False
        elif event.lat and event.lon:
            dist = haversine(rule_lat, rule_lon, event.lat, event.lon)
            if dist > rule.radius_km:
                return False
        else:
            # Event has no lat/lon but rule does. Fallback to exact match.
            if event.city.lower() != rule.location.lower():
                return False

    return True


def _dispatch(event: models.Event, rule: models.NotificationRule):
    """Send notification via the configured channel."""
    keywords = event.keywords if isinstance(event.keywords, list) else []

    if rule.channel == "telegram":
        send_telegram(
            title=event.title, url=event.url, city=event.city,
            event_type=event.event_type, score=event.relevance_score,
            keywords=keywords,
        )
    elif rule.channel == "email":
        from .email import send_email
        user_email = rule.user.email if rule.user else "unknown"
        send_email(
            to=user_email,
            subject=f"HackPlate: {event.title}",
            body=f"Score: {event.relevance_score}\nCity: {event.city}\nURL: {event.url}",
        )
