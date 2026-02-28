from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .utils import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


# Registration and Login endpoints have been removed.
# Clerk now securely handles all user authentication flows on the frontend.


@router.get("/me", response_model=schemas.UserResponse)
def me(user: models.User = Depends(get_current_user)):
    return user
