import Link from "next/link";
import { format } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { AdminNav } from "@/components/ProductList";
import { isAdminAuthenticated } from "@/lib/auth";
import { getIncident } from "@/lib/db";
import { INCIDENT_STATUS_LABELS } from "@/lib/status";
import { addIncidentUpdateAction } from "@/app/admin/actions";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) redirect("/admin/login");

  const { id } = await params;
  const incident = getIncident(id);
  if (!incident) notFound();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <AdminNav current="incidents" />
      </aside>

      <main className="flex-1 p-8">
        <Link href="/admin/incidents" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to incidents
        </Link>
        <h1 className="mt-4 text-2xl font-bold">{incident.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {INCIDENT_STATUS_LABELS[incident.status]} · Started{" "}
          {format(new Date(incident.created_at), "PPp")}
        </p>

        <section className="mt-8 max-w-2xl">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <ol className="mt-4 space-y-4">
            {incident.updates.map((update) => (
              <li
                key={update.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="text-xs font-medium text-zinc-500">
                  {INCIDENT_STATUS_LABELS[update.status]} ·{" "}
                  {format(new Date(update.created_at), "PPp")}
                </p>
                <p className="mt-2 text-sm">{update.message}</p>
              </li>
            ))}
          </ol>
        </section>

        {incident.status !== "resolved" && (
          <section className="mt-10 max-w-lg">
            <h2 className="text-lg font-semibold">Post Update</h2>
            <form action={addIncidentUpdateAction} className="mt-4 space-y-4">
              <input type="hidden" name="incident_id" value={incident.id} />
              <div>
                <label htmlFor="message" className="block text-sm font-medium">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Share the latest on this incident..."
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
                  defaultValue={incident.status}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => (
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
                Post Update
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
