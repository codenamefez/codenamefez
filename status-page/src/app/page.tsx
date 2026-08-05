import Link from "next/link";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { IncidentTimeline } from "@/components/IncidentTimeline";
import { OverallStatusBanner } from "@/components/StatusBadge";
import { ProductList } from "@/components/ProductList";
import { getSetting, getStatusPageData } from "@/lib/db";
import { getOverallStatusMessage } from "@/lib/status";

export const dynamic = "force-dynamic";

export default function StatusPage() {
  const pageTitle = getSetting("page_title") || "Company Status";
  const pageDescription =
    getSetting("page_description") ||
    "Current status of our products and services";
  const data = getStatusPageData();

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="mt-1 text-sm text-zinc-500">{pageDescription}</p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
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
            {data.announcements.map((announcement) => (
              <AnnouncementBanner
                key={announcement.id}
                title={announcement.title}
                message={announcement.message}
                type={announcement.type}
              />
            ))}
          </section>
        )}

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
            <IncidentTimeline
              incidents={data.resolvedIncidents}
              showResolved
            />
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
        Last updated {new Date().toLocaleString()}
      </footer>
    </div>
  );
}
