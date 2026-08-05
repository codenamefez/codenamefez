/**
 * Seed DynamoDB tables with sample data.
 * Run after first deploy: npm run seed
 *
 * Requires AWS credentials and TABLE env vars (or defaults).
 */
import "./load-env.js";
import { seedDatabase } from "../src/db/seed.js";

const password = process.argv[2] || process.env.ADMIN_PASSWORD || "changeme";

seedDatabase(password)
  .then(() => {
    console.log("Database seeded successfully.");
    console.log(`Admin password: ${password}`);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
