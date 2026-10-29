import { useState } from "react";
import { api } from "../../services/api";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

export default function CategoryManagement({ categories, onRefresh, setError }) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [busy, setBusy] = useState(false);

  // Handle creating a new category
  async function create(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await api("/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setName("");
      await onRefresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  // Handle renaming an existing category
  async function rename(id) {
    setBusy(true);
    setError("");

    try {
      await api(`/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editingName }),
      });
      setEditingId(null);
      await onRefresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  // Handle deleting a category
  async function remove(category) {
    if (!window.confirm(`Remove category “${category.name}”?`)) return;
    setError("");

    try {
      await api(`/admin/categories/${category.id}`, { method: "DELETE" });
      await onRefresh();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <section>
      {/* Heading Section */}
      <div className="admin-table-heading">
        <div>
          <h2>Category management</h2>
          <p className="muted-copy">
            Create categories, rename them or remove unused categories.
          </p>
        </div>
      </div>

      {/* Creation Form */}
      <form className="category-create-form" onSubmit={create}>
        <label htmlFor="new-category">New category</label>
        <div>
          <input
            id="new-category"
            required
            minLength="2"
            maxLength="80"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Solar Lighting"
          />
          <button className="button primary" disabled={busy}>
            <Plus size={16} /> Add category
          </button>
        </div>
      </form>

      {/* Category List Display */}
      <div className="category-list">
        {categories.map((category) => (
          <div className="category-row" key={category.id || category.name}>
            
            {/* Inline Editing Form vs Static Display */}
            {editingId === category.id ? (
              <form
                className="category-edit-inline"
                onSubmit={(e) => {
                  e.preventDefault();
                  rename(category.id);
                }}
              >
                <input
                  required
                  minLength="2"
                  maxLength="80"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <button className="table-action" disabled={busy} aria-label="Save category">
                  <Check size={15} />
                </button>
                <button
                  type="button"
                  className="table-action"
                  aria-label="Cancel rename"
                  onClick={() => setEditingId(null)}
                >
                  <X size={15} />
                </button>
              </form>
            ) : (
              <div>
                <b>{category.name}</b>
                <small>
                  {category.product_count} active product
                  {category.product_count === 1 ? "" : "s"}
                </small>
              </div>
            )}

            {/* Action Buttons (Rename / Remove) */}
            {editingId !== category.id && (
              <div className="category-actions">
                <button
                  className="table-action"
                  onClick={() => {
                    setEditingId(category.id);
                    setEditingName(category.name);
                  }}
                >
                  <Pencil size={14} /> Rename
                </button>
                <button className="table-action danger-text" onClick={() => remove(category)}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Empty State Layout */}
        {!categories.length && (
          <p className="muted-copy">No categories yet. Create your first category above.</p>
        )}
      </div>
    </section>
  );
}