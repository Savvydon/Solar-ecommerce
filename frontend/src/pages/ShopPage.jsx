import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PackageSearch } from "lucide-react";
import { api } from "../services/api";
import ProductCard from "../components/products/ProductCard";

const FALLBACK_CATEGORIES = [
  "Solar Panels",
  "Inverters",
  "Batteries",
  "Controllers",
  "Solar Kits",
  "Accessories",
];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ShopPage() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogue() {
      setLoading(true);
      setError("");
      try {
        let categoryNames;
        try {
          categoryNames = await api("/products/categories");
        } catch {
          categoryNames = FALLBACK_CATEGORIES;
        }

        categoryNames = [...new Set((categoryNames || []).filter(Boolean))];
        if (!cancelled) setCategories(categoryNames);

        const results = await Promise.all(
          categoryNames.map(async (category) => {
            try {
              const params = new URLSearchParams({
                category,
                offset: "0",
                limit: "4",
              });
              const response = await api(`/products?${params.toString()}`);
              return [category, response];
            } catch {
              return [category, { items: [], total: 0 }];
            }
          })
        );

        if (!cancelled) {
          setProductsByCategory(
            Object.fromEntries(results.map(([category, result]) => [category, result]))
          );
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load product categories.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCatalogue();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="page-shell shop-overview">
      <section className="page-heading">
        <div>
          <p className="eyebrow">THE SAVVY COLLECTION</p>
          <h1>Shop by <em>category.</em></h1>
          <p>Explore solar panels, inverters, batteries and more. Choose a category to browse its full catalogue.</p>
        </div>
        <div className="catalogue-count">
          {categories.length}<span>categories</span>
        </div>
      </section>

      {error && <div className="notice error" role="alert">{error}</div>}

      {loading ? (
        <div className="catalogue-loading" role="status">Loading product categories…</div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <PackageSearch size={34} />
          <h3>No product categories available</h3>
          <p>Products will appear here once they have been added to the catalogue.</p>
        </div>
      ) : (
        <div className="category-sections">
          {categories.map((category) => {
            const result = productsByCategory[category] || { items: [], total: 0 };
            const products = result.items || [];
            const categoryUrl = `/shop/category/${slugify(category)}`;

            if (!products.length && result.total === 0) return null;

            return (
              <section className="shop-category-section" key={category}>
                <div className="shop-category-heading">
                  <div>
                    <p className="eyebrow">EXPLORE CATEGORY</p>
                    <h2>{category}</h2>
                    <p>{result.total} {result.total === 1 ? "product" : "products"} available</p>
                  </div>
                  <Link className="text-link category-more-link" to={categoryUrl}>
                    Show more <ArrowRight size={17} />
                  </Link>
                </div>

                {products.length ? (
                  <div className="product-grid category-product-grid">
                    {products.slice(0, 4).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <p className="category-empty">No products are currently available in this category.</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
