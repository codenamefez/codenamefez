import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { AdminLayout } from "../../components/AdminLayout";
import { PRODUCT_STATUS_LABELS } from "../../lib/status";
import type { Product, ProductStatus } from "../../lib/types";

export function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({ incidents: 0, announcements: 0 });

  useEffect(() => {
    Promise.all([
      api.getProducts(),
      api.getIncidents(),
      api.getAnnouncements(true),
    ]).then(([prods, incidents, announcements]) => {
      setProducts(prods);
      setStats({
        incidents: incidents.active.length,
        announcements: announcements.filter((a) => a.active).length,
      });
    });
  }, []);

  async function quickUpdate(
    id: string,
    status: ProductStatus,
    statusMessage: string
  ) {
    await api.patchProductStatus(id, {
      status,
      status_message: statusMessage || null,
    });
    const updated = await api.getProducts();
    setProducts(updated);
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-zinc-500">
        Quick overview and status updates for your team.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Products" value={products.length} />
        <StatCard label="Active Incidents" value={stats.incidents} />
        <StatCard label="Live Announcements" value={stats.announcements} />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quick Status Update</h2>
          <Link to="/admin/products" className="text-sm text-zinc-500 hover:text-zinc-700">
            Manage products →
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <QuickUpdateForm
              key={product.id}
              product={product}
              onUpdate={quickUpdate}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/incidents/new"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Report Incident
          </Link>
          <Link
            to="/admin/announcements/new"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Post Announcement
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Preview Status Page
          </Link>
        </div>
      </section>
    </AdminLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function QuickUpdateForm({
  product,
  onUpdate,
}: {
  product: Product;
  onUpdate: (id: string, status: ProductStatus, msg: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(product.status);
  const [message, setMessage] = useState(product.status_message ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onUpdate(product.id, status, message);
    setSaving(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <div className="min-w-[160px] flex-1">
        <p className="text-sm font-medium">{product.name}</p>
        <p className="text-xs text-zinc-400">
          Currently: {PRODUCT_STATUS_LABELS[product.status]}
        </p>
      </div>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as ProductStatus)}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      >
        {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional status message"
        className="min-w-[200px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Update"}
      </button>
    </form>
  );
}
