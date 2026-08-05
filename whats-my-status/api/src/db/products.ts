import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { config } from "../config.js";
import type { Product, ProductStatus } from "../types.js";
import { docClient, newId, now } from "./client.js";

export async function getAllProducts(): Promise<Product[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: config.tables.products })
  );
  const products = (result.Items as Product[]) || [];
  return products.sort(
    (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)
  );
}

export async function getProduct(id: string): Promise<Product | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: config.tables.products,
      Key: { id },
    })
  );
  return (result.Item as Product) ?? null;
}

export async function createProduct(data: {
  name: string;
  description?: string;
  status?: ProductStatus;
}): Promise<Product> {
  const products = await getAllProducts();
  const maxOrder = products.reduce(
    (max, p) => Math.max(max, p.display_order),
    -1
  );
  const timestamp = now();
  const product: Product = {
    id: newId(),
    name: data.name,
    description: data.description ?? null,
    status: data.status ?? "operational",
    status_message: null,
    display_order: maxOrder + 1,
    created_at: timestamp,
    updated_at: timestamp,
  };
  await docClient.send(
    new PutCommand({ TableName: config.tables.products, Item: product })
  );
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<
    Pick<Product, "name" | "description" | "status" | "status_message" | "display_order">
  >
): Promise<Product | null> {
  const existing = await getProduct(id);
  if (!existing) return null;
  const updated: Product = {
    ...existing,
    ...data,
    updated_at: now(),
  };
  await docClient.send(
    new PutCommand({ TableName: config.tables.products, Item: updated })
  );
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await docClient.send(
    new DeleteCommand({
      TableName: config.tables.products,
      Key: { id },
    })
  );
  return true;
}
