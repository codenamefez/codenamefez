export const config = {
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production-min-32-chars",
  jwtExpiresIn: "7d",
  tables: {
    products: process.env.PRODUCTS_TABLE || "whats-my-status-products",
    incidents: process.env.INCIDENTS_TABLE || "whats-my-status-incidents",
    incidentUpdates:
      process.env.INCIDENT_UPDATES_TABLE || "whats-my-status-incident-updates",
    incidentProducts:
      process.env.INCIDENT_PRODUCTS_TABLE || "whats-my-status-incident-products",
    announcements:
      process.env.ANNOUNCEMENTS_TABLE || "whats-my-status-announcements",
    settings: process.env.SETTINGS_TABLE || "whats-my-status-settings",
  },
};
