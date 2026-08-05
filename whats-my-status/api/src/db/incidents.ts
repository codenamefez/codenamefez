import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { config } from "../config.js";
import type {
  Incident,
  IncidentImpact,
  IncidentStatus,
  IncidentUpdate,
  IncidentWithDetails,
  Product,
  ProductStatus,
  StatusPageData,
} from "../types.js";
import { getActiveAnnouncements } from "./announcements.js";
import { docClient, newId, now } from "./client.js";
import { getAllProducts, getProduct } from "./products.js";
import { getPublicSettings } from "./settings.js";

async function getIncidentProductIds(incidentId: string): Promise<string[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: config.tables.incidentProducts,
      KeyConditionExpression: "incident_id = :id",
      ExpressionAttributeValues: { ":id": incidentId },
    })
  );
  return (result.Items || []).map((item) => item.product_id as string);
}

async function getIncidentUpdates(incidentId: string): Promise<IncidentUpdate[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: config.tables.incidentUpdates,
      IndexName: "IncidentIndex",
      KeyConditionExpression: "incident_id = :id",
      ExpressionAttributeValues: { ":id": incidentId },
      ScanIndexForward: false,
    })
  );
  return (result.Items as IncidentUpdate[]) || [];
}

async function enrichIncident(incident: Incident): Promise<IncidentWithDetails> {
  const [productIds, updates] = await Promise.all([
    getIncidentProductIds(incident.id),
    getIncidentUpdates(incident.id),
  ]);
  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => productIds.includes(p.id));
  return { ...incident, products, updates };
}

export async function getAllIncidents(): Promise<Incident[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: config.tables.incidents })
  );
  return (result.Items as Incident[]) || [];
}

export async function getActiveIncidents(): Promise<IncidentWithDetails[]> {
  const incidents = await getAllIncidents();
  const active = incidents
    .filter((i) => i.status !== "resolved")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  return Promise.all(active.map(enrichIncident));
}

export async function getResolvedIncidents(
  limit = 10
): Promise<IncidentWithDetails[]> {
  const incidents = await getAllIncidents();
  const resolved = incidents
    .filter((i) => i.status === "resolved")
    .sort((a, b) => {
      const aTime = a.resolved_at || a.updated_at;
      const bTime = b.resolved_at || b.updated_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })
    .slice(0, limit);
  return Promise.all(resolved.map(enrichIncident));
}

export async function getIncident(id: string): Promise<IncidentWithDetails | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: config.tables.incidents,
      Key: { id },
    })
  );
  if (!result.Item) return null;
  return enrichIncident(result.Item as Incident);
}

export async function createIncident(data: {
  title: string;
  message: string;
  status?: IncidentStatus;
  impact?: IncidentImpact;
  productIds?: string[];
}): Promise<IncidentWithDetails> {
  const id = newId();
  const timestamp = now();
  const status = data.status ?? "investigating";
  const impact = data.impact ?? "minor";

  const incident: Incident = {
    id,
    title: data.title,
    status,
    impact,
    created_at: timestamp,
    resolved_at: null,
    updated_at: timestamp,
  };

  await docClient.send(
    new PutCommand({ TableName: config.tables.incidents, Item: incident })
  );

  const update: IncidentUpdate = {
    id: newId(),
    incident_id: id,
    message: data.message,
    status,
    created_at: timestamp,
  };

  await docClient.send(
    new PutCommand({ TableName: config.tables.incidentUpdates, Item: update })
  );

  if (data.productIds?.length) {
    await Promise.all(
      data.productIds.map((productId) =>
        docClient.send(
          new PutCommand({
            TableName: config.tables.incidentProducts,
            Item: { incident_id: id, product_id: productId },
          })
        )
      )
    );
  }

  return (await getIncident(id))!;
}

export async function addIncidentUpdate(data: {
  incidentId: string;
  message: string;
  status: IncidentStatus;
}): Promise<IncidentWithDetails | null> {
  const incident = await getIncident(data.incidentId);
  if (!incident) return null;

  const timestamp = now();
  const update: IncidentUpdate = {
    id: newId(),
    incident_id: data.incidentId,
    message: data.message,
    status: data.status,
    created_at: timestamp,
  };

  await docClient.send(
    new PutCommand({ TableName: config.tables.incidentUpdates, Item: update })
  );

  const resolvedAt = data.status === "resolved" ? timestamp : incident.resolved_at;
  await docClient.send(
    new PutCommand({
      TableName: config.tables.incidents,
      Item: {
        id: incident.id,
        title: incident.title,
        status: data.status,
        impact: incident.impact,
        created_at: incident.created_at,
        resolved_at: resolvedAt,
        updated_at: timestamp,
      },
    })
  );

  return getIncident(data.incidentId);
}

export async function deleteIncident(id: string): Promise<boolean> {
  const [updates, productLinks] = await Promise.all([
    getIncidentUpdates(id),
    getIncidentProductIds(id),
  ]);

  await docClient.send(
    new DeleteCommand({ TableName: config.tables.incidents, Key: { id } })
  );

  for (const update of updates) {
    await docClient.send(
      new DeleteCommand({
        TableName: config.tables.incidentUpdates,
        Key: { id: update.id },
      })
    );
  }

  for (const productId of productLinks) {
    await docClient.send(
      new DeleteCommand({
        TableName: config.tables.incidentProducts,
        Key: { incident_id: id, product_id: productId },
      })
    );
  }

  return true;
}

function getOverallStatus(products: Product[]): ProductStatus {
  if (products.length === 0) return "operational";
  const priority: ProductStatus[] = [
    "major_outage",
    "partial_outage",
    "degraded",
    "maintenance",
    "operational",
  ];
  for (const status of priority) {
    if (products.some((p) => p.status === status)) return status;
  }
  return "operational";
}

export async function getStatusPageData(): Promise<StatusPageData> {
  const [products, activeIncidents, resolvedIncidents, announcements, settings] =
    await Promise.all([
      getAllProducts(),
      getActiveIncidents(),
      getResolvedIncidents(),
      getActiveAnnouncements(),
      getPublicSettings(),
    ]);

  return {
    products,
    activeIncidents,
    resolvedIncidents,
    announcements,
    overallStatus: getOverallStatus(products),
    pageTitle: settings.pageTitle,
    pageDescription: settings.pageDescription,
  };
}
