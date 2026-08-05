import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminNav } from "@/components/ProductList";
import { isAdminAuthenticated } from "@/lib/auth";
import { getProduct } from "@/lib/db";
import { PRODUCT_STATUS_LABELS } from "@/lib/status";
import { updateProductAction } from "@/app/admin/actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) redirect("/admin/login");

  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <AdminNav current="products" />
      </aside>

      <main className="flex-1 p-8">
        <Link href="/admin/products" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to products
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Edit {product.name}</h1>

        <form action={updateProductAction} className="mt-8 max-w-lg space-y-4">
          <input type="hidden" name="id" value={product.id} />
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name *
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={product.name}
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
              defaultValue={product.description ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={product.status}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status_message" className="block text-sm font-medium">
              Status Message
            </label>
            <input
              id="status_message"
              name="status_message"
              defaultValue={product.status_message ?? ""}
              placeholder="e.g. Investigating increased latency"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-1 text-xs text-zinc-400">
              Shown on the public status page below the product name.
            </p>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
}
