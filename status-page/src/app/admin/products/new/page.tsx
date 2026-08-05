import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/ProductList";
import { isAdminAuthenticated } from "@/lib/auth";
import { PRODUCT_STATUS_LABELS } from "@/lib/status";
import { createProductAction } from "@/app/admin/actions";

export default async function NewProductPage() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <AdminNav current="products" />
      </aside>

      <main className="flex-1 p-8">
        <Link href="/admin/products" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to products
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Add Product</h1>

        <form action={createProductAction} className="mt-8 max-w-lg space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name *
            </label>
            <input
              id="name"
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium">
              Initial Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="operational"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
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
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Create Product
          </button>
        </form>
      </main>
    </div>
  );
}
