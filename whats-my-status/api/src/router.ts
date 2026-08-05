import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { requireAuth, setPassword, signToken, verifyPassword } from "./auth.js";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
} from "./db/announcements.js";
import {
  addIncidentUpdate,
  createIncident,
  deleteIncident,
  getActiveIncidents,
  getAllIncidents,
  getIncident,
  getResolvedIncidents,
  getStatusPageData,
} from "./db/incidents.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "./db/products.js";
import { getPublicSettings, getSetting, setSetting } from "./db/settings.js";
import { seedDatabase } from "./db/seed.js";
import { error, json, noContent, options } from "./response.js";
import type {
  AnnouncementType,
  IncidentImpact,
  IncidentStatus,
  ProductStatus,
} from "./types.js";

type RouteHandler = (
  event: APIGatewayProxyEventV2,
  params: Record<string, string>
) => Promise<APIGatewayProxyResultV2>;

function parseBody<T>(event: APIGatewayProxyEventV2): T | null {
  if (!event.body) return null;
  try {
    return JSON.parse(
      event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString()
        : event.body
    ) as T;
  } catch {
    return null;
  }
}

function requireAdmin(event: APIGatewayProxyEventV2): boolean {
  return requireAuth(event.headers.authorization || event.headers.Authorization);
}

