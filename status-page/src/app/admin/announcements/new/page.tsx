import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/ProductList";
import { isAdminAuthenticated } from "@/lib/auth";
import { ANNOUNCEMENT_TYPE_LABELS } from "@/lib/status";
import { createAnnouncementAction } from "@/app/admin/actions";

export default async function NewAnnouncementPage() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <AdminNav current="announcements" />
      </aside>

      <main className="flex-1 p-8">
        <Link
          href="/admin/announcements"
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← Back to announcements
        </Link>
        <h1 className="mt-4 text-2xl font-bold">New Announcement</h1>
        <p className="mt-1 text-zinc-500">
          Post a message that appears at the top of the status page for all
          staff to see.
        </p>

        <form action={createAnnouncementAction} className="mt-8 max-w-lg space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Title *
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. Scheduled maintenance this weekend"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              placeholder="What do people need to know?"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium">
              Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue="info"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {Object.entries(ANNOUNCEMENT_TYPE_LABELS).map(([value, label]) => (
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
            Publish Announcement
          </button>
        </form>
      </main>
    </div>
  );
}
