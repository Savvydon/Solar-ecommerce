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
from app.routes import auth, products, orders, quotes, payments, admin, catalog_admin

# 1. Database Seed Configuration Options
STARTER_PRODUCTS = [
    {
        "name": "Monocrystalline Solar Panel 550W",
        "brand": "SunPower",
        "model": "SP-550M",
        "category": "Solar Panels",
        "description": "High-efficiency 550W monocrystalline panel for residential and commercial installations.",
        "price": 185000,
        "image_url": "/products/solar-panel.png",
        "stock": 30,
    },
    {
        "name": "Hybrid Solar Inverter 5kVA",
        "brand": "Growatt",
        "model": "SPH-5000",
        "category": "Inverters",
        "description": "Hybrid inverter with solar, battery and grid integration support.",
        "price": 780000,
        "image_url": "/products/inverter1.jpg",
        "stock": 12,
    },
    {
        "name": "Lithium Battery 5.12kWh",
        "brand": "Pylontech",
        "model": "US5000",
        "category": "Batteries",
        "description": "Expandable lithium energy storage for dependable backup power.",
        "price": 1450000,
        "image_url": "/products/battery.jpg",
        "stock": 8,
    },
    {
        "name": "MPPT Charge Controller 60A",
        "brand": "Victron",
        "model": "SmartSolar-60",
        "category": "Controllers",
        "description": "MPPT controller designed to improve solar harvesting.",
        "price": 210000,
        "image_url": "/products/MPPT Charge Controller 60A.jpg",
        "stock": 18,
    },
    {
        "name": "Home Solar Starter Kit 3kW",
        "brand": "Savvy Energy",
        "model": "HOME-3KW",
        "category": "Solar Kits",
        "description": "A starter bundle for a small home system. Final sizing should be professionally assessed.",
        "price": 2350000,
        "image_url": "/products/Home Solar Starter Kit.jpg",
        "stock": 5,
    },
    {
        "name": "Solar Installation Accessories Kit",
        "brand": "Savvy Energy",
        "model": "ACC-01",
        "category": "Accessories",
        "description": "Essential cables, connectors and mounting accessories for installations.",
        "price": 95000,
        "image_url": "/products/solar-accessories.jpg",
        "stock": 40,
    },
    {
        "name": "Monocrystalline Solar Panel 450W",
        "brand": "Savvy Solar",
        "model": "SS-P450",
        "category": "Solar Panels",
        "description": "450W solar module for appropriately designed residential PV arrays.",
        "price": 155000,
        "image_url": "/products/panel1.jfif",
        "stock": 24,
    },
    {
        "name": "High-Efficiency Solar Panel 600W",
        "brand": "Savvy Solar",
        "model": "SS-P600",
        "category": "Solar Panels",
        "description": "High-output solar module. Verify dimensions and electrical ratings with the supplier.",
        "price": 215000,
        "image_url": "/products/panel2.webp",
        "stock": 16,
    },
    {
        "name": "Compact Solar Panel 200W",
        "brand": "Savvy Solar",
        "model": "SS-P200",
        "category": "Solar Panels",
        "description": "Compact solar panel option for suitable small off-grid applications.",
        "price": 78000,
        "image_url": "/products/panel4.webp",
        "stock": 20,
    },
    {
        "name": "Hybrid Solar Inverter 3.5kW",
        "brand": "Growatt",
        "model": "SPH-3500",
        "category": "Inverters",
        "description": "Hybrid inverter for selected home backup systems; confirm voltage compatibility.",
        "price": 520000,
        "image_url": "/products/inverter2.jpg",
        "stock": 10,
    },
    {
        "name": "Hybrid Solar Inverter 6kW",
        "brand": "Growatt",
        "model": "SPH-6000",
        "category": "Inverters",
        "description": "Higher-capacity hybrid inverter for suitable residential or small-business installations.",
        "price": 925000,
        "image_url": "/products/inverter3.jpg",
        "stock": 7,
    },
    {
        "name": "Hybrid Solar Inverter 10kW",
        "brand": "Growatt",
        "model": "SPH-10000",
        "category": "Inverters",
        "description": "High-capacity inverter for professionally designed solar systems.",
        "price": 1480000,
        "image_url": "/products/inverter4.jpg",
        "stock": 4,
    },
    {
        "name": "Lithium Solar Battery 2.56kWh",
        "brand": "Pylontech",
        "model": "US2500",
        "category": "Batteries",
        "description": "Compact lithium storage option; confirm compatibility with your inverter.",
        "price": 790000,
        "image_url": "/products/sola battery2.png",
        "stock": 9,
    },
    {
        "name": "MPPT Solar Charge Controller 40A",
        "brand": "Victron",
        "model": "SmartSolar-40",
        "category": "Controllers",
        "description": "40A MPPT controller for compatible PV and battery configurations.",
        "price": 145000,
        "image_url": "/products/MPPT Charge Controller 60A.jpg",
        "stock": 13,
    },
    {
        "name": "Home Solar Starter Kit 1.5kW",
        "brand": "Savvy Energy",
        "model": "HOME-15KW",
        "category": "Solar Kits",
        "description": "Entry-level starter bundle concept; included components and sizing require confirmation.",
        "price": 1280000,
        "image_url": "/products/solar kit2.jpg",
        "stock": 6,
    },
    {
        "name": "Solar Backup Kit 2.5kW",
        "brand": "Savvy Energy",
        "model": "BACKUP-25KW",
        "category": "Solar Kits",
        "description": "Backup bundle concept for selected loads. Confirm battery capacity and runtime before purchase.",
        "price": 1890000,
        "image_url": "/products/Home Solar Starter Kit.jpg",
        "stock": 5,
    },
    {
        "name": "Solar Cable and Connector Set",
        "brand": "Savvy Energy",
        "model": "ACC-CABLE-01",
        "category": "Accessories",
        "description": "Solar cable and connector set. Confirm conductor size, length and connector type.",
        "price": 42000,
        "image_url": "/products/solar-accessories.jpg",
        "stock": 32,
    },
    {
        "name": "PV Mounting and Wiring Accessories",
        "brand": "Savvy Energy",
        "model": "ACC-MOUNT-02",
        "category": "Accessories",
        "description": "Accessories for solar installations; check mounting and wiring requirements for your site.",
        "price": 68000,
        "image_url": "/products/solar accessory3.webp",
        "stock": 21,
    },
    {
        "name": "Solar Accessory Connector Pack",
        "brand": "Savvy Energy",
        "model": "ACC-CON-03",
        "category": "Accessories",
        "description": "Solar connector accessory pack for compatible system wiring.",
        "price": 18500,
        "image_url": "/products/solar-accessory2.webp",
        "stock": 45,
    },
    {
        "name": "Solar Panel and Battery Starter Bundle",
        "brand": "Savvy Energy",
        "model": "BUNDLE-01",
        "category": "Solar Kits",
        "description": "Bundle concept for customers planning a small solar installation. Final configuration needs assessment.",
        "price": 980000,
        "image_url": "/products/solar kit2.jpg",
        "stock": 5,
    },
]


