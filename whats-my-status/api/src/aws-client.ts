import { DynamoDBClient, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

/**
 * Creates a DynamoDB client configured for AWS or LocalStack.
 *
 * LocalStack: set AWS_ENDPOINT_URL=http://localhost:4566
 * Credentials default to "test"/"test" when using a custom endpoint.
 */
export function createDynamoDBClient(): DynamoDBClient {
  const endpoint = process.env.AWS_ENDPOINT_URL;

  const config: DynamoDBClientConfig = {
    region: process.env.AWS_REGION || "eu-west-2",
  };

  if (endpoint) {
    config.endpoint = endpoint;
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
    };
  }

  return new DynamoDBClient(config);
}

export function isLocalStack(): boolean {
  return Boolean(process.env.AWS_ENDPOINT_URL);
}
