import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { config } from "../config.js";
import { docClient, newId, now } from "./client.js";
import { setSetting, getSetting } from "./settings.js";

const SEED_PRODUCTS = [
  {
    name: "Customer Portal",
    description: "Web application for customer account management",
  },
  {
    name: "API Services",
    description: "Core REST and GraphQL APIs",
  },
  {
    name: "Payment Processing",
    description: "Billing and payment gateway integration",
  },
  {
    name: "Email Notifications",
    description: "Transactional and marketing email delivery",
  },
];

export async function isDatabaseSeeded(): Promise<boolean> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: config.tables.products,
      Limit: 1,
    })
  );
  return (result.Count ?? 0) > 0;
}

export async function seedDatabase(
  adminPassword = process.env.ADMIN_PASSWORD || "changeme"
): Promise<void> {
  const alreadySeeded = await isDatabaseSeeded();
  if (alreadySeeded) return;

  const timestamp = now();
  for (let i = 0; i < SEED_PRODUCTS.length; i++) {
    const product = SEED_PRODUCTS[i];
    await docClient.send(
      new PutCommand({
        TableName: config.tables.products,
        Item: {
          id: newId(),
          name: product.name,
          description: product.description,
          status: "operational",
          status_message: null,
          display_order: i,
          created_at: timestamp,
          updated_at: timestamp,
        },
      })
    );
  }

  await setSetting("page_title", "Company Status");
  await setSetting(
    "page_description",
    "Current status of our products and services"
  );

  const existingHash = await getSetting("admin_password_hash");
  if (!existingHash) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await setSetting("admin_password_hash", hash);
  }
}
