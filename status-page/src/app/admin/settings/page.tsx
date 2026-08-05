import { redirect } from "next/navigation";
import { AdminNav } from "@/components/ProductList";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSetting } from "@/lib/db";
import { logoutAction, updateSettingsAction } from "@/app/admin/actions";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) redirect("/admin/login");

  const params = await searchParams;
  const pageTitle = getSetting("page_title") || "Company Status";
  const pageDescription =
    getSetting("page_description") ||
    "Current status of our products and services";

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <AdminNav current="settings" />
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-zinc-500">
          Configure the status page and admin access.
        </p>

        {params.saved && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            Settings saved successfully.
          </p>
        )}

        <form action={updateSettingsAction} className="mt-8 max-w-lg space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold">Page Configuration</legend>
            <div>
              <label htmlFor="page_title" className="block text-sm font-medium">
                Page Title
              </label>
              <input
                id="page_title"
                name="page_title"
                defaultValue={pageTitle}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label
                htmlFor="page_description"
                className="block text-sm font-medium"
              >
                Page Description
              </label>
              <input
                id="page_description"
                name="page_description"
                defaultValue={pageDescription}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold">Security</legend>
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium">
                New Admin Password
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                minLength={8}
                placeholder="Leave blank to keep current password"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <p className="mt-1 text-xs text-zinc-400">
                Minimum 8 characters. Share this password with team members who
                need admin access.
              </p>
            </div>
          </fieldset>

          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save Settings
          </button>
        </form>

        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-zinc-500 hover:text-zinc-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
