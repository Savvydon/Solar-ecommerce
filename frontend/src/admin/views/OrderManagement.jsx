import { api } from "../../services/api";

// Currency formatter for Nigerian Naira (NGN)
const money = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function OrderManagement({ orders, onRefresh, setError }) {
  
  // Handle order status updates
  async function update(id, status) {
    try {
      await api(`/orders/${id}/status?status=${encodeURIComponent(status)}`, {
        method: "PATCH",
      });
      await onRefresh();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <section>
      {/* Header Panel */}
      <div className="admin-table-heading">
        <div>
          <h2>Orders</h2>
          <p className="muted-copy">Review purchases and update fulfilment status.</p>
        </div>
      </div>

      {/* Main Orders Table View */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Order status</th>
            </tr>
          </thead>
          
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.reference}</td>
                
                <td>
                  {order.shipping_name}
                  <small>{order.shipping_phone}</small>
                  <small>{order.shipping_address}</small>
                </td>
                
                <td>{money(order.total)}</td>
                <td>{order.payment_status}</td>
                
                <td>
                  <select
                    aria-label={`Status for ${order.reference}`}
                    value={order.status}
                    onChange={(e) => update(order.id, e.target.value)}
                  >
                    {["pending", "processing", "shipped", "completed", "cancelled"].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}

            {/* Empty State Layout */}
            {!orders.length && (
              <tr>
                <td colSpan="5">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}