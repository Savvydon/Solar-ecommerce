# Savvy Energy — Frontend Starter

A responsive React + Vite storefront prototype for a solar equipment e-commerce business.

## Included in this first deliverable

- Responsive homepage with premium green design
- Category tiles and featured products
- Product catalogue with search, category, price and stock filters
- Sorting by price and rating
- Product details pages with specifications tabs and quantity selector
- Quick-view modal
- Shopping cart with quantity updates and browser localStorage persistence
- Checkout / request-a-quote interface
- About, solar solutions, contact, account and orders placeholder pages
- Responsive mobile navigation that closes when a menu link is selected

## Run locally

Requirements: Node.js 18+ recommended.

```bash
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`.

Create a production build:

```bash
npm run build
npm run preview
```

## Important prototype limitations

- Product catalogue, prices, ratings and stock values are sample data in `src/data/products.js`. Verify all product claims and prices before publishing.
- Images currently use remote Unsplash URLs. Replace them with licensed product photography or your own product images for production.
- Cart state is saved in the current browser only. It is not an order or inventory record.
- Checkout and quote forms demonstrate frontend validation only. They do not submit to a backend, create real orders, or process payment.
- Paystack is not integrated yet. The eventual integration must initialise transactions on the backend, verify payment server-side, and validate provider webhooks.
- Authentication, admin controls, real inventory, order tracking, emails, delivery calculation and reviews require the backend phases.
- Ratings are placeholders for layout demonstration, not real customer reviews.

## Main structure

```text
src/
  App.jsx
  main.jsx
  data/products.js
  styles.css
```

The first version intentionally keeps the app compact. Before the backend integration grows, split the app into reusable components, page modules, API services and cart/auth contexts.

## Next implementation step

1. Confirm the UI and product categories.
2. Finalise real brand/model/product data and product imagery.
3. Create the FastAPI project and PostgreSQL schema.
4. Replace sample product data with API calls.
5. Implement authentication, inventory, cart validation, orders and Paystack.


## Updated frontend prototype
- Local SVG product illustrations are stored in `src/assets/products/` and referenced by the demo catalogue.
- Shop starts with 24 products and the **Show more products** button reveals up to 50 additional products each click.
- Product cards open detailed product routes with descriptions and specifications.
- Login/logout menu state and a demo admin dashboard are included for UI testing only. Credentials are not securely authenticated until the FastAPI backend is connected.
- Shared product-card component is available in `src/components/ProductCard.jsx`; this is the beginning of the component-based refactor.
- The expanded catalogue beyond the initial sample products is generated demo data, not a real supplier inventory.
