/**
 * Local development server for the Lambda API.
 * Usage: npm run dev (from api/)
 */
import { createServer } from "node:http";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler } from "../src/index";

const PORT = Number(process.env.PORT || 3001);

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const bodyChunks: Buffer[] = [];

  for await (const chunk of req) {
    bodyChunks.push(chunk as Buffer);
  }

  const body = Buffer.concat(bodyChunks).toString() || undefined;

  const event: APIGatewayProxyEventV2 = {
    version: "2.0",
    routeKey: "$default",
    rawPath: url.pathname,
    rawQueryString: url.search.slice(1),
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, String(v)])
    ),
    queryStringParameters: Object.fromEntries(url.searchParams),
    requestContext: {
      accountId: "local",
      apiId: "local",
      domainName: "localhost",
      domainPrefix: "local",
      http: {
        method: req.method || "GET",
        path: url.pathname,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: req.headers["user-agent"] || "",
      },
      requestId: crypto.randomUUID(),
      routeKey: "$default",
      stage: "$default",
      time: new Date().toISOString(),
      timeEpoch: Date.now(),
    },
    isBase64Encoded: false,
    body,
  };

  try {
    const result = await handler(event);
    if (typeof result === "string") {
      res.end(result);
      return;
    }
    res.statusCode = result.statusCode || 200;
    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        if (typeof value === "string") res.setHeader(key, value);
      }
    }
    res.end(result.body || "");
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
});

server.listen(PORT, () => {
  console.log(`API dev server running at http://localhost:${PORT}`);
});
