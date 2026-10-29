from fastapi import APIRouter, Depends, HTTPException, status
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
    
    # 1. Check for pre-existing account records
    existing_user = db.scalar(
        select(User).where(func.lower(User.email) == email)
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="An account with this email already exists"
        )
        
    # 2. Map schema models onto a new domain row entity instance
    user = User(
        name=data.name.strip(), 
        email=email, 
        password_hash=hash_password(data.password), 
        role="customer"
    )
    
    # 3. Synchronize instance record updates into database
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # 4. Generate system access context tokens
    return {
        "access_token": create_token(user.id), 
        "token_type": "bearer", 
        "user": UserOut.model_validate(user)
    }


@router.post('/login')
def login(data: LoginIn, db: Session = Depends(get_db)):
    # 1. Search for matching database record elements
    user = db.scalar(
        select(User).where(func.lower(User.email) == data.email.lower())
    )
    
    # 2. Guard Clause: Evaluate credentials and hash strings safely
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
        
    # 3. Guard Clause: Check account visibility permissions flags
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="This account is disabled"
        )
        
    # 4. Compile authenticated access bundle payload
    return {
        "access_token": create_token(user.id), 
        "token_type": "bearer", 
        "user": UserOut.model_validate(user)
    }


@router.get('/me', response_model=UserOut)
def me(user: User = Depends(current_user)): 
    return user