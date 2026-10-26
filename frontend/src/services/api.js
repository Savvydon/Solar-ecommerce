const configuredUrl = import.meta.env.VITE_API_URL || "https://solar-ecommerce-ciim.onrender.com/api";
const trimmedUrl = configuredUrl.replace(/\/+$/, "");
export const API_URL = /\/api$/i.test(trimmedUrl) ? trimmedUrl : `${trimmedUrl}/api`;
export const API_ORIGIN = API_URL.replace(/\/api$/i, "");

export function token() {
  return localStorage.getItem("se_token");
}

function normalizePath(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.startsWith("/api/") ? normalized.slice(4) : normalized;
}

export async function api(path, options = {}) {
  const headers = {
    ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${API_URL}${normalizePath(path)}`, { ...options, headers });
  const data = await response.json().catch(() => ({ detail: "Unexpected server response" }));
  if (!response.ok) {
    throw new Error(data.detail || data.message || `Request failed (${response.status})`);
  }
  return data;
}

export async function uploadImage(file) {
  const body = new FormData();
  body.append("file", file);
  return api("/admin/uploads", { method: "POST", body });
}
