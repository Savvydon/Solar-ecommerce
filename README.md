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

## Frontend structure notes

- `frontend/src/admin/` owns administrator pages, reusable admin widgets, admin API operations, and admin-only styles. Keep new admin features inside this folder rather than mixing them with customer pages.
- `frontend/src/routes/AppRoutes.jsx` declares the application routes separately from the provider setup in `App.jsx`.
- `frontend/src/assets/products/` contains the current local SVG product illustrations. The demo catalogue imports these assets so Vite bundles them correctly for production; replace them with verified product photography as it becomes available.
- `frontend/src/components/common`, `components/forms`, and `components/cart` contain reusable UI building blocks. `hooks/`, `features/catalogue/`, and `styles/` contain shared logic, catalogue constants, and design tokens respectively.

## Readability conventions

Use one import per line, descriptive names, consistent indentation, small components, and keep data/API operations separate from page rendering. Avoid putting a complete page or multiple unrelated components on one line. The earlier prototype compressed JSX and multiple state handlers into single lines; this is harder to scan, review, debug, and safely extend. New modules should follow the structure and formatting of `routes/AppRoutes.jsx` and the shared component files.


## Admin catalogue updates and image uploads

- The administration interface is available at `/admin` and uses a separate layout from the customer storefront.
- Product create/edit forms support device image uploads. The backend accepts JPG, PNG, WEBP and GIF files up to 5 MB, validates the content signature, and serves them from `/uploads`.
- Set `UPLOAD_DIR` to a persistent disk mount path on Render before using uploads in production. Without a persistent disk, uploaded files can be lost when the service is redeployed or its instance is replaced. Existing database records keep their existing `image_url`; edit a product and upload a replacement image to update its record.
- `FRONTEND_URL` is a comma-separated environment variable containing the exact allowed browser origins, for example `http://localhost:5176,https://your-frontend.vercel.app`. Do not include `/api` or a trailing slash.
- `VITE_API_URL` should point to the FastAPI API root, e.g. `http://localhost:8000/api` for local development or `https://your-backend.onrender.com/api` for production. Vite environment variables are applied at build time, so rebuild/redeploy the frontend after changing them.

## Validation status for this revision

Python source compilation was checked. Full frontend production build and live backend integration tests still need to be run in an environment where npm packages and all backend requirements can be installed. The current work environment could not complete npm dependency installation due to registry/cache availability, and backend API tests could not start because the `python-jose` dependency was not installed in the test environment.

## Starter catalogue note

The backend startup routine adds missing starter product records until the sample catalogue contains 20 distinct model/SKU entries. It does not overwrite or delete existing product records. The extra starter product names, descriptions, stock counts and NGN prices are illustrative sample values; review them in the admin dashboard before accepting real customer orders. Existing records with matching model codes are left untouched.

The storefront initially requests 20 products and offers a “Show 20 more” control when the API reports additional products. This is load-more pagination rather than numbered page links.


## Category catalogue updates

- The storefront Shop page groups active products by category and displays up to four products per category.
- Each category's **Show more** link opens `/shop/category/<category-slug>`.
- Category pages support search, brand, price-range, stock-availability and sorting filters, with numbered pagination of 30 products per page.
- The FastAPI products endpoint accepts `brand`, `min_price`, `max_price`, `in_stock`, `sort_by`, and `sort_order` filters. A `/api/products/brands` endpoint supplies category-specific brand options.
