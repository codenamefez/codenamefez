import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/ProductList";
import { FormattedDate } from "@/components/AnnouncementBanner";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllAnnouncements } from "@/lib/db";
import { ANNOUNCEMENT_TYPE_LABELS } from "@/lib/status";
import {
  deleteAnnouncementAction,
  toggleAnnouncementAction,
} from "@/app/admin/actions";

export default async function AdminAnnouncementsPage() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) redirect("/admin/login");

  const announcements = getAllAnnouncements();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <AdminNav current="announcements" />
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Announcements</h1>
            <p className="mt-1 text-zinc-500">
              Post messages visible to everyone on the status page.
            </p>
          </div>
          <Link
            href="/admin/announcements/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            New Announcement
          </Link>
        </div>

        <div className="mt-8 space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`rounded-xl border p-4 ${
                announcement.active
                  ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  : "border-zinc-100 bg-zinc-50 opacity-60 dark:border-zinc-900 dark:bg-zinc-950"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                      {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
                    </span>
                    {!announcement.active && (
                      <span className="text-xs text-zinc-400">Hidden</span>
                    )}
                  </div>
                  <h3 className="mt-2 font-medium">{announcement.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {announcement.message}
                  </p>
                  <p className="mt-2 text-xs text-zinc-400">
                    Posted <FormattedDate date={announcement.created_at} />
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={toggleAnnouncementAction}>
                    <input type="hidden" name="id" value={announcement.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={announcement.active}
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {announcement.active ? "Hide" : "Show"}
                    </button>
                  </form>
                  <form action={deleteAnnouncementAction}>
                    <input type="hidden" name="id" value={announcement.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <p className="py-12 text-center text-zinc-500">
              No announcements yet.{" "}
              <Link href="/admin/announcements/new" className="underline">
                Post your first message
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
