import type {
  AnnouncementType,
  IncidentImpact,
  IncidentStatus,
  ProductStatus,
} from "./types";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  operational: "Operational",
  degraded: "Degraded Performance",
  partial_outage: "Partial Outage",
  major_outage: "Major Outage",
  maintenance: "Under Maintenance",
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

export const INCIDENT_IMPACT_LABELS: Record<IncidentImpact, string> = {
  minor: "Minor",
  major: "Major",
  critical: "Critical",
};

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  info: "Information",
  maintenance: "Maintenance",
  warning: "Warning",
};

export function getProductStatusColor(status: ProductStatus): string {
  switch (status) {
    case "operational":
      return "bg-emerald-500";
    case "degraded":
      return "bg-amber-500";
    case "partial_outage":
      return "bg-orange-500";
    case "major_outage":
      return "bg-red-500";
    case "maintenance":
      return "bg-blue-500";
  }
}

export function getProductStatusTextColor(status: ProductStatus): string {
  switch (status) {
    case "operational":
      return "text-emerald-700 dark:text-emerald-400";
    case "degraded":
      return "text-amber-700 dark:text-amber-400";
    case "partial_outage":
      return "text-orange-700 dark:text-orange-400";
    case "major_outage":
      return "text-red-700 dark:text-red-400";
    case "maintenance":
      return "text-blue-700 dark:text-blue-400";
  }
}

export function getOverallStatus(products: { status: ProductStatus }[]): ProductStatus {
  if (products.length === 0) return "operational";

  const priority: ProductStatus[] = [
    "major_outage",
    "partial_outage",
    "degraded",
    "maintenance",
    "operational",
  ];

  for (const status of priority) {
    if (products.some((p) => p.status === status)) {
      return status;
    }
  }

  return "operational";
}

export function getOverallStatusMessage(status: ProductStatus): string {
  switch (status) {
    case "operational":
      return "All systems operational";
    case "degraded":
      return "Some systems are experiencing degraded performance";
    case "partial_outage":
      return "Some systems are experiencing partial outages";
    case "major_outage":
      return "Some systems are experiencing major outages";
    case "maintenance":
      return "Scheduled maintenance in progress";
  }
}
