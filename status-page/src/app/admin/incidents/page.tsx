import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/ProductList";
import { FormattedDate } from "@/components/AnnouncementBanner";
import { isAdminAuthenticated } from "@/lib/auth";
import { getActiveIncidents, getResolvedIncidents } from "@/lib/db";
import { INCIDENT_IMPACT_LABELS, INCIDENT_STATUS_LABELS } from "@/lib/status";
import { deleteIncidentAction } from "@/app/admin/actions";

export default async function AdminIncidentsPage() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) redirect("/admin/login");

  const activeIncidents = getActiveIncidents();
  const resolvedIncidents = getResolvedIncidents(20);

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <AdminNav current="incidents" />
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Incidents</h1>
            <p className="mt-1 text-zinc-500">
              Report and manage service incidents with timeline updates.
            </p>
          </div>
          <Link
            href="/admin/incidents/new"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Report Incident
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Active</h2>
          <div className="mt-4 space-y-3">
            {activeIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <h3 className="font-medium">{incident.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {INCIDENT_STATUS_LABELS[incident.status]} ·{" "}
                    {INCIDENT_IMPACT_LABELS[incident.impact]} impact · Started{" "}
                    <FormattedDate date={incident.created_at} />
                  </p>
                  {incident.products.length > 0 && (
                    <p className="mt-1 text-xs text-zinc-400">
                      Affects: {incident.products.map((p) => p.name).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/incidents/${incident.id}`}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Manage
                  </Link>
                  <form action={deleteIncidentAction}>
                    <input type="hidden" name="id" value={incident.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {activeIncidents.length === 0 && (
              <p className="py-6 text-center text-zinc-500">No active incidents.</p>
            )}
          </div>
        </section>

        {resolvedIncidents.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-500">Resolved</h2>
            <div className="mt-4 space-y-3">
              {resolvedIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 opacity-75 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <h3 className="font-medium">{incident.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      Resolved · Started <FormattedDate date={incident.created_at} />
                    </p>
                  </div>
                  <Link
                    href={`/admin/incidents/${incident.id}`}
                    className="text-sm text-zinc-500 hover:text-zinc-700"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