function matchRoute(method: string, path: string) {
  const routes: Array<{
    method: string;
    pattern: RegExp;
    handler: RouteHandler;
    admin?: boolean;
  }> = [
    {
      method: "GET",
      pattern: /^\/status$/,
      handler: async () => {
        await seedDatabase();
        const data = await getStatusPageData();
        return json(200, data);
      },
    },
    {
      method: "POST",
      pattern: /^\/auth\/login$/,
      handler: async (event) => {
        const body = parseBody<{ password: string }>(event);
        if (!body?.password) return error(400, "Password is required");
        await seedDatabase();
        const valid = await verifyPassword(body.password);
        if (!valid) return error(401, "Invalid password");
        return json(200, { token: signToken() });
      },
    },
    {
      method: "GET",
      pattern: /^\/products$/,
      handler: async () => json(200, await getAllProducts()),
      admin: true,
    },
    {
      method: "POST",
      pattern: /^\/products$/,
      handler: async (event) => {
        const body = parseBody<{
          name: string;
          description?: string;
          status?: ProductStatus;
        }>(event);
        if (!body?.name?.trim()) return error(400, "Name is required");
        const product = await createProduct({
          name: body.name.trim(),
          description: body.description?.trim(),
          status: body.status,
        });
        return json(201, product);
      },
      admin: true,
    },
    {
      method: "GET",
      pattern: /^\/products\/([^/]+)$/,
      handler: async (_event, params) => {
        const product = await getProduct(params.id);
        if (!product) return error(404, "Product not found");
        return json(200, product);
      },
      admin: true,
    },
    {
      method: "PUT",
      pattern: /^\/products\/([^/]+)$/,
      handler: async (event, params) => {
        const body = parseBody<{
          name?: string;
          description?: string | null;
          status?: ProductStatus;
          status_message?: string | null;
          display_order?: number;
        }>(event);
        if (!body) return error(400, "Invalid body");
        const product = await updateProduct(params.id, {
          ...body,
          name: body.name?.trim(),
          description:
            body.description !== undefined ? body.description : undefined,
          status_message:
            body.status_message !== undefined ? body.status_message : undefined,
        });
        if (!product) return error(404, "Product not found");
        return json(200, product);
      },
      admin: true,
    },
    {
      method: "PATCH",
      pattern: /^\/products\/([^/]+)\/status$/,
      handler: async (event, params) => {
        const body = parseBody<{
          status: ProductStatus;
          status_message?: string | null;
        }>(event);
        if (!body?.status) return error(400, "Status is required");
        const product = await updateProduct(params.id, {
          status: body.status,
          status_message: body.status_message ?? null,
        });
        if (!product) return error(404, "Product not found");
        return json(200, product);
      },
      admin: true,
    },
    {
      method: "DELETE",
      pattern: /^\/products\/([^/]+)$/,
      handler: async (_event, params) => {
        await deleteProduct(params.id);
        return noContent();
      },
      admin: true,
    },
    {
      method: "GET",
      pattern: /^\/incidents$/,
      handler: async (event) => {
        const scope = event.queryStringParameters?.scope;
        if (scope === "all") {
          const incidents = await getAllIncidents();
          return json(200, incidents);
        }
        const [active, resolved] = await Promise.all([
          getActiveIncidents(),
          getResolvedIncidents(20),
        ]);
        return json(200, { active, resolved });
      },
    },
    {
      method: "POST",
      pattern: /^\/incidents$/,
      handler: async (event) => {
        const body = parseBody<{
          title: string;
          message: string;
          status?: IncidentStatus;
          impact?: IncidentImpact;
          productIds?: string[];
        }>(event);
        if (!body?.title?.trim() || !body?.message?.trim()) {
          return error(400, "Title and message are required");
        }
        const incident = await createIncident({
          title: body.title.trim(),
          message: body.message.trim(),
          status: body.status,
          impact: body.impact,
          productIds: body.productIds,
        });
        return json(201, incident);
      },
      admin: true,
    },
    {
      method: "GET",
      pattern: /^\/incidents\/([^/]+)$/,
      handler: async (_event, params) => {
        const incident = await getIncident(params.id);
        if (!incident) return error(404, "Incident not found");
        return json(200, incident);
      },
    },
    {
      method: "POST",
      pattern: /^\/incidents\/([^/]+)\/updates$/,
      handler: async (event, params) => {
        const body = parseBody<{ message: string; status: IncidentStatus }>(
          event
        );
        if (!body?.message?.trim() || !body?.status) {
          return error(400, "Message and status are required");
        }
        const incident = await addIncidentUpdate({
          incidentId: params.id,
          message: body.message.trim(),
          status: body.status,
        });
        if (!incident) return error(404, "Incident not found");
        return json(200, incident);
      },
      admin: true,
    },
    {
      method: "DELETE",
      pattern: /^\/incidents\/([^/]+)$/,
      handler: async (_event, params) => {
        await deleteIncident(params.id);
        return noContent();
      },
      admin: true,
    },
    {
      method: "GET",
      pattern: /^\/announcements$/,
      handler: async (event) => {
        const all = event.queryStringParameters?.all === "1";
        const data = all
          ? await getAllAnnouncements()
          : await getAllAnnouncements().then((items) =>
              items.filter((a) => a.active)
            );
        return json(200, data);
      },
    },
    {
      method: "POST",
      pattern: /^\/announcements$/,
      handler: async (event) => {
        const body = parseBody<{
          title: string;
          message: string;
          type?: AnnouncementType;
        }>(event);
        if (!body?.title?.trim() || !body?.message?.trim()) {
          return error(400, "Title and message are required");
        }
        const announcement = await createAnnouncement({
          title: body.title.trim(),
          message: body.message.trim(),
          type: body.type,
        });
        return json(201, announcement);
      },
      admin: true,
    },
    {
      method: "PUT",
      pattern: /^\/announcements\/([^/]+)$/,
      handler: async (event, params) => {
        const body = parseBody<{
          title?: string;
          message?: string;
          type?: AnnouncementType;
          active?: boolean;
        }>(event);
        if (!body) return error(400, "Invalid body");
        const announcement = await updateAnnouncement(params.id, body);
        if (!announcement) return error(404, "Announcement not found");
        return json(200, announcement);
      },
      admin: true,
    },
    {
      method: "DELETE",
      pattern: /^\/announcements\/([^/]+)$/,
      handler: async (_event, params) => {
        await deleteAnnouncement(params.id);
        return noContent();
      },
      admin: true,
    },
    {
      method: "GET",
      pattern: /^\/settings$/,
      handler: async () => json(200, await getPublicSettings()),
    },
    {
      method: "PUT",
      pattern: /^\/settings$/,
      handler: async (event) => {
        const body = parseBody<{
          pageTitle?: string;
          pageDescription?: string;
          newPassword?: string;
        }>(event);
        if (!body) return error(400, "Invalid body");
        if (body.pageTitle) await setSetting("page_title", body.pageTitle);
        if (body.pageDescription)
          await setSetting("page_description", body.pageDescription);
        if (body.newPassword && body.newPassword.length >= 8) {
          await setPassword(body.newPassword);
        }
        return json(200, await getPublicSettings());
      },
      admin: true,
    },
  ];

  for (const route of routes) {
    if (route.method !== method) continue;
    const match = path.match(route.pattern);
    if (!match) continue;
    const params: Record<string, string> = {};
    if (match[1]) params.id = match[1];
    return { route, params };
  }
  return null;
}

export async function router(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;
  const path = event.rawPath.replace(/^\/prod|^\/dev|^\/staging/, "") || "/";

  if (method === "OPTIONS") return options();

  const matched = matchRoute(method, path);
  if (!matched) return error(404, "Not found");

  if (matched.route.admin && !requireAdmin(event)) {
    return error(401, "Unauthorized");
  }

  return matched.route.handler(event, matched.params);
}
