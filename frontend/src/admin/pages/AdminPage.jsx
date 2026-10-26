import { useCallback, useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { LayoutDashboard, Package, Layers3, ShoppingBag, MessageSquare, RefreshCw, Store, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import AdminStatCard from "../components/AdminStatCard";
import ProductManagement from "../views/ProductManagement";
import CategoryManagement from "../views/CategoryManagement";
import OrderManagement from "../views/OrderManagement";
import QuoteManagement from "../views/QuoteManagement";
import "../styles/admin.css";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Layers3 },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "quotes", label: "Quote requests", icon: MessageSquare },
];
export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setError(""); setLoading(true);
    try {
      const [summary, productData, orderData, quoteData, categoryData] = await Promise.all([
        api("/admin/summary"), api("/products?limit=100"), api("/orders"), api("/quotes"), api("/admin/categories"),
      ]);
      setStats(summary); setProducts(productData.items || []); setOrders(orderData || []); setQuotes(quoteData || []); setCategories(categoryData || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { if (user?.role === "admin") refresh(); }, [user, refresh]);
  if (authLoading) return <main className="admin-auth-loading">Checking administrator access…</main>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== "admin") return <Navigate to="/admin/login" replace />;
  const activeTab = tabs.find((item) => item.id === tab);
  return <div className="admin-shell">
    <aside className="admin-sidebar"><h2>SAVVY <span className="brand-light">ADMIN</span></h2><p>Store administration</p>{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon size={17} /> {label}</button>)}<div className="admin-sidebar-spacer"/><Link to="/shop"><Store size={17} /> View storefront</Link><button onClick={logout}><LogOut size={17} /> Sign out</button></aside>
    <div className="admin-main"><header className="admin-topbar"><div><strong>{activeTab?.label || "Dashboard"}</strong><small>Signed in as {user.name || user.email}</small></div><button className="button secondary" onClick={refresh} disabled={loading}><RefreshCw size={15} /> {loading ? "Refreshing…" : "Refresh data"}</button></header>
      <main className="admin-content"><div className="admin-heading"><div><p className="eyebrow">STORE MANAGEMENT</p><h1>{tab === "overview" ? "Dashboard overview" : activeTab?.label}</h1><p>Manage your Savvy Energy catalogue and customer activity.</p></div></div>
        {error && <div className="notice error">{error}</div>}
        {tab === "overview" && <><div className="stats-grid">{[[Package, "Active products", stats?.products], [ShoppingBag, "Orders", stats?.orders], [MessageSquare, "Quote requests", stats?.quotes], [LayoutDashboard, "Customers", stats?.customers]].map(([icon, label, value]) => <AdminStatCard icon={icon} label={label} value={value} key={label} />)}</div><div className="admin-overview-panels"><button className="overview-link" onClick={() => setTab("products")}><Package /><span><b>Manage products</b><small>Create, edit, archive products and upload images.</small></span></button><button className="overview-link" onClick={() => setTab("categories")}><Layers3 /><span><b>Manage categories</b><small>Add, rename or remove unused categories.</small></span></button><button className="overview-link" onClick={() => setTab("orders")}><ShoppingBag /><span><b>Manage orders</b><small>Review customer purchases and fulfilment status.</small></span></button><button className="overview-link" onClick={() => setTab("quotes")}><MessageSquare /><span><b>Manage quotes</b><small>Track and respond to quote requests.</small></span></button></div></>}
        {tab === "products" && <ProductManagement products={products} categories={categories} onRefresh={refresh} setError={setError} />}
        {tab === "categories" && <CategoryManagement categories={categories} onRefresh={refresh} setError={setError} />}
        {tab === "orders" && <OrderManagement orders={orders} onRefresh={refresh} setError={setError} />}
        {tab === "quotes" && <QuoteManagement quotes={quotes} onRefresh={refresh} setError={setError} />}
      </main></div>
  </div>;
}
