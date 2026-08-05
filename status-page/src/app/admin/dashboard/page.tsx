import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/ProductList";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getActiveIncidents,
  getAllProducts,
  getAllAnnouncements,
} from "@/lib/db";
import { PRODUCT_STATUS_LABELS } from "@/lib/status";
import { quickUpdateProductStatusAction } from "@/app/admin/actions";

export default async function AdminDashboardPage() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) redirect("/admin/login");

  const products = getAllProducts();
  const activeIncidents = getActiveIncidents();
  const announcements = getAllAnnouncements().filter((a) => a.active);

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Management
        </p>
        <AdminNav current="dashboard" />
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-zinc-500">
          Quick overview and status updates for your team.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">Products</p>
            <p className="mt-1 text-3xl font-bold">{products.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">Active Incidents</p>
            <p className="mt-1 text-3xl font-bold">{activeIncidents.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">Live Announcements</p>
            <p className="mt-1 text-3xl font-bold">{announcements.length}</p>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick Status Update</h2>
            <Link
              href="/admin/products"
              className="text-sm text-zinc-500 hover:text-zinc-700"
            >
              Manage products →
            </Link>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Update a product status without creating a full incident.
          </p>

          <div className="mt-4 space-y-3">
            {products.map((product) => (
              <form
                key={product.id}
                action={quickUpdateProductStatusAction}
                className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <input type="hidden" name="id" value={product.id} />
                <div className="min-w-[160px] flex-1">
                  <label className="text-sm font-medium">{product.name}</label>
                  <p className="text-xs text-zinc-400">
                    Currently: {PRODUCT_STATUS_LABELS[product.status]}
                  </p>
                </div>
                <div>
                  <label htmlFor={`status-${product.id}`} className="sr-only">
                    Status
                  </label>
                  <select
                    id={`status-${product.id}`}
                    name="status"
                    defaultValue={product.status}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[200px] flex-1">
                  <label htmlFor={`msg-${product.id}`} className="sr-only">
                    Status message
                  </label>
                  <input
                    id={`msg-${product.id}`}
                    name="status_message"
                    type="text"
                    defaultValue={product.status_message ?? ""}
                    placeholder="Optional status message"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Update
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/admin/incidents/new"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Report Incident
            </Link>
            <Link
              href="/admin/announcements/new"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Post Announcement
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Preview Status Page
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
