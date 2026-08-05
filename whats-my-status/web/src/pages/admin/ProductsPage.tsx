import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { AdminLayout } from "../../components/AdminLayout";
import { PRODUCT_STATUS_LABELS } from "../../lib/status";
import type { Product } from "../../lib/types";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts().then(setProducts);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await api.deleteProduct(id);
    setProducts(await api.getProducts());
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-zinc-500">Manage services on the status page.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Add Product
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4"
          >
            <div>
              <h3 className="font-medium">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-zinc-500">{product.description}</p>
              )}
              <p className="mt-1 text-sm text-zinc-400">
                {PRODUCT_STATUS_LABELS[product.status]}
                {product.status_message && ` — ${product.status_message}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/admin/products/${product.id}/edit`}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(product.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
