from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth.utils import get_current_user
from .service import search_events

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=list[schemas.EventResponse])
def list_events(
    location: str | None = None,
    radius_km: int = 50,
    min_score: int = 0,
    source: str | None = None,
    event_type: str | None = None,
    food_only: bool = False,
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db),
):
    """Search events with filters. No auth required."""
    return search_events(db, location, radius_km, min_score, source,
                         event_type, food_only, page, per_page)


@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/{event_id}/save", status_code=201)
def save_event(
    event_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    existing = db.query(models.SavedEvent).filter(
        models.SavedEvent.user_id == user.id,
        models.SavedEvent.event_id == event_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already saved")

    saved = models.SavedEvent(user_id=user.id, event_id=event_id)
    db.add(saved)
    db.commit()
    return {"message": "Event saved"}


@router.delete("/{event_id}/save", status_code=200)
def unsave_event(
    event_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    saved = db.query(models.SavedEvent).filter(
        models.SavedEvent.user_id == user.id,
        models.SavedEvent.event_id == event_id,
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Not saved")
    db.delete(saved)
    db.commit()
    return {"message": "Event unsaved"}


@router.get("/saved/list", response_model=list[schemas.EventResponse])
def get_saved_events(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    saved = db.query(models.SavedEvent).filter(
        models.SavedEvent.user_id == user.id
    ).all()
    event_ids = [s.event_id for s in saved]
    events = db.query(models.Event).filter(models.Event.id.in_(event_ids)).all()
    return events
