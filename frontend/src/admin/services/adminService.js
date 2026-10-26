import { api } from "../../services/api";

/** Admin-only API operations kept separate from page presentation. */
export const adminService = {
  getSummary: () => api("/admin/summary"),
  getProducts: () => api("/products?limit=100"),
  getOrders: () => api("/orders"),
  getQuotes: () => api("/quotes"),
  updateOrderStatus: (id, status) =>
    api(`/orders/${id}/status?status=${encodeURIComponent(status)}`, { method: "PATCH" }),
  updateQuoteStatus: (id, status) =>
    api(`/quotes/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
