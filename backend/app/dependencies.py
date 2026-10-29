from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.services.security import token_user_id

# Instantiate bearer schema with manual error handling overrides
bearer = HTTPBearer(auto_error=False)


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer), 
    db: Session = Depends(get_db)
) -> User:
    # 1. Evaluate incoming bearer credentials array
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
        
    # 2. Extract and decode the unique user identifier from the token string
    uid = token_user_id(credentials.credentials)
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token session"
        )
        
    # 3. Query the database to retrieve the active target account instance
    user = db.get(User, uid)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
        
    return user


def admin_user(user: User = Depends(current_user)) -> User:
    # Restrict routing execution if user lack administrative scope properties
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required"
        )
        
    return user