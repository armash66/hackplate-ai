from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from clerk_backend_api import Clerk
import jwt

from ..config import get_settings
from ..database import get_db
from .. import models

settings = get_settings()

# We only need the token parsing from OAuth2 (FastAPI will grab the Bearer token)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="placeholder")

# Initialize the Clerk SDK
clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> models.User | None:
    from clerk_backend_api.security import AuthenticateRequestOptions
    
    # If no authorization header is present at all, allow the request to proceed as anonymous
    # Endpoints that *require* auth should check if `user is None` inside the endpoint.
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None

    try:
        req_state = clerk.authenticate_request(
            request,
            AuthenticateRequestOptions()
        )
    except Exception as e:
        print(f"Clerk Auth Exception: {e}")
        return None

    if not req_state.is_signed_in:
        return None
        
    clerk_id = req_state.payload.get("sub")
    email = req_state.payload.get("email") # Clerk JWT can include this if configured, or we can fetch it. Or we just get it if it's there.
    # Note: By default Clerk session JWTs might not include email unless added to session token template.
    # For now, we will try to extract it from the payload if it was injected. 
    # If not, it will be None, which is fine since email is nullable=True in DB.

    # Find the user by their unique Clerk ID in our local database
    user = db.query(models.User).filter(models.User.clerk_id == clerk_id).first()
    
    # Auto-provision the user if this is their first time accessing the backend
    if not user:
        user = models.User(clerk_id=clerk_id, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif email and user.email != email:
        # Update email if it changed or was previously null
        user.email = email
        db.commit()
        db.refresh(user)
        
    return user
