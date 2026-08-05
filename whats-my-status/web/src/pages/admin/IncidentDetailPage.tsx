import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { AdminLayout } from "../../components/AdminLayout";
import { INCIDENT_STATUS_LABELS } from "../../lib/status";
import type { IncidentStatus, IncidentWithDetails } from "../../lib/types";

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<IncidentWithDetails | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<IncidentStatus>("investigating");

  useEffect(() => {
    if (id) api.getIncident(id).then(setIncident);
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    const updated = await api.addIncidentUpdate(id, { message, status });
    setIncident(updated);
    setMessage("");
  }

  if (!incident) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <Link to="/admin/incidents" className="text-sm text-zinc-500 hover:text-zinc-700">
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
              className="rounded-lg border border-zinc-200 bg-white p-4"
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
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share the latest on this incident..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IncidentStatus)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              {Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Post Update
            </button>
          </form>
        </section>
      )}
    </AdminLayout>
  );
}
