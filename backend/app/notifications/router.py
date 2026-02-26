from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth.utils import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/rules", response_model=list[schemas.NotificationRuleResponse])
def list_rules(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return db.query(models.NotificationRule).filter(
        models.NotificationRule.user_id == user.id
    ).all()


@router.post("/rules", response_model=schemas.NotificationRuleResponse, status_code=201)
def create_rule(
    data: schemas.NotificationRuleCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    rule = models.NotificationRule(
        user_id=user.id,
        location=data.location,
        radius_km=data.radius_km,
        min_score=data.min_score,
        food_required=data.food_required,
        channel=data.channel,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/rules/{rule_id}", status_code=200)
def delete_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    rule = db.query(models.NotificationRule).filter(
        models.NotificationRule.id == rule_id,
        models.NotificationRule.user_id == user.id,
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"message": "Rule deleted"}
