import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Currency formatter utility for Nigerian Naira (NGN)
const money = (n) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n);

export default function AccountPage() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Independent state hooks for transparency
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  // Fetch logged-in user's personal order history on layout mount
  useEffect(() => {
    api('/orders/mine')
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, []);

  // Isolate user's first name for a personalized greeting layout
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <main className="page-shell">
      
      {/* Title / Heading Blocks */}
      <div className="page-heading compact">
        <div>
          <p className="eyebrow">YOUR SAVVY ACCOUNT</p>
          <h1>Hello, {firstName}.</h1>
          <p>Track your orders and keep your purchase details close.</p>
        </div>
      </div>

      {/* Conditional Status Messages (Success Notification & Global Errors) */}
      {location.state?.orderCreated && (
        <div className="notice success">
          Order {location.state.orderCreated} was created. Online payment may be unavailable
          until the store configures Paystack.
        </div>
      )}

      {error && <div className="notice error">{error}</div>}

      {/* Main Account Details Table Container */}
      <section className="account-section">
        <h2>Your orders</h2>
        
        {orders.length === 0 ? (
          /* Empty State View */
          <div className="empty-state">
            <p>You haven't placed any orders yet.</p>
            <Link className="button primary" to="/shop">
              Browse products
            </Link>
          </div>
        ) : (
          /* Populated Active Orders Table */
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order reference</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Order status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.reference}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>{money(o.total)}</td>
                    <td>{o.status}</td>
                    <td>{o.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </main>
  );
}