#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Stopping LocalStack..."
docker compose -f "$ROOT_DIR/docker-compose.yml" down

echo "LocalStack stopped."
