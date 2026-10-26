from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings
from app.database import Base, engine, SessionLocal
from app import models
from app.models import User, Product
from app.services.security import hash_password
from app.routes import auth, products, orders, quotes, payments, admin
from app.routes import catalog_admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db=SessionLocal()
    try:
        if settings.admin_email and settings.admin_password:
            admin_user=db.query(User).filter(User.email==settings.admin_email.lower()).first()
            if not admin_user:
                db.add(User(name='Savvy Energy Administrator',email=settings.admin_email.lower(),password_hash=hash_password(settings.admin_password),role='admin'))
        if db.query(Product).count()==0:
            rows=[
             ('Monocrystalline Solar Panel 550W','SunPower','SP-550M','Solar Panels','High-efficiency 550W mono solar panel for residential and commercial installations.',185000,'/products/solar-panel.svg',30),
             ('Hybrid Solar Inverter 5kVA','Growatt','SPH-5000','Inverters','Hybrid inverter with solar, battery and grid integration support.',780000,'/products/inverter.svg',12),
             ('Lithium Battery 5.12kWh','Pylontech','US5000','Batteries','Expandable lithium energy storage for dependable backup power.',1450000,'/products/battery.svg',8),
             ('MPPT Charge Controller 60A','Victron','SmartSolar-60','Controllers','MPPT controller designed to improve solar harvesting.',210000,'/products/charge-controller.svg',18),
             ('Home Solar Starter Kit','Savvy Energy','HOME-3KW','Solar Kits','A starter bundle for a small home system. Final sizing should be professionally assessed.',2350000,'/products/solar-kit.svg',5),
             ('Solar Installation Accessories Kit','Savvy Energy','ACC-01','Accessories','Essential cables, connectors and mounting accessories for installations.',95000,'/products/accessories.svg',40)]
            for name,brand,model,category,desc,price,img,stock in rows: db.add(Product(name=name,brand=brand,model=model,category=category,description=desc,price=price,image_url=img,stock=stock))
        db.commit()
    finally: db.close()
    yield
app=FastAPI(title='Savvy Energy API',version='1.0.0',description='Solar equipment shop, orders, quote requests and payments',lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=settings.allowed_origins,allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
for r in [auth.router, products.router, orders.router, quotes.router, payments.router, admin.router, catalog_admin.router]:
    app.include_router(r)

UPLOAD_DIR = Path(settings.upload_dir).resolve()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
@app.get('/api/health')
def health(): return {'status':'ok','service':'Savvy Energy API'}
