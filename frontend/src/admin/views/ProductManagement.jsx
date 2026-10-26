import { useEffect, useState } from "react";
import { ImagePlus, Plus, Pencil, Archive, X } from "lucide-react";
import { api, uploadImage } from "../../services/api";
import { productImageUrl } from "../../utils/productImage";

const emptyProduct = { name: "", brand: "Savvy Energy", model: "Standard", category: "", description: "", price: "", currency: "NGN", image_url: "/products/solar-panel.svg", stock: "0", is_active: true };
const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value || 0));

export default function ProductManagement({ products, categories, onRefresh, setError }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => () => { if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview); }, [imagePreview]);
  const beginCreate = () => { setEditing(null); setForm({ ...emptyProduct, category: categories[0]?.name || "" }); setImageFile(null); setImagePreview(""); setShowForm(true); };
  const beginEdit = (product) => { setEditing(product.id); setForm({ ...product, price: String(product.price), stock: String(product.stock) }); setImageFile(null); setImagePreview(""); setShowForm(true); };
  const changeImage = (file) => { setImageFile(file || null); setImagePreview(file ? URL.createObjectURL(file) : ""); };

  async function save(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      let imageUrl = form.image_url;
      if (imageFile) imageUrl = (await uploadImage(imageFile)).image_url;
      const payload = { ...form, image_url: imageUrl, price: Number(form.price), stock: Number(form.stock), is_active: true };
      await api(editing ? `/products/${editing}` : "/products", { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) });
      setShowForm(false); setEditing(null); setForm(emptyProduct); setImageFile(null); setImagePreview(""); await onRefresh();
    } catch (error) { setError(error.message); } finally { setSaving(false); }
  }

  async function archive(product) {
    if (!window.confirm(`Archive “${product.name}”? It will no longer appear in the storefront.`)) return;
    try { await api(`/products/${product.id}`, { method: "DELETE" }); await onRefresh(); }
    catch (error) { setError(error.message); }
  }

  return <section>
    <div className="admin-table-heading"><div><h2>Product catalogue</h2><p className="muted-copy">Add products, update details and upload product photos.</p></div><button className="button primary" onClick={beginCreate}><Plus size={16} /> Add product</button></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>
      {products.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><img className="admin-product-image" src={productImageUrl(product.image_url)} alt="" /><span><b>{product.name}</b><small>{product.brand} · {product.model}</small></span></div></td><td>{product.category}</td><td>{money(product.price)}</td><td>{product.stock}</td><td><button className="table-action" onClick={() => beginEdit(product)}><Pencil size={13} /> Edit</button><button className="table-action danger-text" onClick={() => archive(product)}><Archive size={13} /> Archive</button></td></tr>)}
      {!products.length && <tr><td colSpan="5">No products found.</td></tr>}
    </tbody></table></div>
    {showForm && <form className="admin-edit-form" onSubmit={save}>
      <div className="admin-form-title"><h3>{editing ? "Edit product" : "Add a product"}</h3><button type="button" className="icon-button" aria-label="Close editor" onClick={() => setShowForm(false)}><X size={17} /></button></div>
      <div className="form-grid">
        <label>Product name<input required minLength="2" maxLength="200" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Brand<input required maxLength="120" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></label>
        <label>Model<input required maxLength="120" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></label>
        <label>Category<select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="" disabled>Select a category</option>{categories.map((category) => <option key={category.id || category.name} value={category.name}>{category.name}</option>)}</select>{!categories.length && <small>Create a category first in Category management.</small>}</label>
        <label>Price (NGN)<input required type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
        <label>Stock quantity<input required type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
      </div>
      <label>Description<textarea required minLength="5" rows="3" maxLength="5000" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <div className="admin-image-field"><label htmlFor="product-image">Product picture</label><div className="admin-image-preview"><img src={imagePreview || productImageUrl(form.image_url)} alt="Product preview" /><div><input id="product-image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => changeImage(e.target.files?.[0])} /><small>Choose a picture from your device (JPG, PNG, WEBP or GIF; maximum 5 MB).</small></div></div>{imageFile && <button className="table-action" type="button" onClick={() => changeImage(null)}><X size={13} /> Remove selected file</button>}</div>
      <div className="admin-form-actions"><button type="button" className="button secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="button primary" disabled={saving || !categories.length}>{saving ? "Saving…" : editing ? "Save changes" : "Create product"}</button></div>
    </form>}
  </section>;
}
