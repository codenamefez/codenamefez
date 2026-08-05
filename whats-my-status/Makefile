.PHONY: local-setup local-up local-down api-dev web-dev smoke test

local-up:
	./scripts/localstack-up.sh

local-down:
	./scripts/localstack-down.sh

local-setup:
	./scripts/local-dev-setup.sh

api-dev:
	cd api && npm run dev

web-dev:
	cd web && npm run dev

smoke:
	cd api && npm run test:smoke

test: smoke
