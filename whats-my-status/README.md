# What's My Status

Internal status page for tracking product and service health. Built for non-technical teams to post updates, report incidents, and publish announcements.

**Architecture:** Static React site (S3 + CloudFront) · Lambda API · DynamoDB · Terraform

## Repository structure

```
whats-my-status/
├── api/          # Lambda API (Node.js 20)
├── web/          # Static React SPA (Vite)
├── terraform/    # AWS infrastructure
├── scripts/      # Deploy and local dev helpers
└── docker-compose.yml  # LocalStack for local development
```

## Prerequisites

- Node.js 20+
- Docker (for LocalStack local development)
- AWS CLI configured with appropriate credentials (for production deploy)
- Terraform 1.5+

## Local development with LocalStack

LocalStack provides a local DynamoDB instance so you can develop and test without AWS credentials or costs.

### Quick start

```bash
# One-time setup: start LocalStack, create tables, seed data
./scripts/local-dev-setup.sh

# Terminal 1 — API dev server
cd api && npm run dev

# Terminal 2 — Web app
cd web && npm run dev
# Open http://localhost:5173 (admin password: changeme)
```

Or using Make:

```bash
make local-setup   # Start LocalStack + init + seed
make api-dev       # Start API on :3001
make web-dev       # Start web on :5173
make smoke         # Run smoke tests (API must be running)
```

### Manual LocalStack steps

```bash
# 1. Start LocalStack
./scripts/localstack-up.sh

# 2. Configure the API for LocalStack
cd api
cp .env.local.example .env.local

# 3. Create DynamoDB tables
npm run localstack:init

# 4. Seed sample data
npm run seed

# 5. Start dev servers
npm run dev          # API at http://localhost:3001
cd ../web && npm run dev   # Web at http://localhost:5173

# 6. Run smoke tests (with API running)
cd ../api && npm run test:smoke

# Stop LocalStack when done
./scripts/localstack-down.sh
```

### How it works

| Component | Local | Production |
|-----------|-------|------------|
| DynamoDB | LocalStack `:4566` | AWS DynamoDB |
| API | Node dev server `:3001` | Lambda + API Gateway |
| Web | Vite dev server `:5173` | S3 + CloudFront |

The API detects LocalStack via `AWS_ENDPOINT_URL=http://localhost:4566` in `api/.env.local`. Table names automatically use the `whats-my-status-local-*` prefix.

### Terraform against LocalStack (optional)

To test Terraform changes locally with [tflocal](https://github.com/localstack/terraform-local):

```bash
pip install terraform-local
./scripts/localstack-up.sh
cd terraform/localstack
tflocal init && tflocal apply
```

See [terraform/localstack/README.md](terraform/localstack/README.md) for details.

## Local development (without LocalStack)

If you prefer to use a real AWS dev account instead:

```bash
cd terraform && terraform apply   # creates DynamoDB tables in AWS
cd ../api && npm run dev        # omit AWS_ENDPOINT_URL from .env.local
```

## Deploy to AWS

### 1. Configure Terraform

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — change admin_password!
terraform init
```

### 2. Deploy infrastructure

```bash
./scripts/deploy-infra.sh
```

Or manually:

```bash
cd terraform
terraform apply
```

This creates:
- 6 DynamoDB tables (products, incidents, incident updates, incident products, announcements, settings)
- Lambda function with API Gateway HTTP API
- S3 bucket + CloudFront distribution for the static site

### 3. Deploy the web app

```bash
export VITE_API_URL=$(terraform -chdir=terraform output -raw api_url)
export WEBSITE_BUCKET=$(terraform -chdir=terraform output -raw website_bucket_name)
export CLOUDFRONT_DISTRIBUTION_ID=$(terraform -chdir=terraform output -raw cloudfront_distribution_id)

./scripts/deploy-web.sh
```

### 4. Lock down CORS (recommended)

After first deploy, update `cors_allow_origin` in `terraform.tfvars` to your CloudFront URL and re-apply:

```hcl
cors_allow_origin = "https://d1234abcd.cloudfront.net"
```

## What's stored in DynamoDB

| Table | Contents |
|-------|----------|
| **products** | Services tracked on the status page (name, status, message) |
| **incidents** | Reported outages (title, status, impact, timestamps) |
| **incident-updates** | Timeline entries for each incident |
| **incident-products** | Which products each incident affects |
| **announcements** | Company-wide banner messages |
| **settings** | Page title/description and admin password hash |

## Admin features

- **Dashboard** — Quick status updates for any product
- **Products** — Add, edit, remove services
- **Incidents** — Report issues with timeline updates
- **Announcements** — Post info, maintenance, or warning messages
- **Settings** — Page config and password change

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/status` | No | Full status page data |
| POST | `/auth/login` | No | Admin login → JWT |
| GET/POST/PUT/DELETE | `/products` | Admin | Product CRUD |
| PATCH | `/products/:id/status` | Admin | Quick status update |
| GET/POST | `/incidents` | Mixed | List / create incidents |
| POST | `/incidents/:id/updates` | Admin | Post incident update |
| GET/POST/PUT/DELETE | `/announcements` | Mixed | Announcement CRUD |
| GET/PUT | `/settings` | Mixed | Page settings |

## Moving to the whats-my-status repo

This project is designed to be the root contents of your private `whats-my-status` GitHub repo:

```bash
git clone git@github.com:codenamefez/whats-my-status.git
cd whats-my-status
# Copy or merge the whats-my-status/ directory contents to repo root
```

## License

Private — internal use only.
