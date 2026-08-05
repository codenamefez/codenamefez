#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$ROOT_DIR/web"
DIST_DIR="$WEB_DIR/dist"

if [ -z "${VITE_API_URL:-}" ]; then
  echo "Error: VITE_API_URL must be set (your API Gateway URL)"
  exit 1
fi

if [ -z "${WEBSITE_BUCKET:-}" ]; then
  echo "Error: WEBSITE_BUCKET must be set (from terraform output website_bucket_name)"
  exit 1
fi

echo "Building web app with API URL: $VITE_API_URL"
cd "$WEB_DIR"
npm ci
VITE_API_URL="$VITE_API_URL" npm run build

echo "Uploading to s3://$WEBSITE_BUCKET"
aws s3 sync "$DIST_DIR" "s3://$WEBSITE_BUCKET" --delete

if [ -n "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]; then
  echo "Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*"
fi

echo "Deploy complete."
