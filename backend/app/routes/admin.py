from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.database import get_db
from app.models import Product, Order, User, QuoteRequest
from app.dependencies import admin_user
router=APIRouter(prefix='/api/admin',tags=['Administration'])
@router.get('/summary')
def summary(db:Session=Depends(get_db),_ = Depends(admin_user)):
    return {'products':db.scalar(select(func.count()).select_from(Product).where(Product.is_active.is_(True))) or 0,'orders':db.scalar(select(func.count()).select_from(Order)) or 0,'customers':db.scalar(select(func.count()).select_from(User).where(User.role=='customer')) or 0,'quotes':db.scalar(select(func.count()).select_from(QuoteRequest)) or 0,'revenue':db.scalar(select(func.coalesce(func.sum(Order.total),0)).where(Order.payment_status=='paid')) or 0}
