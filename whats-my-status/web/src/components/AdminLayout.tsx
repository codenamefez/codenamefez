import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/incidents", label: "Incidents" },
  { to: "/admin/announcements", label: "Announcements" },
  { to: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
      <div className="my-2 border-t border-zinc-200" />
      <NavLink
        to="/"
        className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
      >
        View Status Page
      </NavLink>
    </nav>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Management
        </p>
        <AdminNav />
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
