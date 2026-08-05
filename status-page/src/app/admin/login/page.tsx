import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { loginAction } from "@/app/admin/login/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const isAdmin = await isAdminAuthenticated();
  if (isAdmin) redirect("/admin/dashboard");

  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Sign in to manage the status page
          </p>
        </div>

        <form action={loginAction} className="mt-8 space-y-4">
          {params.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              {params.error}
            </p>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Default password is <code className="text-zinc-500">changeme</code> — change
          it in Settings after first login.
        </p>

        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
            ← Back to status page
          </Link>
        </p>
      </div>
    </div>
  );
}
