from sqlalchemy.orm import Session
from .. import models
from ..intelligence.detector import detect_food
from ..intelligence.scorer import compute_score
from ..intelligence.geo import extract_location, detect_event_type, geocode
from .base import RawEvent
from .devfolio import DevfolioScraper
from .unstop import UnstopScraper


ALL_SCRAPERS = [
    DevfolioScraper(),
    UnstopScraper(),
]


def run_ingestion(db: Session, limit: int = 10, sources: list[str] | None = None):
    """
    Master ingestion pipeline:
    1. Run scrapers
    2. Detect food + score
    3. Extract location + geocode
    4. Dedup by URL
    5. Store to DB
    Returns list of newly saved events.
    """
    raw_events: list[RawEvent] = []

    for scraper in ALL_SCRAPERS:
        if sources and scraper.__class__.__name__.lower().replace("scraper", "") not in [s.lower() for s in sources]:
            continue
        try:
            raw_events.extend(scraper.scrape(limit=limit))
        except Exception as e:
            print(f"  [ingestion] Scraper {scraper.__class__.__name__} failed: {e}")

    print(f"  [ingestion] Total raw events: {len(raw_events)}")

    new_events = []
    for raw in raw_events:
        # Dedup
        existing = db.query(models.Event).filter(models.Event.url == raw.url).first()
        if existing:
            print(f"  [dedup] Skipping: {raw.title}")
            continue

        # Intelligence
        food_detected, keywords, food_score = detect_food(raw.description)
        city = extract_location(raw.location_text)
        event_type = detect_event_type(raw.description)
        relevance_score = compute_score(food_score, raw.description)
        lat, lon = geocode(city)

        event = models.Event(
            title=raw.title,
            description=raw.description[:5000],
            url=raw.url,
            city=city,
            event_type=event_type,
            lat=lat,
            lon=lon,
            food_score=food_score,
            relevance_score=relevance_score,
            source=raw.source,
            keywords=keywords,
            start_date=raw.start_date,
        )
        db.add(event)
        new_events.append(event)
        print(f"  [new] {raw.title} | city={city} | type={event_type} | food={food_score} | score={relevance_score}")

    db.commit()
    print(f"  [ingestion] Saved {len(new_events)} new events.")
    return new_events
