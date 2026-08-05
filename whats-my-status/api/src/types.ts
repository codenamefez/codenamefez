export type ProductStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance";

export type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

export type IncidentImpact = "minor" | "major" | "critical";
export type AnnouncementType = "info" | "maintenance" | "warning";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  status: ProductStatus;
  status_message: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  created_at: string;
  resolved_at: string | null;
  updated_at: string;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  message: string;
  status: IncidentStatus;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncidentWithDetails extends Incident {
  products: Product[];
  updates: IncidentUpdate[];
}

export interface StatusPageData {
  products: Product[];
  activeIncidents: IncidentWithDetails[];
  resolvedIncidents: IncidentWithDetails[];
  announcements: Announcement[];
  overallStatus: ProductStatus;
  pageTitle: string;
  pageDescription: string;
}

export interface JwtPayload {
  sub: "admin";
  iat: number;
  exp: number;
}
