import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { AdminLayout } from "../../components/AdminLayout";
import { FormattedDate } from "../../components/AnnouncementBanner";
import { INCIDENT_IMPACT_LABELS, INCIDENT_STATUS_LABELS } from "../../lib/status";
import type { IncidentWithDetails } from "../../lib/types";

export function IncidentsPage() {
  const [active, setActive] = useState<IncidentWithDetails[]>([]);
  const [resolved, setResolved] = useState<IncidentWithDetails[]>([]);

  useEffect(() => {
    api.getIncidents().then((data) => {
      setActive(data.active);
      setResolved(data.resolved);
    });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this incident?")) return;
    await api.deleteIncident(id);
    const data = await api.getIncidents();
    setActive(data.active);
    setResolved(data.resolved);
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Incidents</h1>
          <p className="mt-1 text-zinc-500">Report and manage service incidents.</p>
        </div>
        <Link
          to="/admin/incidents/new"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Report Incident
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Active</h2>
        <div className="mt-4 space-y-3">
          {active.map((incident) => (
            <IncidentRow
              key={incident.id}
              incident={incident}
              onDelete={handleDelete}
            />
          ))}
          {active.length === 0 && (
            <p className="py-6 text-center text-zinc-500">No active incidents.</p>
          )}
        </div>
      </section>

      {resolved.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-500">Resolved</h2>
          <div className="mt-4 space-y-3">
            {resolved.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 opacity-75"
              >
                <div>
                  <h3 className="font-medium">{incident.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Resolved · Started <FormattedDate date={incident.created_at} />
                  </p>
                </div>
                <Link
                  to={`/admin/incidents/${incident.id}`}
                  className="text-sm text-zinc-500 hover:text-zinc-700"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </AdminLayout>
  );
}

function IncidentRow({
  incident,
  onDelete,
}: {
  incident: IncidentWithDetails;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4">
      <div>
        <h3 className="font-medium">{incident.title}</h3>
        <p className="mt-1 text-sm text-zinc-500">
          {INCIDENT_STATUS_LABELS[incident.status]} ·{" "}
          {INCIDENT_IMPACT_LABELS[incident.impact]} impact · Started{" "}
          <FormattedDate date={incident.created_at} />
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          to={`/admin/incidents/${incident.id}`}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          Manage
        </Link>
        <button
          onClick={() => onDelete(incident.id)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
