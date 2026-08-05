locals {
  name_prefix = "${var.project_name}-${var.environment}"

  table_names = {
    products          = "${local.name_prefix}-products"
    incidents         = "${local.name_prefix}-incidents"
    incident_updates  = "${local.name_prefix}-incident-updates"
    incident_products = "${local.name_prefix}-incident-products"
    announcements     = "${local.name_prefix}-announcements"
    settings          = "${local.name_prefix}-settings"
  }
}
