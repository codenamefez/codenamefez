import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/ProductList";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllProducts } from "@/lib/db";
import {
  INCIDENT_IMPACT_LABELS,
  INCIDENT_STATUS_LABELS,
} from "@/lib/status";
import { createIncidentAction } from "@/app/admin/actions";

export default async function NewIncidentPage() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) redirect("/admin/login");

  const products = getAllProducts();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <AdminNav current="incidents" />
      </aside>

      <main className="flex-1 p-8">
        <Link href="/admin/incidents" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to incidents
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Report Incident</h1>
        <p className="mt-1 text-zinc-500">
          Create an incident and post the first update. You can add more updates
          as the situation develops.
        </p>

        <form action={createIncidentAction} className="mt-8 max-w-lg space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Incident Title *
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. API latency issues"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Initial Update *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              placeholder="Describe what's happening and what you're doing about it..."
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue="investigating"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              >
                {Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="impact" className="block text-sm font-medium">
                Impact
              </label>
              <select
                id="impact"
                name="impact"
                defaultValue="minor"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
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
                      name="product_ids"
                      value={product.id}
                      className="rounded border-zinc-300"
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
      </main>
    </div>
  );
}
