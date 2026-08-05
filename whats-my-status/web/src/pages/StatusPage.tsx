import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { AnnouncementBanner } from "../components/AnnouncementBanner";
import { IncidentTimeline } from "../components/IncidentTimeline";
import { ProductList } from "../components/ProductList";
import { OverallStatusBanner } from "../components/StatusBadge";
import { getOverallStatusMessage } from "../lib/status";
import type { StatusPageData } from "../lib/types";

export function StatusPage() {
  const [data, setData] = useState<StatusPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getStatus()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Loading status...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        Failed to load status: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{data.pageTitle}</h1>
            <p className="mt-1 text-sm text-zinc-500">{data.pageDescription}</p>
          </div>
          <Link to="/admin" className="text-sm text-zinc-400 hover:text-zinc-600">
            Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <OverallStatusBanner
          status={data.overallStatus}
          message={getOverallStatusMessage(data.overallStatus)}
        />

        {data.announcements.length > 0 && (
          <section className="space-y-3">
            {data.announcements.map((a) => (
              <AnnouncementBanner
                key={a.id}
                title={a.title}
                message={a.message}
                type={a.type}
              />
            ))}
          </section>
        )}

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Services</h2>
          <ProductList products={data.products} />
        </section>

        {data.activeIncidents.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Active Incidents</h2>
            <IncidentTimeline incidents={data.activeIncidents} />
          </section>
        )}

        {data.resolvedIncidents.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-500">
              Past Incidents
            </h2>
            <IncidentTimeline incidents={data.resolvedIncidents} showResolved />
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400">
        Last updated {new Date().toLocaleString()}
      </footer>
    </div>
  );
}
