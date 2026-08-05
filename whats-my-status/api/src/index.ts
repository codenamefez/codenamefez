import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { router } from "./router.js";
import { error } from "./response.js";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    return await router(event);
  } catch (err) {
    console.error("Unhandled error:", err);
    return error(500, "Internal server error");
  }
}
