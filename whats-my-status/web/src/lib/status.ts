import type { ProductStatus } from "./types";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  operational: "Operational",
  degraded: "Degraded Performance",
  partial_outage: "Partial Outage",
  major_outage: "Major Outage",
  maintenance: "Under Maintenance",
};

export const INCIDENT_STATUS_LABELS = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
} as const;

export const INCIDENT_IMPACT_LABELS = {
  minor: "Minor",
  major: "Major",
  critical: "Critical",
} as const;

export const ANNOUNCEMENT_TYPE_LABELS = {
  info: "Information",
  maintenance: "Maintenance",
  warning: "Warning",
} as const;

export function getProductStatusColor(status: ProductStatus): string {
  const colors: Record<ProductStatus, string> = {
    operational: "bg-emerald-500",
    degraded: "bg-amber-500",
    partial_outage: "bg-orange-500",
    major_outage: "bg-red-500",
    maintenance: "bg-blue-500",
  };
  return colors[status];
}

export function getProductStatusTextColor(status: ProductStatus): string {
  const colors: Record<ProductStatus, string> = {
    operational: "text-emerald-700",
    degraded: "text-amber-700",
    partial_outage: "text-orange-700",
    major_outage: "text-red-700",
    maintenance: "text-blue-700",
  };
  return colors[status];
}

export function getOverallStatusMessage(status: ProductStatus): string {
  const messages: Record<ProductStatus, string> = {
    operational: "All systems operational",
    degraded: "Some systems are experiencing degraded performance",
    partial_outage: "Some systems are experiencing partial outages",
    major_outage: "Some systems are experiencing major outages",
    maintenance: "Scheduled maintenance in progress",
  };
  return messages[status];
}
