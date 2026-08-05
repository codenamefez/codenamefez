import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { AdminLayout } from "../../components/AdminLayout";
import { ANNOUNCEMENT_TYPE_LABELS } from "../../lib/status";
import type { AnnouncementType } from "../../lib/types";

export function NewAnnouncementPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<AnnouncementType>("info");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.createAnnouncement({ title, message, type });
    navigate("/admin/announcements");
  }

  return (
    <AdminLayout>
      <Link
        to="/admin/announcements"
        className="text-sm text-zinc-500 hover:text-zinc-700"
      >
        ← Back to announcements
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New Announcement</h1>

      <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium">Title *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Message *</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AnnouncementType)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
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
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Publish Announcement
        </button>
      </form>
    </AdminLayout>
  );
}
