from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.database import get_db
from app.models import User
from app.schemas.schemas import RegisterIn, LoginIn, UserOut
from app.services.security import hash_password, verify_password, create_token
from app.dependencies import current_user
router = APIRouter(prefix="/api/auth", tags=["Authentication"])
@router.post('/register')
def register(data: RegisterIn, db: Session = Depends(get_db)):
    email = data.email.lower()
    if db.scalar(select(User).where(func.lower(User.email) == email)): raise HTTPException(409, "An account with this email already exists")
    user = User(name=data.name.strip(), email=email, password_hash=hash_password(data.password), role="customer")
    db.add(user); db.commit(); db.refresh(user)
    return {"access_token": create_token(user.id), "token_type": "bearer", "user": UserOut.model_validate(user)}
@router.post('/login')
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(func.lower(User.email) == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash): raise HTTPException(401, "Invalid email or password")
    if not user.is_active: raise HTTPException(403, "This account is disabled")
    return {"access_token": create_token(user.id), "token_type": "bearer", "user": UserOut.model_validate(user)}
@router.get('/me', response_model=UserOut)
def me(user: User = Depends(current_user)): return user
