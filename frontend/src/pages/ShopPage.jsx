import { useEffect, useState } from "react";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { api } from "../services/api";
import ProductCard from "../components/products/ProductCard";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts({ reset = false } = {}) {
    setLoading(true);
    setError("");
    const nextOffset = reset ? 0 : offset;
    const params = new URLSearchParams({
      offset: String(nextOffset),
      limit: String(reset ? 24 : 50),
    });
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);

    try {
      const result = await api(`/products?${params.toString()}`);
      setProducts((current) => reset ? result.items : [...current, ...result.items]);
      setTotal(result.total);
      setOffset(nextOffset + result.items.length);
    } catch (loadError) {
      setError(loadError.message);
      if (reset) {
        setProducts([]);
        setTotal(0);
        setOffset(0);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api("/products/categories")
      .then(setCategories)
      .catch(() => setCategories(["Solar Panels", "Inverters", "Batteries", "Controllers", "Solar Kits", "Accessories"]));
  }, []);

  useEffect(() => {
    loadProducts({ reset: true });
    // Reload the first page when the search or category filter changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">THE SAVVY COLLECTION</p>
          <h1>Energy that works <em>smarter.</em></h1>
          <p>Explore dependable solar equipment for your home, business or next installation.</p>
        </div>
        <div className="catalogue-count">{total}<span>products</span></div>
      </section>

      <div className="catalogue-tools">
        <label className="search-box">
          <Search size={19} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands, models…" aria-label="Search products" />
        </label>
        <label className="category-select">
          <SlidersHorizontal size={17} aria-hidden="true" />
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      {error && <div className="notice error" role="alert">{error}. Make sure the FastAPI backend is running.</div>}
      <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      {!loading && !products.length && !error && <div className="empty-state"><h3>No products found</h3><p>Try a different search or category.</p></div>}

      <div className="load-more">
        {offset < total && <button className="button secondary" disabled={loading} onClick={() => loadProducts()}>{loading ? "Loading…" : "Show 50 more"} <ArrowRight size={17} /></button>}
        {loading && products.length === 0 && <p>Loading products…</p>}
        <small>Showing {products.length} of {total} products</small>
      </div>
    </main>
  );
}
