import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { AdminLayout } from "../../components/AdminLayout";
import { FormattedDate } from "../../components/AnnouncementBanner";
import { ANNOUNCEMENT_TYPE_LABELS } from "../../lib/status";
import type { Announcement } from "../../lib/types";

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    api.getAnnouncements(true).then(setAnnouncements);
  }, []);

  async function toggleActive(id: string, active: boolean) {
    await api.updateAnnouncement(id, { active: !active });
    setAnnouncements(await api.getAnnouncements(true));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await api.deleteAnnouncement(id);
    setAnnouncements(await api.getAnnouncements(true));
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="mt-1 text-zinc-500">Post messages visible on the status page.</p>
        </div>
        <Link
          to="/admin/announcements/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          New Announcement
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border p-4 ${
              a.active
                ? "border-zinc-200 bg-white"
                : "border-zinc-100 bg-zinc-50 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium">
                  {ANNOUNCEMENT_TYPE_LABELS[a.type]}
                </span>
                {!a.active && (
                  <span className="ml-2 text-xs text-zinc-400">Hidden</span>
                )}
                <h3 className="mt-2 font-medium">{a.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">{a.message}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  Posted <FormattedDate date={a.created_at} />
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => toggleActive(a.id, a.active)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                >
                  {a.active ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
