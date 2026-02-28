from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel

from .. import models, schemas
from ..database import get_db
from ..auth.utils import get_current_user


router = APIRouter(prefix="/activity", tags=["activity"])


class SavedSearchCreate(BaseModel):
    latitude: float
    longitude: float
    radius_km: int = 50
    min_score: int = 0
    food_required: bool = False


class NotificationPrefUpdate(BaseModel):
    frequency: str  # instant, daily, weekly
    telegram_enabled: bool
    email_enabled: bool


@router.get("/overview")
def get_user_activity_overview(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Returns a unified overview of the user's saved searches, preferences, and stats."""
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    saved_search = db.query(models.SavedSearch).filter(models.SavedSearch.user_id == user.id).first()
    prefs = db.query(models.NotificationPreference).filter(models.NotificationPreference.user_id == user.id).first()
    
    # Auto-provision default preferences if none exist
    if not prefs:
        prefs = models.NotificationPreference(user_id=user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    total_favorites = db.query(models.SavedEvent).filter(models.SavedEvent.user_id == user.id).count()

    return {
        "saved_search": saved_search,
        "notification_preferences": prefs,
        "total_favorites": total_favorites,
        "email": user.email,
        "joined_at": user.created_at
    }


@router.post("/saved-search")
def upsert_saved_search(
    req: SavedSearchCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Creates or updates the user's primary saved search area."""
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    saved = db.query(models.SavedSearch).filter(models.SavedSearch.user_id == user.id).first()
    
    if saved:
        saved.latitude = req.latitude
        saved.longitude = req.longitude
        saved.radius_km = req.radius_km
        saved.min_score = req.min_score
        saved.food_required = req.food_required
    else:
        saved = models.SavedSearch(
            user_id=user.id,
            latitude=req.latitude,
            longitude=req.longitude,
            radius_km=req.radius_km,
            min_score=req.min_score,
            food_required=req.food_required
        )
        db.add(saved)

    db.commit()
    return {"message": "Saved search updated successfully"}


@router.post("/preferences")
def update_notification_preferences(
    req: NotificationPrefUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Updates the user's notification preferences."""
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    prefs = db.query(models.NotificationPreference).filter(models.NotificationPreference.user_id == user.id).first()
    
    if not prefs:
        prefs = models.NotificationPreference(user_id=user.id)
        db.add(prefs)
        
    prefs.frequency = req.frequency
    prefs.telegram_enabled = req.telegram_enabled
    prefs.email_enabled = req.email_enabled
    
    db.commit()
    return {"message": "Preferences updated successfully"}
