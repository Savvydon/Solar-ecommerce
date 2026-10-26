from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models import QuoteRequest, User
from app.schemas.schemas import QuoteIn, QuoteStatusIn
from app.dependencies import admin_user
router=APIRouter(prefix='/api/quotes',tags=['Quote requests'])
@router.post('')
def create_quote(data: QuoteIn, db: Session=Depends(get_db)):
    q=QuoteRequest(**data.model_dump()); db.add(q); db.commit(); db.refresh(q); return {"id":q.id,"status":q.status,"message":"Your quote request has been received."}
@router.get('')
def list_quotes(db: Session=Depends(get_db), _: User=Depends(admin_user)):
    return [{"id":q.id,"name":q.name,"email":q.email,"phone":q.phone,"message":q.message,"status":q.status,"created_at":q.created_at} for q in db.scalars(select(QuoteRequest).order_by(QuoteRequest.created_at.desc())).all()]
@router.patch('/{quote_id}')
def update_quote(quote_id:int,data:QuoteStatusIn,db:Session=Depends(get_db),_:User=Depends(admin_user)):
    q=db.get(QuoteRequest,quote_id)
    if not q: raise HTTPException(404,'Quote request not found')
    q.status=data.status; db.commit(); return {"id":q.id,"status":q.status}
