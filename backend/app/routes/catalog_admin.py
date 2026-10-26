from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import admin_user
from app.models import Category, Product, User
from app.core.config import settings

router = APIRouter(prefix="/api/admin", tags=["Admin catalogue management"])
UPLOAD_DIR = Path(settings.upload_dir).resolve()
ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024

@router.get("/categories")
def list_categories(db: Session = Depends(get_db), _: User = Depends(admin_user)):
    existing = list(db.scalars(select(Category).order_by(Category.name)).all())
    names = {item.name.casefold() for item in existing}
    # Backfill categories from existing products without requiring a manual migration.
    product_names = db.scalars(select(Product.category).distinct().order_by(Product.category)).all()
    for name in product_names:
        if name and name.casefold() not in names:
            category = Category(name=name.strip())
            db.add(category)
            existing.append(category)
            names.add(name.casefold())
    db.commit()
    return [{"id": c.id, "name": c.name, "product_count": db.scalar(select(func.count()).select_from(Product).where(Product.category == c.name, Product.is_active.is_(True))) or 0} for c in sorted(existing, key=lambda x: x.name.casefold())]

@router.post("/categories", status_code=201)
def create_category(payload: dict, db: Session = Depends(get_db), _: User = Depends(admin_user)):
    name = str(payload.get("name", "")).strip()
    if len(name) < 2 or len(name) > 80:
        raise HTTPException(422, "Category name must contain 2 to 80 characters")
    if db.scalar(select(Category).where(func.lower(Category.name) == name.lower())) or db.scalar(select(Product.id).where(func.lower(Product.category) == name.lower())):
        raise HTTPException(409, "That category already exists")
    item = Category(name=name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "name": item.name, "product_count": 0}

@router.patch("/categories/{category_id}")
def rename_category(category_id: int, payload: dict, db: Session = Depends(get_db), _: User = Depends(admin_user)):
    item = db.get(Category, category_id)
    if not item:
        raise HTTPException(404, "Category not found")
    name = str(payload.get("name", "")).strip()
    if len(name) < 2 or len(name) > 80:
        raise HTTPException(422, "Category name must contain 2 to 80 characters")
    duplicate = db.scalar(select(Category).where(func.lower(Category.name) == name.lower(), Category.id != category_id))
    if duplicate:
        raise HTTPException(409, "That category already exists")
    old_name = item.name
    for product in db.scalars(select(Product).where(Product.category == old_name)).all():
        product.category = name
    item.name = name
    db.commit()
    return {"id": item.id, "name": item.name, "product_count": db.scalar(select(func.count()).select_from(Product).where(Product.category == name, Product.is_active.is_(True))) or 0}

@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), _: User = Depends(admin_user)):
    item = db.get(Category, category_id)
    if not item:
        raise HTTPException(404, "Category not found")
    count = db.scalar(select(func.count()).select_from(Product).where(Product.category == item.name, Product.is_active.is_(True))) or 0
    if count:
        raise HTTPException(409, f"Cannot remove this category while {count} active product(s) use it. Reassign or archive them first.")
    db.delete(item)
    db.commit()
    return {"message": "Category removed"}

@router.post("/uploads")
async def upload_product_image(request: Request, file: UploadFile = File(...), _: User = Depends(admin_user)):
    extension = ALLOWED_TYPES.get(file.content_type or "")
    if not extension:
        raise HTTPException(415, "Upload a JPG, PNG, WEBP or GIF image")
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if not content or len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Image must be between 1 byte and 5 MB")
    # Check file signatures rather than trusting the browser's MIME type alone.
    signatures = {".jpg": (b"\xff\xd8\xff",), ".png": (b"\x89PNG\r\n\x1a\n",), ".webp": (b"RIFF",), ".gif": (b"GIF87a", b"GIF89a")}
    if not any(content.startswith(sig) for sig in signatures[extension]):
        raise HTTPException(415, "The file contents do not match the selected image type")
    if extension == ".webp" and content[8:12] != b"WEBP":
        raise HTTPException(415, "Invalid WEBP image")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{extension}"
    (UPLOAD_DIR / filename).write_bytes(content)
    return {"image_url": str(request.base_url).rstrip("/") + f"/uploads/{filename}"}
