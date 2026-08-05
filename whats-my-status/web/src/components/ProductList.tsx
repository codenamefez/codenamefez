import type { Product } from "../lib/types";
import { StatusBadge } from "./StatusBadge";

export function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-zinc-500">No products configured yet.</p>
    );
  }

  return (
    <div className="divide-y divide-zinc-200">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-zinc-900">{product.name}</h3>
            {product.description && (
              <p className="mt-0.5 text-sm text-zinc-500">{product.description}</p>
            )}
            {product.status_message && (
              <p className="mt-2 text-sm text-zinc-600">{product.status_message}</p>
            )}
          </div>
          <StatusBadge status={product.status} />
        </div>
      ))}
    </div>
  );
}
