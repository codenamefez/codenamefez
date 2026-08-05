/**
 * Create DynamoDB tables in AWS or LocalStack.
 * Idempotent — skips tables that already exist.
 *
 * Usage: npm run localstack:init
 * Requires AWS_ENDPOINT_URL=http://localhost:4566 for LocalStack
 */
import "./load-env.js";
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceInUseException,
} from "@aws-sdk/client-dynamodb";
import { createDynamoDBClient } from "../src/aws-client.js";
import { config } from "../src/config.js";

const client = createDynamoDBClient();

async function tableExists(name: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch {
    return false;
  }
}

async function createTable(params: CreateTableCommand["input"]): Promise<void> {
  const name = params.TableName!;
  if (await tableExists(name)) {
    console.log(`  ✓ ${name} (already exists)`);
    return;
  }

  try {
    await client.send(new CreateTableCommand(params));
    console.log(`  ✓ ${name} (created)`);
  } catch (err) {
    if (err instanceof ResourceInUseException) {
      console.log(`  ✓ ${name} (already exists)`);
      return;
    }
    throw err;
  }
}

async function main() {
  const endpoint = process.env.AWS_ENDPOINT_URL || "AWS (default)";
  console.log(`Initialising DynamoDB tables via ${endpoint}\n`);

  await createTable({
    TableName: config.tables.products,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  });

  await createTable({
    TableName: config.tables.incidents,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  });

  await createTable({
    TableName: config.tables.incidentUpdates,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "incident_id", AttributeType: "S" },
      { AttributeName: "created_at", AttributeType: "S" },
    ],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    GlobalSecondaryIndexes: [
      {
        IndexName: "IncidentIndex",
        KeySchema: [
          { AttributeName: "incident_id", KeyType: "HASH" },
          { AttributeName: "created_at", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  });

  await createTable({
    TableName: config.tables.incidentProducts,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "incident_id", AttributeType: "S" },
      { AttributeName: "product_id", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "incident_id", KeyType: "HASH" },
      { AttributeName: "product_id", KeyType: "RANGE" },
    ],
  });

  await createTable({
    TableName: config.tables.announcements,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  });

  await createTable({
    TableName: config.tables.settings,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [{ AttributeName: "key", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "key", KeyType: "HASH" }],
  });

  console.log("\nAll tables ready.");
}

main().catch((err) => {
  console.error("Failed to initialise tables:", err);
  process.exit(1);
});
