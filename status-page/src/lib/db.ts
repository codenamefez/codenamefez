import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import type {
  Announcement,
  Incident,
  IncidentUpdate,
  IncidentWithDetails,
  Product,
  StatusPageData,
} from "./types";
import { getOverallStatus } from "./status";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "status.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'operational',
      status_message TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'investigating',
      impact TEXT NOT NULL DEFAULT 'minor',
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incident_products (
      incident_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      PRIMARY KEY (incident_id, product_id),
      FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS incident_updates (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const productCount = database
    .prepare("SELECT COUNT(*) as count FROM products")
    .get() as { count: number };

  if (productCount.count === 0) {
    seedDatabase(database);
  }

  const adminPassword = database
    .prepare("SELECT value FROM settings WHERE key = 'admin_password_hash'")
    .get() as { value: string } | undefined;

  if (!adminPassword) {
    const defaultPassword = process.env.ADMIN_PASSWORD || "changeme";
    const hash = bcrypt.hashSync(defaultPassword, 10);
    database
      .prepare("INSERT INTO settings (key, value) VALUES (?, ?)")
      .run("admin_password_hash", hash);
  }
}

function seedDatabase(database: Database.Database) {
  const now = new Date().toISOString();
  const products = [
    {
      id: crypto.randomUUID(),
      name: "Customer Portal",
      description: "Web application for customer account management",
      status: "operational",
      display_order: 0,
    },
    {
      id: crypto.randomUUID(),
      name: "API Services",
      description: "Core REST and GraphQL APIs",
      status: "operational",
      display_order: 1,
    },
    {
      id: crypto.randomUUID(),
      name: "Payment Processing",
      description: "Billing and payment gateway integration",
      status: "operational",
      display_order: 2,
    },
    {
      id: crypto.randomUUID(),
      name: "Email Notifications",
      description: "Transactional and marketing email delivery",
      status: "operational",
      display_order: 3,
    },
  ];

  const insertProduct = database.prepare(`
    INSERT INTO products (id, name, description, status, display_order, created_at, updated_at)
    VALUES (@id, @name, @description, @status, @display_order, @created_at, @updated_at)
  `);

  for (const product of products) {
    insertProduct.run({ ...product, created_at: now, updated_at: now });
  }

  database
    .prepare("INSERT INTO settings (key, value) VALUES (?, ?)")
    .run("page_title", "Company Status");
  database
    .prepare("INSERT INTO settings (key, value) VALUES (?, ?)")
    .run("page_description", "Current status of our products and services");
}

function now(): string {
  return new Date().toISOString();
}

function getIncidentWithDetails(incident: Incident): IncidentWithDetails {
  const database = getDb();
  const products = database
    .prepare(
      `
      SELECT p.* FROM products p
      JOIN incident_products ip ON ip.product_id = p.id
      WHERE ip.incident_id = ?
      ORDER BY p.display_order ASC
    `
    )
    .all(incident.id) as Product[];

  const updates = database
    .prepare(
      `
      SELECT * FROM incident_updates
      WHERE incident_id = ?
      ORDER BY created_at DESC
    `
    )
    .all(incident.id) as IncidentUpdate[];

  return { ...incident, products, updates };
}

export function getSetting(key: string): string | null {
  const row = getDb()
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string) {
  getDb()
    .prepare(
      `
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `
    )
    .run(key, value);
}

export function verifyAdminPassword(password: string): boolean {
  const hash = getSetting("admin_password_hash");
  if (!hash) return false;
  return bcrypt.compareSync(password, hash);
}

export function updateAdminPassword(password: string) {
  const hash = bcrypt.hashSync(password, 10);
  setSetting("admin_password_hash", hash);
}

export function getAllProducts(): Product[] {
  return getDb()
    .prepare("SELECT * FROM products ORDER BY display_order ASC, name ASC")
    .all() as Product[];
}

export function getProduct(id: string): Product | null {
  return (
    (getDb().prepare("SELECT * FROM products WHERE id = ?").get(id) as Product) ??
    null
  );
}

export function createProduct(data: {
  name: string;
  description?: string;
  status?: Product["status"];
}): Product {
  const id = crypto.randomUUID();
  const timestamp = now();
  const displayOrder =
    (
      getDb()
        .prepare("SELECT COALESCE(MAX(display_order), -1) + 1 as next FROM products")
        .get() as { next: number }
    ).next ?? 0;

  getDb()
    .prepare(
      `
      INSERT INTO products (id, name, description, status, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    )
    .run(
      id,
      data.name,
      data.description ?? null,
      data.status ?? "operational",
      displayOrder,
      timestamp,
      timestamp
    );

  return getProduct(id)!;
}

export function updateProduct(
  id: string,
  data: Partial<Pick<Product, "name" | "description" | "status" | "status_message" | "display_order">>
): Product | null {
  const existing = getProduct(id);
  if (!existing) return null;

  getDb()
    .prepare(
      `
      UPDATE products
      SET name = ?, description = ?, status = ?, status_message = ?, display_order = ?, updated_at = ?
      WHERE id = ?
    `
    )
    .run(
      data.name ?? existing.name,
      data.description !== undefined ? data.description : existing.description,
      data.status ?? existing.status,
      data.status_message !== undefined ? data.status_message : existing.status_message,
      data.display_order ?? existing.display_order,
      now(),
      id
    );

  return getProduct(id);
}

export function deleteProduct(id: string): boolean {
  const result = getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getActiveIncidents(): IncidentWithDetails[] {
  const incidents = getDb()
    .prepare(
      `
      SELECT * FROM incidents
      WHERE status != 'resolved'
      ORDER BY created_at DESC
    `
    )
    .all() as Incident[];

  return incidents.map(getIncidentWithDetails);
}

export function getResolvedIncidents(limit = 10): IncidentWithDetails[] {
  const incidents = getDb()
    .prepare(
      `
      SELECT * FROM incidents
      WHERE status = 'resolved'
      ORDER BY resolved_at DESC
      LIMIT ?
    `
    )
    .all(limit) as Incident[];

  return incidents.map(getIncidentWithDetails);
}

export function getIncident(id: string): IncidentWithDetails | null {
  const incident = getDb()
    .prepare("SELECT * FROM incidents WHERE id = ?")
    .get(id) as Incident | undefined;
  if (!incident) return null;
  return getIncidentWithDetails(incident);
}

export function createIncident(data: {
  title: string;
  message: string;
  status?: Incident["status"];
  impact?: Incident["impact"];
  productIds?: string[];
}): IncidentWithDetails {
  const id = crypto.randomUUID();
  const timestamp = now();
  const status = data.status ?? "investigating";
  const impact = data.impact ?? "minor";

  getDb()
    .prepare(
      `
      INSERT INTO incidents (id, title, status, impact, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    )
    .run(id, data.title, status, impact, timestamp, timestamp);

  const updateId = crypto.randomUUID();
  getDb()
    .prepare(
      `
      INSERT INTO incident_updates (id, incident_id, message, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
    )
    .run(updateId, id, data.message, status, timestamp);

  if (data.productIds?.length) {
    const insertLink = getDb().prepare(
      "INSERT INTO incident_products (incident_id, product_id) VALUES (?, ?)"
    );
    for (const productId of data.productIds) {
      insertLink.run(id, productId);
    }
  }

  return getIncident(id)!;
}

export function addIncidentUpdate(data: {
  incidentId: string;
  message: string;
  status: Incident["status"];
}): IncidentWithDetails | null {
  const incident = getIncident(data.incidentId);
  if (!incident) return null;

  const timestamp = now();
  getDb()
    .prepare(
      `
      INSERT INTO incident_updates (id, incident_id, message, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
    )
    .run(crypto.randomUUID(), data.incidentId, data.message, data.status, timestamp);

  const resolvedAt = data.status === "resolved" ? timestamp : null;
  getDb()
    .prepare(
      `
      UPDATE incidents SET status = ?, updated_at = ?, resolved_at = COALESCE(?, resolved_at)
      WHERE id = ?
    `
    )
    .run(data.status, timestamp, resolvedAt, data.incidentId);

  return getIncident(data.incidentId);
}

export function deleteIncident(id: string): boolean {
  const result = getDb().prepare("DELETE FROM incidents WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getActiveAnnouncements(): Announcement[] {
  return getDb()
    .prepare(
      `
      SELECT * FROM announcements
      WHERE active = 1
      ORDER BY created_at DESC
    `
    )
    .all() as Announcement[];
}

export function getAllAnnouncements(): Announcement[] {
  return getDb()
    .prepare("SELECT * FROM announcements ORDER BY created_at DESC")
    .all() as Announcement[];
}

export function createAnnouncement(data: {
  title: string;
  message: string;
  type?: Announcement["type"];
}): Announcement {
  const id = crypto.randomUUID();
  const timestamp = now();

  getDb()
    .prepare(
      `
      INSERT INTO announcements (id, title, message, type, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `
    )
    .run(id, data.title, data.message, data.type ?? "info", timestamp, timestamp);

  return getDb()
    .prepare("SELECT * FROM announcements WHERE id = ?")
    .get(id) as Announcement;
}

export function updateAnnouncement(
  id: string,
  data: Partial<Pick<Announcement, "title" | "message" | "type" | "active">>
): Announcement | null {
  const existing = getDb()
    .prepare("SELECT * FROM announcements WHERE id = ?")
    .get(id) as Announcement | undefined;
  if (!existing) return null;

  getDb()
    .prepare(
      `
      UPDATE announcements
      SET title = ?, message = ?, type = ?, active = ?, updated_at = ?
      WHERE id = ?
    `
    )
    .run(
      data.title ?? existing.title,
      data.message ?? existing.message,
      data.type ?? existing.type,
      data.active ?? existing.active,
      now(),
      id
    );

  return getDb()
    .prepare("SELECT * FROM announcements WHERE id = ?")
    .get(id) as Announcement;
}

export function deleteAnnouncement(id: string): boolean {
  const result = getDb().prepare("DELETE FROM announcements WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getStatusPageData(): StatusPageData {
  const products = getAllProducts();
  const activeIncidents = getActiveIncidents();
  const resolvedIncidents = getResolvedIncidents();
  const announcements = getActiveAnnouncements();
  const overallStatus = getOverallStatus(products);

  return {
    products,
    activeIncidents,
    resolvedIncidents,
    announcements,
    overallStatus,
  };
}
