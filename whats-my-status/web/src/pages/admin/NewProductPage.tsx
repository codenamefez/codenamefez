import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { AdminLayout } from "../../components/AdminLayout";
import { PRODUCT_STATUS_LABELS } from "../../lib/status";
import type { ProductStatus } from "../../lib/types";

export function NewProductPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProductStatus>("operational");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createProduct({ name, description, status });
      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    }
  }

  return (
    <AdminLayout>
      <Link to="/admin/products" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to products
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Add Product</h1>

      <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium">Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Initial Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Create Product
        </button>
      </form>
    </AdminLayout>
  );
}
