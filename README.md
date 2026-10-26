# Savvy Energy — Full-stack solar e-commerce

React/Vite frontend + FastAPI REST API + PostgreSQL database. The interface supports persistent light/dark mode and responsive mobile navigation.

## Implemented features
- Customer registration, login, JWT authentication and logout; admin-only API routes.
- Product catalogue backed by the API, search/category filters, 24 initial products and 50 additional products per click.
- Product details, brand/model, description, price, stock and quantity selection.
- Persistent local cart, checkout/order creation, customer order history and admin order status updates.
- Quote request form and admin quote management.
- Admin dashboard with summary counts and product create/edit/archive.
- Paystack initialize + server-side verification endpoints. Payment is disabled until a valid secret is configured; a checkout order can still be created and the user can use quote/contact support.
- Theme preference persists in localStorage and defaults to the operating system preference on first visit.
- Local SVG product illustrations are included. Replace these with approved manufacturer photography and verified catalogue data before launch.

## Project layout
```text
solar-ecommerce/
├── frontend/
│   ├── src/
│   │   ├── assets/products/
│   │   ├── components/{common,layout,products,cart,forms}/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── services/api.js
│   │   ├── hooks/
│   │   ├── context/{AuthContext,CartContext,ThemeContext}.jsx
│   │   ├── routes/
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── app/{core,models,schemas,routes,services,repositories,middleware,utils}/
│   ├── migrations/
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
└── docs/{requirements.md,database-design.md,api-specification.md}
```

## Local setup
### 1. Database and API
Python 3.11+ is recommended. PostgreSQL is recommended for deployment. A SQLite fallback is available for local exploration.

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
Edit `.env`: set `DATABASE_URL` to your PostgreSQL URL, change `JWT_SECRET` to a long random value, set `CORS_ORIGINS=http://localhost:5173`, and configure a strong `ADMIN_EMAIL` / `ADMIN_PASSWORD`. For local quick start only, leaving `DATABASE_URL` unset uses SQLite. Never commit `.env` or production secrets.

Start the API from the `backend` directory:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
API docs: http://127.0.0.1:8000/docs. On first startup, tables are created and six sample products are seeded. The admin account is bootstrapped only when both admin environment values are provided and no matching admin exists. To rotate credentials, change the account password through a future account-management workflow or update the database securely; changing env alone does not reset an existing admin password.

### 2. Frontend
Node.js 20+ recommended.
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend defaults to `http://localhost:8000/api`; override with `VITE_API_URL`. Open http://localhost:5173.

## Deployment notes
- Deploy `backend/` as a Python web service; build/install `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`, and `PAYSTACK_SECRET_KEY` in the hosting dashboard.
- Deploy `frontend/` as a Vite static site; build `npm run build`, publish `dist`, set `VITE_API_URL` to the deployed API base ending in `/api`.
- Use a managed PostgreSQL database, HTTPS, restricted CORS, strong secrets and backups. Apply schema changes through Alembic migrations rather than relying on `create_all` for production upgrades.
- Paystack secret must only be configured on the backend. Test payments with Paystack test keys before switching to live credentials. Do not manually mark orders paid; verification compares provider status and amount.

## Important pre-production work
This is a runnable baseline, not yet a fully audited production store. Before taking live orders, add automated tests and Alembic migrations, email verification/password reset, rate limiting and login abuse protection, idempotent payment webhooks, stronger stock reservation/concurrency handling, image upload/storage, shipping/tax rules, privacy/terms pages, logging/monitoring and security review. Replace sample products, prices, stock and illustrative SVGs with verified business data. Payment is intentionally unavailable when `PAYSTACK_SECRET_KEY` is blank.
