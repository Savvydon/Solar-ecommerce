# API overview
- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products?q=&category=&offset=0&limit=24`, `GET /api/products/{id}`
- Admin: `POST /api/products`, `PUT /api/products/{id}`, `DELETE /api/products/{id}`
- Authenticated: `POST /api/orders`, `GET /api/orders/mine`
- Admin: `GET /api/orders`, `PATCH /api/orders/{id}/status?status=processing`
- Public: `POST /api/quotes`; admin: `GET /api/quotes`, `PATCH /api/quotes/{id}`
- Admin: `GET /api/admin/summary`
- Authenticated: `POST /api/payments/paystack/initialize/{order_id}`, `GET /api/payments/paystack/verify/{reference}`

Authentication uses a Bearer JWT. All admin write operations are role-checked on the backend. See `/docs` from a running API for generated OpenAPI documentation.
