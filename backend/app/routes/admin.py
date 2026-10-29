from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.database import get_db
from app.models import Product, Order, User, QuoteRequest
from app.dependencies import admin_user

router = APIRouter(prefix='/api/admin', tags=['Administration'])

@router.get('/summary')
def summary(db: Session = Depends(get_db), _: User = Depends(admin_user)):
    # 1. Total active inventory count
    active_products = db.scalar(
        select(func.count())
        .select_from(Product)
        .where(Product.is_active.is_(True))
    ) or 0

    # 2. Complete raw order metrics 
    total_orders = db.scalar(
        select(func.count())
        .select_from(Order)
    ) or 0

    # 3. Authenticated consumer database calculation
    customer_count = db.scalar(
        select(func.count())
        .select_from(User)
        .where(User.role == 'customer')
    ) or 0

    # 4. Total custom quote requests intake pool
    quote_requests = db.scalar(
        select(func.count())
        .select_from(QuoteRequest)
    ) or 0

    # 5. Financial performance summary calculation (Gross processing revenue)
    gross_revenue = db.scalar(
        select(func.coalesce(func.sum(Order.total), 0))
        .where(Order.payment_status == 'paid')
    ) or 0

    # Unified metric payload execution pipeline
    return {
        'products': active_products,
        'orders': total_orders,
        'customers': customer_count,
        'quotes': quote_requests,
        'revenue': gross_revenue
    }