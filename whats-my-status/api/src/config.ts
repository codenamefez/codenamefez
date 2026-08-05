const LOCAL_PREFIX = "whats-my-status-local";

function tableName(envVar: string | undefined, localName: string, prodName: string): string {
  if (envVar) return envVar;
  if (process.env.AWS_ENDPOINT_URL) return localName;
  return prodName;
}

export const config = {
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production-min-32-chars",
  tables: {
    products: tableName(
      process.env.PRODUCTS_TABLE,
      `${LOCAL_PREFIX}-products`,
      "whats-my-status-products"
    ),
    incidents: tableName(
      process.env.INCIDENTS_TABLE,
      `${LOCAL_PREFIX}-incidents`,
      "whats-my-status-incidents"
    ),
    incidentUpdates: tableName(
      process.env.INCIDENT_UPDATES_TABLE,
      `${LOCAL_PREFIX}-incident-updates`,
      "whats-my-status-incident-updates"
    ),
    incidentProducts: tableName(
      process.env.INCIDENT_PRODUCTS_TABLE,
      `${LOCAL_PREFIX}-incident-products`,
      "whats-my-status-incident-products"
    ),
    announcements: tableName(
      process.env.ANNOUNCEMENTS_TABLE,
      `${LOCAL_PREFIX}-announcements`,
      "whats-my-status-announcements"
    ),
    settings: tableName(
      process.env.SETTINGS_TABLE,
      `${LOCAL_PREFIX}-settings`,
      "whats-my-status-settings"
    ),
  },
};
