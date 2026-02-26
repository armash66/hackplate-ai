from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=schemas.AnalyticsOverview)
def overview(db: Session = Depends(get_db)):
    total = db.query(models.Event).count()
    food = db.query(models.Event).filter(models.Event.food_score > 0).count()

    # Events by source
    source_counts = db.query(
        models.Event.source, func.count(models.Event.id)
    ).group_by(models.Event.source).all()
    by_source = {s: c for s, c in source_counts}

    # Top city
    city_counts = db.query(
        models.Event.city, func.count(models.Event.id)
    ).filter(models.Event.city != "Unknown").group_by(models.Event.city).order_by(
        func.count(models.Event.id).desc()
    ).first()
    top_city = city_counts[0] if city_counts else "N/A"

    return schemas.AnalyticsOverview(
        total_events=total,
        food_events=food,
        total_sources=len(by_source),
        top_city=top_city,
        events_by_source=by_source,
    )


@router.get("/trends", response_model=list[schemas.AnalyticsTrend])
def trends(db: Session = Depends(get_db)):
    """Events scraped per day (last 30 days)."""
    rows = db.query(
        func.date(models.Event.created_at).label("date"),
        func.count(models.Event.id).label("count"),
    ).group_by(func.date(models.Event.created_at)).order_by(
        func.date(models.Event.created_at).desc()
    ).limit(30).all()

    return [schemas.AnalyticsTrend(date=str(r.date), count=r.count) for r in rows]
