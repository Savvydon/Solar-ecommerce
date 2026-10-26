# Database design
- `users`: name, unique email, password hash, role (`customer`/`admin`), active status, created timestamp.
- `products`: name, brand, model, category, description, price, currency, image URL/path, stock, active status, created timestamp.
- `orders`: unique reference, user foreign key, total, order status, payment status/reference, delivery details, created timestamp.
- `order_items`: order/product foreign keys and immutable product name, quantity and unit price snapshot.
- `quote_requests`: contact details, project message, workflow status and created timestamp.

SQLAlchemy creates these tables at application startup for the starter baseline. Use Alembic revisions for subsequent production schema changes.
