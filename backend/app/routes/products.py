from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import admin_user
from app.models import Product
from app.schemas.schemas import ProductIn, ProductOut

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("/categories")
def list_product_categories(db: Session = Depends(get_db)):
    values = db.scalars(
        select(Product.category)
        .where(Product.is_active.is_(True))
        .distinct()
        .order_by(Product.category)
    ).all()
    return [value for value in values if value]


@router.get("/brands")
def list_product_brands(
    category: str | None = None,
    db: Session = Depends(get_db),
):
    stmt = (
        select(Product.brand)
        .where(Product.is_active.is_(True), Product.brand.is_not(None))
        .distinct()
        .order_by(Product.brand)
    )
    if category:
        stmt = stmt.where(Product.category == category)
    values = db.scalars(stmt).all()
    return [value for value in values if value]


@router.get("")
def list_products(
    q: str | None = None,
    category: str | None = None,
    brand: str | None = None,
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    in_stock: bool | None = None,
    sort_by: str = Query("name", pattern="^(name|price)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    offset: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    filters = [Product.is_active.is_(True)]

    if q and q.strip():
        search = f"%{q.strip()}%"
        filters.append(
            or_(
                Product.name.ilike(search),
                Product.brand.ilike(search),
                Product.model.ilike(search),
            )
        )
    if category:
        filters.append(Product.category == category)
    if brand:
        filters.append(Product.brand == brand)
    if min_price is not None:
        filters.append(Product.price >= min_price)
    if max_price is not None:
        filters.append(Product.price <= max_price)
    if in_stock is True:
        filters.append(Product.stock > 0)
    elif in_stock is False:
        filters.append(Product.stock <= 0)

    sort_column = Product.price if sort_by == "price" else Product.name
    order_expression = sort_column.desc() if sort_order == "desc" else sort_column.asc()

    rows = db.scalars(
        select(Product)
        .where(*filters)
        .order_by(order_expression, Product.id.asc())
        .offset(offset)
        .limit(limit)
    ).all()

    total = db.scalar(
        select(func.count()).select_from(
            select(Product.id).where(*filters).subquery()
        )
    ) or 0

    return {
        "items": [ProductOut.model_validate(product) for product in rows],
        "total": total,
        "offset": offset,
        "limit": limit,
        "has_more": offset + len(rows) < total,
    }


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductOut)
def create_product(
    data: ProductIn,
    db: Session = Depends(get_db),
    _: object = Depends(admin_user),
):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    data: ProductIn,
    db: Session = Depends(get_db),
    _: object = Depends(admin_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in data.model_dump().items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(admin_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product archived"}
