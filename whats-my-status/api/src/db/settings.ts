import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { config } from "../config.js";
import { docClient } from "./client.js";

export async function getSetting(key: string): Promise<string | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: config.tables.settings,
      Key: { key },
    })
  );
  return (result.Item?.value as string) ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: config.tables.settings,
      Item: { key, value },
    })
  );
}

export async function getPublicSettings(): Promise<{
  pageTitle: string;
  pageDescription: string;
}> {
  const [pageTitle, pageDescription] = await Promise.all([
    getSetting("page_title"),
    getSetting("page_description"),
  ]);
  return {
    pageTitle: pageTitle || "Company Status",
    pageDescription:
      pageDescription || "Current status of our products and services",
  };
}
