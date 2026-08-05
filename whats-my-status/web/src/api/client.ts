import { clearToken, getToken } from "../lib/auth";
import type {
  Announcement,
  AnnouncementType,
  IncidentImpact,
  IncidentStatus,
  IncidentWithDetails,
  Product,
  ProductStatus,
  PublicSettings,
  StatusPageData,
} from "../lib/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && auth) {
    clearToken();
    window.location.href = "/admin/login";
    throw new ApiError(401, "Unauthorized");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.error || response.statusText);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getStatus: () => request<StatusPageData>("/status"),
  login: (password: string) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  getProducts: () => request<Product[]>("/products", {}, true),
  createProduct: (data: {
    name: string;
    description?: string;
    status?: ProductStatus;
  }) =>
    request<Product>(
      "/products",
      { method: "POST", body: JSON.stringify(data) },
      true
    ),
  updateProduct: (
    id: string,
    data: Partial<
      Pick<Product, "name" | "description" | "status" | "status_message">
    >
  ) =>
    request<Product>(
      `/products/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      true
    ),
  patchProductStatus: (
    id: string,
    data: { status: ProductStatus; status_message?: string | null }
  ) =>
    request<Product>(
      `/products/${id}/status`,
      { method: "PATCH", body: JSON.stringify(data) },
      true
    ),
  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, { method: "DELETE" }, true),

  getIncidents: () =>
    request<{ active: IncidentWithDetails[]; resolved: IncidentWithDetails[] }>(
      "/incidents"
    ),
  getIncident: (id: string) =>
    request<IncidentWithDetails>(`/incidents/${id}`),
  createIncident: (data: {
    title: string;
    message: string;
    status?: IncidentStatus;
    impact?: IncidentImpact;
    productIds?: string[];
  }) =>
    request<IncidentWithDetails>(
      "/incidents",
      { method: "POST", body: JSON.stringify(data) },
      true
    ),
  addIncidentUpdate: (
    id: string,
    data: { message: string; status: IncidentStatus }
  ) =>
    request<IncidentWithDetails>(
      `/incidents/${id}/updates`,
      { method: "POST", body: JSON.stringify(data) },
      true
    ),
  deleteIncident: (id: string) =>
    request<void>(`/incidents/${id}`, { method: "DELETE" }, true),

  getAnnouncements: (all = false) =>
    request<Announcement[]>(`/announcements${all ? "?all=1" : ""}`, {}, all),
  createAnnouncement: (data: {
    title: string;
    message: string;
    type?: AnnouncementType;
  }) =>
    request<Announcement>(
      "/announcements",
      { method: "POST", body: JSON.stringify(data) },
      true
    ),
  updateAnnouncement: (
    id: string,
    data: Partial<Pick<Announcement, "title" | "message" | "type" | "active">>
  ) =>
    request<Announcement>(
      `/announcements/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      true
    ),
  deleteAnnouncement: (id: string) =>
    request<void>(`/announcements/${id}`, { method: "DELETE" }, true),

  getSettings: () => request<PublicSettings>("/settings"),
  updateSettings: (data: {
    pageTitle?: string;
    pageDescription?: string;
    newPassword?: string;
  }) =>
    request<PublicSettings>(
      "/settings",
      { method: "PUT", body: JSON.stringify(data) },
      true
    ),
};

export { ApiError };
