import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { AdminLayout } from "../../components/AdminLayout";
import { clearToken } from "../../lib/auth";

export function SettingsPage() {
  const navigate = useNavigate();
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      setPageTitle(s.pageTitle);
      setPageDescription(s.pageDescription);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.updateSettings({
      pageTitle,
      pageDescription,
      newPassword: newPassword || undefined,
    });
    setNewPassword("");
    setSaved(true);
  }

  function handleLogout() {
    clearToken();
    navigate("/admin/login");
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-zinc-500">Configure the status page and admin access.</p>

      {saved && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Settings saved successfully.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">Page Configuration</legend>
          <div>
            <label className="block text-sm font-medium">Page Title</label>
            <input
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Page Description</label>
            <input
              value={pageDescription}
              onChange={(e) => setPageDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">Security</legend>
          <div>
            <label className="block text-sm font-medium">New Admin Password</label>
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Save Settings
        </button>
      </form>

      <div className="mt-12 border-t border-zinc-200 pt-8">
        <button
          onClick={handleLogout}
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          Sign out
        </button>
      </div>
    </AdminLayout>
  );
}
