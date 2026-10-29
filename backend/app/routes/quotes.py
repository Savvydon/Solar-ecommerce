from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models import QuoteRequest, User
from app.schemas.schemas import QuoteIn, QuoteStatusIn
from app.dependencies import admin_user

router = APIRouter(prefix='/api/quotes', tags=['Quote requests'])


@router.post('')
def create_quote(data: QuoteIn, db: Session = Depends(get_db)):
    # 1. Instantiate a new domain entry row from the client schema data
    quote = QuoteRequest(**data.model_dump())
    
    # 2. Persist the row to the database session tracker
    db.add(quote)
    db.commit()
    db.refresh(quote)
    
    return {
        "id": quote.id,
        "status": quote.status,
        "message": "Your quote request has been received."
    }


@router.get('')
def list_quotes(db: Session = Depends(get_db), _: User = Depends(admin_user)):
    # Fetch all database logs arranged by creation timestamps sequentially
    quote_records = db.scalars(
        select(QuoteRequest).order_by(QuoteRequest.created_at.desc())
    ).all()
    
    # Serialize domain objects cleanly into standard schema dictionary shapes
    return [
        {
            "id": q.id,
            "name": q.name,
            "email": q.email,
            "phone": q.phone,
            "message": q.message,
            "status": q.status,
            "created_at": q.created_at
        }
        for q in quote_records
    ]


@router.patch('/{quote_id}')
def update_quote(
    quote_id: int, 
    data: QuoteStatusIn, 
    db: Session = Depends(get_db), 
    _: User = Depends(admin_user)
):
    # 1. Fetch matching instance row directly by Primary Key
    quote = db.get(QuoteRequest, quote_id)
    if not quote: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail='Quote request not found'
        )
    
    # 2. Mutate active record properties and save transaction changes
    quote.status = data.status
    db.commit()
    
    return {
        "id": quote.id,
        "status": quote.status
    }