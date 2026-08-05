/**
 * Smoke test against a running API (local dev server or deployed).
 *
 * Usage: npm run test:smoke
 *        API_URL=http://localhost:3001 npm run test:smoke
 */
import "./load-env.js";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`Running smoke tests against ${API_URL}\n`);

  // Public status endpoint (also seeds on first call)
  const statusRes = await request("/status");
  assert(statusRes.ok, `GET /status failed: ${statusRes.status}`);
  const status = await statusRes.json();
  assert(Array.isArray(status.products), "Expected products array");
  console.log(`✓ GET /status (${status.products.length} products)`);

  // Admin login
  const loginRes = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || "changeme" }),
  });
  assert(loginRes.ok, `POST /auth/login failed: ${loginRes.status}`);
  const { token } = await loginRes.json();
  assert(typeof token === "string", "Expected JWT token");
  console.log("✓ POST /auth/login");

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Authenticated product list
  const productsRes = await request("/products", { headers: authHeaders });
  assert(productsRes.ok, `GET /products failed: ${productsRes.status}`);
  console.log("✓ GET /products (authenticated)");

  // Create and delete a test announcement
  const createRes = await request("/announcements", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Smoke test",
      message: "Automated test announcement",
      type: "info",
    }),
  });
  assert(createRes.ok, `POST /announcements failed: ${createRes.status}`);
  const announcement = await createRes.json();
  console.log("✓ POST /announcements");

  const deleteRes = await request(`/announcements/${announcement.id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  assert(deleteRes.status === 204, `DELETE /announcements failed: ${deleteRes.status}`);
  console.log("✓ DELETE /announcements");

  console.log("\nAll smoke tests passed.");
}

main().catch((err) => {
  console.error("\nSmoke test failed:", err.message);
  process.exit(1);
});