# 2. Application Lifespan Events (Startup & Shutdown Seeding Operations)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure raw database schema entities are built out sequentially
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Seed default Admin Master records if config matching criteria exist
        if settings.admin_email and settings.admin_password:
            admin_user = db.query(User).filter(User.email == settings.admin_email.lower()).first()
            if not admin_user:
                db.add(User(
                    name='Savvy Energy Administrator',
                    email=settings.admin_email.lower(),
                    password_hash=hash_password(settings.admin_password),
                    role='admin'
                ))
                
        # Query active inventory models to establish non-destructive syncing baseline
        existing_models = {row[0] for row in db.query(Product.model).all()}
        
        # Hydrate missing entries safely without altering existing product overrides
        for product_data in STARTER_PRODUCTS:
            # STARTER_PRODUCTS contains dictionaries, so iterate over each
            # dictionary rather than unpacking its keys as product values.
            model = product_data["model"]
            if model not in existing_models:
                db.add(Product(**product_data))
                existing_models.add(model)
                
        db.commit()
    finally:
        db.close()
    yield


# ==========================================================================
# 3. Application Core Initialization & Middleware Options
# ==========================================================================
app = FastAPI(
    title='Savvy Energy API',
    version='1.0.0',
    description='Solar equipment shop, orders, quote requests and payments',
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


# ==========================================================================
# 4. Route Routing Implementations & Static Asset Mounting
# ==========================================================================
ROUTERS = [
    auth.router, 
    products.router, 
    orders.router, 
    quotes.router, 
    payments.router, 
    admin.router, 
    catalog_admin.router
]

for router in ROUTERS:
    app.include_router(router)

# Resolve file server pathways safely
UPLOAD_DIR = Path(settings.upload_dir).resolve()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get('/api/health')
def health(): 
    return {
        'status': 'ok',
        'service': 'Savvy Energy API'
    }