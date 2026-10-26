import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Minus, PackageCheck, Plus, ShieldCheck, ShoppingCart } from "lucide-react";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import { productImageUrl } from "../utils/productImage";

const money = (amount) => new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
}).format(amount);

export default function ProductPage() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    setProduct(null);
    setError("");
    api(`/products/${id}`).then(setProduct).catch((loadError) => setError(loadError.message));
  }, [id]);

  if (!product) {
    return <main className="page-shell">{error ? <div className="notice error">{error}</div> : "Loading product…"}</main>;
  }

  return (
    <main className="page-shell">
      <Link className="back-link" to="/shop"><ArrowLeft size={16} /> Back to products</Link>
      <div className="product-detail">
        <div className="detail-image"><img src={productImageUrl(product.image_url)} alt={product.name} /></div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category} / {product.brand}</p>
          <h1>{product.name}</h1>
          <p className="model-line">Brand: <b>{product.brand}</b><span /> Model: <b>{product.model}</b></p>
          <div className="detail-price">{money(product.price)}</div>
          <p className="detail-description">{product.description}</p>
          <div className="stock-line"><span className={product.stock > 0 ? "status-dot" : "status-dot out"} />{product.stock > 0 ? `${product.stock} available in stock` : "Currently out of stock"}</div>
          <div className="quantity-row">
            <span>Quantity</span>
            <div className="quantity-control">
              <button aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={16} /></button>
              <b>{quantity}</b>
              <button aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} disabled={quantity >= product.stock}><Plus size={16} /></button>
            </div>
          </div>
          <button className="button primary wide" disabled={product.stock < 1} onClick={() => add(product, quantity)}><ShoppingCart size={18} /> Add to cart · {money(product.price * quantity)}</button>
          <Link className="button secondary wide" to="/quote">Ask about this product</Link>
          <div className="detail-assurances"><span><ShieldCheck /> Product support</span><span><PackageCheck /> Order assistance</span></div>
          <div className="spec-block">
            <h3>Product details</h3>
            <div><span>Brand</span><b>{product.brand}</b></div>
            <div><span>Model</span><b>{product.model}</b></div>
            <div><span>Category</span><b>{product.category}</b></div>
            <div><span>Availability</span><b>{product.stock > 0 ? "In stock" : "Out of stock"}</b></div>
          </div>
        </div>
      </div>
    </main>
  );
}
