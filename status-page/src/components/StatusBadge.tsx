import type { ProductStatus } from "@/lib/types";
import {
  getProductStatusColor,
  getProductStatusTextColor,
  PRODUCT_STATUS_LABELS,
} from "@/lib/status";

interface StatusBadgeProps {
  status: ProductStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function StatusBadge({
  status,
  size = "md",
  showLabel = true,
}: StatusBadgeProps) {
  const dotSize =
    size === "sm" ? "h-2 w-2" : size === "lg" ? "h-4 w-4" : "h-3 w-3";
  const textSize =
    size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <span className={`inline-flex items-center gap-2 ${textSize}`}>
      <span
        className={`${dotSize} rounded-full ${getProductStatusColor(status)} shrink-0`}
        aria-hidden
      />
      {showLabel && (
        <span className={`font-medium ${getProductStatusTextColor(status)}`}>
          {PRODUCT_STATUS_LABELS[status]}
        </span>
      )}
    </span>
  );
}

interface OverallStatusBannerProps {
  status: ProductStatus;
  message: string;
}

export function OverallStatusBanner({ status, message }: OverallStatusBannerProps) {
  const bgClass =
    status === "operational"
      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
      : status === "maintenance"
        ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
        : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800";

  return (
    <div className={`rounded-xl border px-6 py-5 ${bgClass}`}>
      <div className="flex items-center gap-3">
        <StatusBadge status={status} size="lg" />
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {message}
        </p>
      </div>
    </div>
  );
}
