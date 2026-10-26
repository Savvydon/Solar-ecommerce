from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.services.security import token_user_id
bearer = HTTPBearer(auto_error=False)
def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> User:
    uid = token_user_id(credentials.credentials) if credentials else None
    user = db.get(User, uid) if uid else None
    if not user or not user.is_active: raise HTTPException(401, "Authentication required")
    return user
def admin_user(user: User = Depends(current_user)) -> User:
    if user.role != "admin": raise HTTPException(403, "Administrator access required")
    return user
