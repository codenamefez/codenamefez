variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-west-2"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "whats-my-status"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "admin_password" {
  description = "Initial admin password (used to seed the database on first Lambda invocation)"
  type        = string
  sensitive   = true
  default     = "changeme"
}

variable "domain_name" {
  description = "Optional custom domain for CloudFront (leave empty to use CloudFront default domain)"
  type        = string
  default     = ""
}

variable "cors_allow_origin" {
  description = "CORS origin for the API (set to CloudFront URL after first deploy, or * for dev)"
  type        = string
  default     = "*"
}
