resource "random_password" "jwt_secret" {
  length  = 48
  special = false
}

resource "aws_dynamodb_table" "products" {
  name         = local.table_names.products
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "incidents" {
  name         = local.table_names.incidents
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "incident_updates" {
  name         = local.table_names.incident_updates
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "incident_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  global_secondary_index {
    name            = "IncidentIndex"
    hash_key        = "incident_id"
    range_key       = "created_at"
    projection_type = "ALL"
  }
}

resource "aws_dynamodb_table" "incident_products" {
  name         = local.table_names.incident_products
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "incident_id"
  range_key    = "product_id"

  attribute {
    name = "incident_id"
    type = "S"
  }

  attribute {
    name = "product_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "announcements" {
  name         = local.table_names.announcements
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "settings" {
  name         = local.table_names.settings
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "key"

  attribute {
    name = "key"
    type = "S"
  }
}
