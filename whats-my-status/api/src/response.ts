import type { APIGatewayProxyResultV2 } from "aws-lambda";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

export function json(
  statusCode: number,
  body: unknown,
  extraHeaders: Record<string, string> = {}
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

export function noContent(): APIGatewayProxyResultV2 {
  return {
    statusCode: 204,
    headers: corsHeaders,
  };
}

export function options(): APIGatewayProxyResultV2 {
  return {
    statusCode: 204,
    headers: corsHeaders,
  };
}

export function error(statusCode: number, message: string): APIGatewayProxyResultV2 {
  return json(statusCode, { error: message });
}
