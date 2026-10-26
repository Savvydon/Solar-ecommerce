import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models import Product, Order, OrderItem, User
from app.schemas.schemas import OrderIn
from app.dependencies import current_user, admin_user
router = APIRouter(prefix="/api/orders", tags=["Orders"])
def order_dict(o): return {"id":o.id,"reference":o.reference,"total":o.total,"status":o.status,"payment_status":o.payment_status,"created_at":o.created_at,"shipping_name":o.shipping_name,"shipping_phone":o.shipping_phone,"shipping_address":o.shipping_address,"items":[{"product_id":i.product_id,"product_name":i.product_name,"quantity":i.quantity,"unit_price":i.unit_price} for i in o.items]}
@router.post('')
def create_order(data: OrderIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    ids = [x.product_id for x in data.items]; products = {p.id:p for p in db.scalars(select(Product).where(Product.id.in_(ids), Product.is_active.is_(True))).all()}
    if len(products) != len(set(ids)): raise HTTPException(400, "One or more products are unavailable")
    for line in data.items:
        p=products[line.product_id]
        if p.stock < line.quantity: raise HTTPException(409, f"Insufficient stock for {p.name}")
    total = sum(products[x.product_id].price*x.quantity for x in data.items)
    order=Order(reference="SE-"+secrets.token_hex(6).upper(),user_id=user.id,total=total,shipping_name=data.shipping_name,shipping_phone=data.shipping_phone,shipping_address=data.shipping_address)
    db.add(order); db.flush()
    for line in data.items:
        p=products[line.product_id]; p.stock-=line.quantity
        db.add(OrderItem(order_id=order.id,product_id=p.id,product_name=p.name,quantity=line.quantity,unit_price=p.price))
    db.commit(); db.refresh(order); return order_dict(order)
@router.get('/mine')
def my_orders(db: Session=Depends(get_db), user: User=Depends(current_user)):
    return [order_dict(o) for o in db.scalars(select(Order).where(Order.user_id==user.id).order_by(Order.created_at.desc())).all()]
@router.get('')
def all_orders(db: Session=Depends(get_db), _: User=Depends(admin_user)):
    return [order_dict(o) for o in db.scalars(select(Order).order_by(Order.created_at.desc())).all()]
@router.patch('/{order_id}/status')
def update_status(order_id: int, status: str, db: Session=Depends(get_db), _: User=Depends(admin_user)):
    if status not in {'pending','processing','shipped','completed','cancelled'}: raise HTTPException(400,"Invalid order status")
    o=db.get(Order,order_id)
    if not o: raise HTTPException(404,"Order not found")
    o.status=status; db.commit(); return order_dict(o)
