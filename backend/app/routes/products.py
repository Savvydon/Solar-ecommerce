from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from app.database import get_db
from app.models import Product
from app.schemas.schemas import ProductIn, ProductOut
from app.dependencies import admin_user
router = APIRouter(prefix="/api/products", tags=["Products"])
@router.get('')
def list_products(q: str | None = None, category: str | None = None, offset: int = Query(0, ge=0), limit: int = Query(24, ge=1, le=100), db: Session = Depends(get_db)):
    stmt = select(Product).where(Product.is_active.is_(True))
    if q: stmt = stmt.where(or_(Product.name.ilike(f"%{q}%"), Product.brand.ilike(f"%{q}%"), Product.model.ilike(f"%{q}%")))
    if category: stmt = stmt.where(Product.category == category)
    rows = db.scalars(stmt.order_by(Product.id).offset(offset).limit(limit)).all()
    count_stmt = select(Product.id).where(Product.is_active.is_(True))
    if q: count_stmt = count_stmt.where(or_(Product.name.ilike(f"%{q}%"), Product.brand.ilike(f"%{q}%"), Product.model.ilike(f"%{q}%")))
    if category: count_stmt = count_stmt.where(Product.category == category)
    from sqlalchemy import func
    total = db.scalar(select(func.count()).select_from(count_stmt.subquery())) or 0
    return {"items": [ProductOut.model_validate(x) for x in rows], "total": total, "offset": offset, "limit": limit, "has_more": offset + len(rows) < total}
@router.get('/{product_id}', response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.get(Product, product_id)
    if not p or not p.is_active: raise HTTPException(404, "Product not found")
    return p
@router.post('', response_model=ProductOut)
def create_product(data: ProductIn, db: Session = Depends(get_db), _: object = Depends(admin_user)):
    p = Product(**data.model_dump()); db.add(p); db.commit(); db.refresh(p); return p
@router.put('/{product_id}', response_model=ProductOut)
def update_product(product_id: int, data: ProductIn, db: Session = Depends(get_db), _: object = Depends(admin_user)):
    p = db.get(Product, product_id)
    if not p: raise HTTPException(404, "Product not found")
    for k,v in data.model_dump().items(): setattr(p,k,v)
    db.commit(); db.refresh(p); return p
@router.delete('/{product_id}')
def delete_product(product_id: int, db: Session = Depends(get_db), _: object = Depends(admin_user)):
    p = db.get(Product, product_id)
    if not p: raise HTTPException(404, "Product not found")
    p.is_active = False; db.commit(); return {"message":"Product archived"}
