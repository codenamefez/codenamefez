import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { AdminLayout } from "../../components/AdminLayout";
import { PRODUCT_STATUS_LABELS } from "../../lib/status";
import type { ProductStatus } from "../../lib/types";

export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProductStatus>("operational");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getProducts().then((products) => {
      const product = products.find((p) => p.id === id);
      if (product) {
        setName(product.name);
        setDescription(product.description ?? "");
        setStatus(product.status);
        setStatusMessage(product.status_message ?? "");
      }
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    await api.updateProduct(id, {
      name,
      description: description || null,
      status,
      status_message: statusMessage || null,
    });
    navigate("/admin/products");
  }

  if (loading) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <Link to="/admin/products" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to products
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit Product</h1>

      <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4">
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
          <label className="block text-sm font-medium">Status</label>
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
        <div>
          <label className="block text-sm font-medium">Status Message</label>
          <input
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            placeholder="e.g. Investigating increased latency"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Save Changes
        </button>
      </form>
    </AdminLayout>
  );
}
