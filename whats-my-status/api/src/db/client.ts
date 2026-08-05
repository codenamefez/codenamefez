import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { createDynamoDBClient } from "../aws-client.js";

export const docClient = DynamoDBDocumentClient.from(createDynamoDBClient(), {
  marshallOptions: { removeUndefinedValues: true },
});

export function now(): string {
  return new Date().toISOString();
}

export function newId(): string {
  return crypto.randomUUID();
}
