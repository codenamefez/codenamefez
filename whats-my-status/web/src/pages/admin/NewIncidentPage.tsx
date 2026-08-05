import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { AdminLayout } from "../../components/AdminLayout";
import {
  INCIDENT_IMPACT_LABELS,
  INCIDENT_STATUS_LABELS,
} from "../../lib/status";
import type {
  IncidentImpact,
  IncidentStatus,
  Product,
} from "../../lib/types";

export function NewIncidentPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<IncidentStatus>("investigating");
  const [impact, setImpact] = useState<IncidentImpact>("minor");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    api.getProducts().then(setProducts);
  }, []);

  function toggleProduct(id: string) {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.createIncident({
      title,
      message,
      status,
      impact,
      productIds: selectedProducts,
    });
    navigate("/admin/incidents");
  }

  return (
    <AdminLayout>
      <Link to="/admin/incidents" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to incidents
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Report Incident</h1>

      <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium">Incident Title *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Initial Update *</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IncidentStatus)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              {Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Impact</label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value as IncidentImpact)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              {Object.entries(INCIDENT_IMPACT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {products.length > 0 && (
          <fieldset>
            <legend className="text-sm font-medium">Affected Products</legend>
            <div className="mt-2 space-y-2">
              {products.map((product) => (
                <label key={product.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                  />
                  {product.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <button
          type="submit"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Create Incident
        </button>
      </form>
    </AdminLayout>
  );
}
