import { format } from "date-fns";
import type { IncidentWithDetails } from "../lib/types";
import { INCIDENT_IMPACT_LABELS, INCIDENT_STATUS_LABELS } from "../lib/status";
import { FormattedDate } from "./AnnouncementBanner";

export function IncidentTimeline({
  incidents,
  showResolved = false,
}: {
  incidents: IncidentWithDetails[];
  showResolved?: boolean;
}) {
  if (incidents.length === 0) return null;

  return (
    <div className="space-y-6">
      {incidents.map((incident) => (
        <article
          key={incident.id}
          className="rounded-xl border border-zinc-200 bg-white p-5"
        >
          <header>
            <h3 className="text-lg font-semibold text-zinc-900">{incident.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium">
                {INCIDENT_STATUS_LABELS[incident.status]}
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium">
                {INCIDENT_IMPACT_LABELS[incident.impact]} impact
              </span>
              <span>
                Started <FormattedDate date={incident.created_at} />
              </span>
              {showResolved && incident.resolved_at && (
                <span>· Resolved {format(new Date(incident.resolved_at), "PPp")}</span>
              )}
            </div>
          </header>

          {incident.products.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {incident.products.map((product) => (
                <span
                  key={product.id}
                  className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700"
                >
                  {product.name}
                </span>
              ))}
            </div>
          )}

          <ol className="mt-4 space-y-4 border-t border-zinc-100 pt-4">
            {incident.updates.map((update, index) => (
              <li key={update.id} className="relative pl-6">
                {index < incident.updates.length - 1 && (
                  <span className="absolute left-[7px] top-5 h-full w-px bg-zinc-200" />
                )}
                <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-300 bg-white" />
                <div className="text-xs font-medium text-zinc-500">
                  {INCIDENT_STATUS_LABELS[update.status]} ·{" "}
                  {format(new Date(update.created_at), "PPp")}
                </div>
                <p className="mt-1 text-sm text-zinc-700">{update.message}</p>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  );
}
