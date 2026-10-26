import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order, User
from app.dependencies import current_user
from app.core.config import settings
router=APIRouter(prefix='/api/payments',tags=['Payments'])
@router.post('/paystack/initialize/{order_id}')
def initialize(order_id:int,db:Session=Depends(get_db),user:User=Depends(current_user)):
    if not settings.paystack_secret_key: raise HTTPException(503,'Online payment is not configured yet. Please request a quote or contact the store.')
    order=db.get(Order,order_id)
    if not order or (order.user_id!=user.id and user.role!='admin'): raise HTTPException(404,'Order not found')
    payload={'email':user.email,'amount':int(round(order.total*100)),'reference':order.reference,'callback_url':settings.frontend_url.rstrip('/')+'/payment/return'}
    try:
        r=httpx.post('https://api.paystack.co/transaction/initialize',json=payload,headers={'Authorization':f'Bearer {settings.paystack_secret_key}'},timeout=20)
        data=r.json()
    except Exception as e: raise HTTPException(502,'Unable to contact payment provider') from e
    if not r.is_success or not data.get('status'): raise HTTPException(502,data.get('message','Payment initialization failed'))
    order.payment_reference=order.reference; db.commit()
    return {'authorization_url':data['data']['authorization_url'],'reference':data['data']['reference']}
@router.get('/paystack/verify/{reference}')
def verify(reference:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    if not settings.paystack_secret_key: raise HTTPException(503,'Payment is not configured')
    try:
        r=httpx.get(f'https://api.paystack.co/transaction/verify/{reference}',headers={'Authorization':f'Bearer {settings.paystack_secret_key}'},timeout=20); data=r.json()
    except Exception as e: raise HTTPException(502,'Unable to verify payment') from e
    if not r.is_success or not data.get('status'): raise HTTPException(400,'Payment verification failed')
    payment=data['data']; order=db.query(Order).filter(Order.reference==reference).first()
    if not order or (order.user_id!=user.id and user.role!='admin'): raise HTTPException(404,'Order not found')
    if payment.get('status')=='success' and int(payment.get('amount',0))==int(round(order.total*100)):
        order.payment_status='paid'; order.status='processing'; db.commit()
    return {'payment_status':order.payment_status,'order_status':order.status}
