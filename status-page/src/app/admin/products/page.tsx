import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/ProductList";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllProducts } from "@/lib/db";
import { PRODUCT_STATUS_LABELS } from "@/lib/status";
import { deleteProductAction } from "@/app/admin/actions";

export default async function AdminProductsPage() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) redirect("/admin/login");

  const products = getAllProducts();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Management
        </p>
        <AdminNav current="products" />
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="mt-1 text-zinc-500">
              Manage the products and services shown on the status page.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Add Product
          </Link>
        </div>

        <div className="mt-8 space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
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
                  href={`/admin/products/${product.id}/edit`}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Edit
                </Link>
                <form action={deleteProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <p className="py-12 text-center text-zinc-500">
              No products yet.{" "}
              <Link href="/admin/products/new" className="underline">
                Add your first product
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
