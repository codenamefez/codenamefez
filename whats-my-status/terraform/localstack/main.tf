# Deploy DynamoDB tables to LocalStack using tflocal
#
# Prerequisites:
#   - LocalStack running (./scripts/localstack-up.sh)
#   - tflocal installed: pip install terraform-local
#
# Usage:
#   cd terraform/localstack
#   tflocal init
#   tflocal apply

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  access_key                  = "test"
  secret_key                  = "test"
  region                      = "eu-west-2"
  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    dynamodb = "http://localhost:4566"
  }
}

locals {
  name_prefix = "whats-my-status-local"

  table_names = {
    products          = "${local.name_prefix}-products"
    incidents         = "${local.name_prefix}-incidents"
    incident_updates  = "${local.name_prefix}-incident-updates"
    incident_products = "${local.name_prefix}-incident-products"
    announcements     = "${local.name_prefix}-announcements"
    settings          = "${local.name_prefix}-settings"
  }
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

output "table_names" {
  value = local.table_names
}
