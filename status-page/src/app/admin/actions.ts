"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  createAnnouncement,
  createIncident,
  createProduct,
  deleteAnnouncement,
  deleteIncident,
  deleteProduct,
  addIncidentUpdate,
  setSetting,
  updateAdminPassword,
  updateAnnouncement,
  updateProduct,
} from "@/lib/db";
import type {
  AnnouncementType,
  IncidentImpact,
  IncidentStatus,
  ProductStatus,
} from "@/lib/types";

async function ensureAdmin() {
  const session = await getSession();
  if (!session.isAdmin) {
    throw new Error("Unauthorized");
  }
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}

export async function createProductAction(formData: FormData) {
  await ensureAdmin();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const status = (formData.get("status") as ProductStatus) || "operational";

  if (!name) {
    redirect("/admin/products/new?error=Product+name+is+required");
  }

  createProduct({ name, description: description || undefined, status });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(formData: FormData) {
  await ensureAdmin();
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const status = formData.get("status") as ProductStatus;
  const statusMessage = (formData.get("status_message") as string)?.trim();

  if (!id || !name) {
    redirect(`/admin/products/${id}/edit?error=Product+name+is+required`);
  }

  updateProduct(id, {
    name,
    description: description || null,
    status,
    status_message: statusMessage || null,
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function quickUpdateProductStatusAction(formData: FormData) {
  await ensureAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as ProductStatus;
  const statusMessage = (formData.get("status_message") as string)?.trim();

  updateProduct(id, {
    status,
    status_message: statusMessage || null,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await ensureAdmin();
  const id = formData.get("id") as string;
  deleteProduct(id);
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function createIncidentAction(formData: FormData) {
  await ensureAdmin();
  const title = (formData.get("title") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  const status = (formData.get("status") as IncidentStatus) || "investigating";
  const impact = (formData.get("impact") as IncidentImpact) || "minor";
  const productIds = formData.getAll("product_ids") as string[];

  if (!title || !message) {
    redirect("/admin/incidents/new?error=Title+and+message+are+required");
  }

  createIncident({ title, message, status, impact, productIds });
  revalidatePath("/");
  revalidatePath("/admin/incidents");
  redirect("/admin/incidents");
}

export async function addIncidentUpdateAction(formData: FormData) {
  await ensureAdmin();
  const incidentId = formData.get("incident_id") as string;
  const message = (formData.get("message") as string)?.trim();
  const status = formData.get("status") as IncidentStatus;

  if (!incidentId || !message) {
    redirect(`/admin/incidents/${incidentId}?error=Message+is+required`);
  }

  addIncidentUpdate({ incidentId, message, status });
  revalidatePath("/");
  revalidatePath("/admin/incidents");
  redirect(`/admin/incidents/${incidentId}`);
}

export async function deleteIncidentAction(formData: FormData) {
  await ensureAdmin();
  const id = formData.get("id") as string;
  deleteIncident(id);
  revalidatePath("/");
  revalidatePath("/admin/incidents");
  redirect("/admin/incidents");
}

export async function createAnnouncementAction(formData: FormData) {
  await ensureAdmin();
  const title = (formData.get("title") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  const type = (formData.get("type") as AnnouncementType) || "info";

  if (!title || !message) {
    redirect("/admin/announcements/new?error=Title+and+message+are+required");
  }

  createAnnouncement({ title, message, type });
  revalidatePath("/");
  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}

export async function toggleAnnouncementAction(formData: FormData) {
  await ensureAdmin();
  const id = formData.get("id") as string;
  const active = formData.get("active") === "1" ? 0 : 1;
  updateAnnouncement(id, { active });
  revalidatePath("/");
  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await ensureAdmin();
  const id = formData.get("id") as string;
  deleteAnnouncement(id);
  revalidatePath("/");
  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}

export async function updateSettingsAction(formData: FormData) {
  await ensureAdmin();
  const pageTitle = (formData.get("page_title") as string)?.trim();
  const pageDescription = (formData.get("page_description") as string)?.trim();
  const newPassword = (formData.get("new_password") as string)?.trim();

  if (pageTitle) setSetting("page_title", pageTitle);
  if (pageDescription) setSetting("page_description", pageDescription);
  if (newPassword && newPassword.length >= 8) {
    updateAdminPassword(newPassword);
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
