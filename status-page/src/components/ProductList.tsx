import Link from "next/link";
import type { Product } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-zinc-500">No products configured yet.</p>
    );
  }

  return (
    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              {product.name}
            </h3>
            {product.description && (
              <p className="mt-0.5 text-sm text-zinc-500">{product.description}</p>
            )}
            {product.status_message && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {product.status_message}
              </p>
            )}
          </div>
          <StatusBadge status={product.status} />
        </div>
      ))}
    </div>
  );
}

interface AdminNavProps {
  current: "dashboard" | "products" | "incidents" | "announcements" | "settings";
}

const navItems = [
  { href: "/admin", label: "Dashboard", key: "dashboard" as const },
  { href: "/admin/products", label: "Products", key: "products" as const },
  { href: "/admin/incidents", label: "Incidents", key: "incidents" as const },
  {
    href: "/admin/announcements",
    label: "Announcements",
    key: "announcements" as const,
  },
  { href: "/admin/settings", label: "Settings", key: "settings" as const },
];

export function AdminNav({ current }: AdminNavProps) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            current === item.key
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          {item.label}
        </Link>
      ))}
      <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />
      <Link
        href="/"
        className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        View Status Page
      </Link>
    </nav>
  );
}
