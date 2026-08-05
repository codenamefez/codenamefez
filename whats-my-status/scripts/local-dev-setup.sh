#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT_DIR/api"

# Start LocalStack and wait for it
"$ROOT_DIR/scripts/localstack-up.sh"

# Ensure .env.local exists
if [ ! -f "$API_DIR/.env.local" ]; then
  echo "Creating api/.env.local from example..."
  cp "$API_DIR/.env.local.example" "$API_DIR/.env.local"
fi

echo ""
echo "Initialising DynamoDB tables..."
cd "$API_DIR"
npm run localstack:init

echo ""
echo "Seeding sample data..."
npm run seed

echo ""
echo "========================================="
echo " LocalStack environment is ready!"
echo "========================================="
echo ""
echo "Start the API dev server:"
echo "  cd api && npm run dev"
echo ""
echo "Start the web app (in another terminal):"
echo "  cd web && npm run dev"
echo ""
echo "Run smoke tests (with API running):"
echo "  cd api && npm run test:smoke"
echo ""
echo "Stop LocalStack when done:"
echo "  ./scripts/localstack-down.sh"
echo ""
