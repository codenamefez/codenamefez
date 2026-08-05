#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting LocalStack..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d

echo "Waiting for LocalStack to be ready..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:4566/_localstack/health >/dev/null 2>&1; then
    if curl -s http://localhost:4566/_localstack/health | grep -qE '"dynamodb":\s*"(available|running)"'; then
      echo "LocalStack is ready."
      break
    fi
  fi
  if [ "$i" -eq 30 ]; then
    echo "Error: LocalStack did not become ready in time."
    exit 1
  fi
  sleep 2
done
