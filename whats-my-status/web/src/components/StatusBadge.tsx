import type { ProductStatus } from "../lib/types";
import {
  getProductStatusColor,
  getProductStatusTextColor,
  PRODUCT_STATUS_LABELS,
} from "../lib/status";

export function StatusBadge({
  status,
  size = "md",
  showLabel = true,
}: {
  status: ProductStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const dotSize =
    size === "sm" ? "h-2 w-2" : size === "lg" ? "h-4 w-4" : "h-3 w-3";
  const textSize =
    size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <span className={`inline-flex items-center gap-2 ${textSize}`}>
      <span
        className={`${dotSize} rounded-full ${getProductStatusColor(status)} shrink-0`}
      />
      {showLabel && (
        <span className={`font-medium ${getProductStatusTextColor(status)}`}>
          {PRODUCT_STATUS_LABELS[status]}
        </span>
      )}
    </span>
  );
}

export function OverallStatusBanner({
  status,
  message,
}: {
  status: ProductStatus;
  message: string;
}) {
  const bgClass =
    status === "operational"
      ? "bg-emerald-50 border-emerald-200"
      : status === "maintenance"
        ? "bg-blue-50 border-blue-200"
        : "bg-amber-50 border-amber-200";

  return (
    <div className={`rounded-xl border px-6 py-5 ${bgClass}`}>
      <div className="flex items-center gap-3">
        <StatusBadge status={status} size="lg" />
        <p className="text-lg font-semibold text-zinc-900">{message}</p>
      </div>
    </div>
  );
}
