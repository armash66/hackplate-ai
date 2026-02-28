from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from clerk_backend_api import Clerk
import jwt

from ..config import get_settings
from ..database import get_db
from .. import models

settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="placeholder")

clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)


def _fetch_clerk_email(clerk_user_id: str) -> str | None:
    """Fetch the user's primary email from Clerk API."""
    try:
        user_data = clerk.users.get(user_id=clerk_user_id)
        if user_data and user_data.email_addresses:
            # Find the primary email
            for addr in user_data.email_addresses:
                if addr.id == user_data.primary_email_address_id:
                    return addr.email_address
            # Fallback: return first email
            return user_data.email_addresses[0].email_address
    except Exception as e:
        print(f"  [clerk] Failed to fetch email for {clerk_user_id}: {e}")
    return None


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> models.User | None:
    from clerk_backend_api.security import AuthenticateRequestOptions
    
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

    # Find the user by their unique Clerk ID
    user = db.query(models.User).filter(models.User.clerk_id == clerk_id).first()
    
    if not user:
        # New user — fetch email from Clerk API
        email = _fetch_clerk_email(clerk_id)
        user = models.User(clerk_id=clerk_id, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"  [auth] New user provisioned: {email}")
    elif not user.email:
        # Existing user missing email — fetch it
        email = _fetch_clerk_email(clerk_id)
        if email:
            user.email = email
            db.commit()
            db.refresh(user)
            print(f"  [auth] Email updated for user: {email}")
        
    return user
