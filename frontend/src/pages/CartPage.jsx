import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { productImageUrl } from '../utils/productImage';

// Currency formatter utility for Nigerian Naira (NGN)
const money = (n) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n);

export default function CartPage() {
  const { items, total, remove, update } = useCart();

  // Early Return: Empty Basket State
  if (!items.length) {
    return (
      <main className="page-shell empty-state cart-empty">
        <ShoppingBag size={42} />
        <h1>Your cart is taking a break.</h1>
        <p>Add the solar essentials you need, then return here to checkout.</p>
        <Link className="button primary" to="/shop">
          Explore products <ArrowRight />
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell">
      
      {/* Page Title & Heading Panel */}
      <div className="page-heading compact">
        <div>
          <p className="eyebrow">YOUR SELECTION</p>
          <h1>Shopping cart</h1>
          <p>Review your items before checkout.</p>
        </div>
      </div>

      {/* Main Cart Workspace Grid */}
      <div className="cart-layout">
        
        {/* Left Hand: Active Items Listing */}
        <div className="cart-items">
          {items.map((p) => (
            <article className="cart-item" key={p.id}>
              <img src={productImageUrl(p.image_url)} alt={p.name} />
              
              {/* Product Content Details and Descriptions */}
              <div className="cart-item-copy">
                <p className="eyebrow">
                  {p.brand} · {p.model}
                </p>
                
                <h3>
                  <Link to={`/product/${p.id}`}>{p.name}</Link>
                </h3>
                
                <strong>{money(p.price)}</strong>
                
                {/* Quantity Control Stepper Wrapper */}
                <div className="quantity-control">
                  <button onClick={() => update(p.id, p.quantity - 1)}>
                    <Minus size={14} />
                  </button>
                  <b>{p.quantity}</b>
                  <button onClick={() => update(p.id, p.quantity + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Right Hand: Subtotals & Removal Action Block */}
              <div className="cart-item-side">
                <b>{money(p.price * p.quantity)}</b>
                
                <button
                  className="icon-button"
                  onClick={() => remove(p.id)}
                  aria-label="Remove item"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Right Hand Sidebar: Aggregated Calculations & Navigation Paths */}
        <aside className="order-summary">
          <h2>Order summary</h2>
          
          <div>
            <span>Subtotal</span>
            <b>{money(total)}</b>
          </div>
          
          <div>
            <span>Delivery</span>
            <span>Confirmed after order</span>
          </div>
          
          <div className="summary-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          
          <p>Delivery fees and final availability may be confirmed by our team.</p>
          
          {/* Main Action Links */}
          <Link className="button primary wide" to="/checkout">
            Continue to checkout <ArrowRight size={17} />
          </Link>
          
          <Link className="text-link centered" to="/quote">
            Prefer a quote instead?
          </Link>
        </aside>

      </div>
    </main>
  );
}