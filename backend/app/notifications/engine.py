from sqlalchemy.orm import Session
from .. import models
from ..intelligence.geo import geocode, haversine
from .telegram import send_telegram
from .email import send_email


def match_and_notify(db: Session, new_events: list[models.Event]):
    """
    Notify users about new events based on:
    1. NotificationRules (location-based alert rules)
    2. NotificationPreferences (global telegram/email toggles from Settings)
    """
    if not new_events:
        return

    # ── 1. Rule-based notifications (legacy per-rule system) ──
    rules = db.query(models.NotificationRule).all()
    for event in new_events:
        for rule in rules:
            if _matches(event, rule):
                try:
                    _dispatch_rule(event, rule)
                except Exception as e:
                    print(f"  [notify] Rule dispatch failed: {e}")

    # ── 2. Preference-based notifications (Settings toggles) ──
    prefs = (
        db.query(models.NotificationPreference)
        .join(models.User, models.User.id == models.NotificationPreference.user_id)
        .all()
    )

    for pref in prefs:
        if not pref.telegram_enabled and not pref.email_enabled:
            continue

        # Get user's saved search to filter events by location
        saved_search = (
            db.query(models.SavedSearch)
            .filter(models.SavedSearch.user_id == pref.user_id)
            .first()
        )

        for event in new_events:
            # If user has a saved search, check if event matches
            if saved_search:
                if event.relevance_score < saved_search.min_score:
                    continue
                if saved_search.food_required and event.food_score == 0:
                    continue
                if saved_search.latitude and saved_search.longitude and event.lat and event.lon:
                    dist = haversine(saved_search.latitude, saved_search.longitude, event.lat, event.lon)
                    if dist > saved_search.radius_km:
                        continue

            # Send via enabled channels
            user = db.query(models.User).filter(models.User.id == pref.user_id).first()

            if pref.telegram_enabled:
                keywords = event.keywords if isinstance(event.keywords, list) else []
                send_telegram(
                    title=event.title, url=event.url, city=event.city,
                    event_type=event.event_type, score=event.relevance_score,
                    keywords=keywords,
                )

            if pref.email_enabled and user and user.email:
                food_text = "🍕 Food available" if event.food_score > 0 else "No food info"
                body = (
                    f"New event discovered!\n\n"
                    f"Title: {event.title}\n"
                    f"City: {event.city}\n"
                    f"Type: {event.event_type}\n"
                    f"Score: {event.relevance_score}\n"
                    f"{food_text}\n\n"
                    f"View: {event.url}"
                )
                send_email(
                    to=user.email,
                    subject=f"HackPlate: {event.title}",
                    body=body,
                )


def _matches(event: models.Event, rule: models.NotificationRule) -> bool:
    """Check if event matches a notification rule."""
    if event.relevance_score < rule.min_score:
        return False
    if rule.food_required and event.food_score == 0:
        return False
    if rule.location:
        rule_lat, rule_lon = geocode(rule.location)
        if not rule_lat or not rule_lon:
            if event.city.lower() != rule.location.lower():
                return False
        elif event.lat and event.lon:
            dist = haversine(rule_lat, rule_lon, event.lat, event.lon)
            if dist > rule.radius_km:
                return False
        else:
            if event.city.lower() != rule.location.lower():
                return False
    return True


def _dispatch_rule(event: models.Event, rule: models.NotificationRule):
    """Send notification for a matched rule."""
    keywords = event.keywords if isinstance(event.keywords, list) else []
    if rule.channel == "telegram":
        send_telegram(
            title=event.title, url=event.url, city=event.city,
            event_type=event.event_type, score=event.relevance_score,
            keywords=keywords,
        )
    elif rule.channel == "email":
        user_email = rule.user.email if rule.user else None
        if user_email:
            send_email(
                to=user_email,
                subject=f"HackPlate: {event.title}",
                body=f"Score: {event.relevance_score}\nCity: {event.city}\nURL: {event.url}",
            )
