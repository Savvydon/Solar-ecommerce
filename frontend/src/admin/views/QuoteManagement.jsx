import { api } from "../../services/api";

export default function QuoteManagement({ quotes, onRefresh, setError }) {
  
  // Handle quote status updates
  async function update(id, status) {
    try {
      await api(`/quotes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
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
          <h2>Quote requests</h2>
          <p className="muted-copy">Track enquiries from customers and follow up.</p>
        </div>
      </div>

      {/* Main Quote Requests Table View */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Request</th>
              <th>Status</th>
            </tr>
          </thead>
          
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td>{quote.name}</td>
                
                <td>
                  {quote.email}
                  <small>{quote.phone}</small>
                </td>
                
                <td className="quote-message">{quote.message}</td>
                
                <td>
                  <select
                    aria-label={`Status for quote from ${quote.name}`}
                    value={quote.status}
                    onChange={(e) => update(quote.id, e.target.value)}
                  >
                    {["new", "contacted", "quoted", "closed"].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}

            {/* Empty State Layout */}
            {!quotes.length && (
              <tr>
                <td colSpan="4">No quote requests yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}