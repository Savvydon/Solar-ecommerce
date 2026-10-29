import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { api } from "../services/api";
import ProductCard from "../components/products/ProductCard";

const PAGE_SIZE = 30;

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api("/products/categories")
      .then((items) => {
        if (cancelled) return;
        const match = (items || []).find((item) => slugify(item) === categorySlug);
        setCategories(items || []);
        setCategory(match || "");
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || "Unable to load categories.");
      });
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    api(`/products/brands?category=${encodeURIComponent(category)}`)
      .then((items) => {
        if (!cancelled) setBrands(items || []);
      })
      .catch(() => {
        if (!cancelled) setBrands([]);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        category,
        offset: String((page - 1) * PAGE_SIZE),
        limit: String(PAGE_SIZE),
        sort_by: sort === "price-asc" || sort === "price-desc" ? "price" : "name",
        sort_order: sort === "price-desc" ? "desc" : sort === "price-asc" ? "asc" : "asc",
      });
      if (search.trim()) params.set("q", search.trim());
      if (brand) params.set("brand", brand);
      if (minPrice !== "") params.set("min_price", minPrice);
      if (maxPrice !== "") params.set("max_price", maxPrice);
      if (availability === "in-stock") params.set("in_stock", "true");
      if (availability === "out-of-stock") params.set("in_stock", "false");

      try {
        const result = await api(`/products?${params.toString()}`);
        if (cancelled) return;
        setProducts(result.items || []);
        setTotal(result.total || 0);
      } catch (loadError) {
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
          setError(loadError.message || "Unable to load products.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [category, page, search, brand, minPrice, maxPrice, availability, sort]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startItem = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endItem = Math.min(page * PAGE_SIZE, total);
  const pagination = useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, pageCount - 4));
    const end = Math.min(pageCount, Math.max(5, page + 2));
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  }, [page, pageCount]);

  function submitSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setAvailability("all");
    setSort("relevance");
    setPage(1);
  }

  if (!category && !error) {
    return <main className="page-shell"><div className="catalogue-loading">Loading category…</div></main>;
  }

  if (!category && error) {
    return (
      <main className="page-shell">
        <div className="notice error" role="alert">{error}</div>
        <Link className="text-link" to="/shop"><ArrowLeft size={16} /> Back to shop</Link>
      </main>
    );
  }

  return (
    <main className="page-shell category-page">
      <Link className="back-link" to="/shop"><ArrowLeft size={16} /> All categories</Link>
      <section className="page-heading category-page-heading">
        <div>
          <p className="eyebrow">SHOP BY CATEGORY</p>
          <h1>{category}</h1>
          <p>Search, filter and compare products in the {category.toLowerCase()} collection.</p>
        </div>
        <div className="catalogue-count">{total}<span>products</span></div>
      </section>

      <section className="category-filter-panel" aria-label="Search and filter products">
        <form className="category-search-form" onSubmit={submitSearch}>
          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by product, brand or model…"
              aria-label="Search this category"
            />
          </label>
          <button className="button primary" type="submit">Search</button>
        </form>

        <div className="category-filter-heading">
          <span><SlidersHorizontal size={16} /> Filter products</span>
          <button type="button" className="filter-reset" onClick={resetFilters}>Clear filters</button>
        </div>

        <div className="category-filter-grid">
          <label>
            <span>Brand</span>
            <select value={brand} onChange={(event) => { setBrand(event.target.value); setPage(1); }}>
              <option value="">All brands</option>
              {brands.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Minimum price (₦)</span>
            <input type="number" min="0" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPage(1); }} placeholder="Any" />
          </label>
          <label>
            <span>Maximum price (₦)</span>
            <input type="number" min="0" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1); }} placeholder="Any" />
          </label>
          <label>
            <span>Availability</span>
            <select value={availability} onChange={(event) => { setAvailability(event.target.value); setPage(1); }}>
              <option value="all">All products</option>
              <option value="in-stock">In stock</option>
              <option value="out-of-stock">Out of stock</option>
            </select>
          </label>
          <label>
            <span>Sort by</span>
            <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
              <option value="relevance">Name (A–Z)</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </section>

      {error && <div className="notice error" role="alert">{error}</div>}

      <div className="category-results-heading">
        <p>{loading ? "Updating products…" : `Showing ${startItem}–${endItem} of ${total} products`}</p>
        <span>{PAGE_SIZE} products per page</span>
      </div>

      {products.length > 0 ? (
        <div className="product-grid category-results-grid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : !loading && !error ? (
        <div className="empty-state">
          <h3>No products match these filters</h3>
          <p>Try changing your search or clearing one or more filters.</p>
          <button className="button secondary" onClick={resetFilters}>Clear filters</button>
        </div>
      ) : null}

      {pageCount > 1 && (
        <nav className="pagination" aria-label="Product pages">
          <button className="pagination-arrow" disabled={page === 1 || loading} onClick={() => setPage((current) => current - 1)} aria-label="Previous page">
            <ChevronLeft size={18} /> <span>Previous</span>
          </button>
          {pagination.map((pageNumber) => (
            <button
              key={pageNumber}
              className={pageNumber === page ? "pagination-number active" : "pagination-number"}
              aria-current={pageNumber === page ? "page" : undefined}
              disabled={loading}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button className="pagination-arrow" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)} aria-label="Next page">
            <span>Next</span> <ChevronRight size={18} />
          </button>
        </nav>
      )}
    </main>
  );
}
