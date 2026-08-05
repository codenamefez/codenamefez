#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT_DIR/api"
TF_DIR="$ROOT_DIR/terraform"

echo "Building Lambda..."
cd "$API_DIR"
npm ci
npm run build

echo "Deploying infrastructure with Terraform..."
cd "$TF_DIR"
terraform init
terraform apply "$@"

echo "Infrastructure deployed."
echo ""
echo "Next steps:"
echo "  1. Note the api_url and cloudfront_url from terraform output"
echo "  2. Update terraform.tfvars cors_allow_origin to your CloudFront URL and re-apply"
echo "  3. Deploy the web app:"
echo "     VITE_API_URL=<api_url> WEBSITE_BUCKET=<bucket> CLOUDFRONT_DISTRIBUTION_ID=<id> ./scripts/deploy-web.sh"
