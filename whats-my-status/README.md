# What's My Status

Internal status page for tracking product and service health. Built for non-technical teams to post updates, report incidents, and publish announcements.

**Architecture:** Static React site (S3 + CloudFront) · Lambda API · DynamoDB · Terraform

## Repository structure

```
whats-my-status/
├── api/          # Lambda API (Node.js 20)
├── web/          # Static React SPA (Vite)
├── terraform/    # AWS infrastructure
└── scripts/      # Deploy helpers
```

## Prerequisites

- Node.js 20+
- AWS CLI configured with appropriate credentials
- Terraform 1.5+

## Local development

### 1. Start the API locally

The API uses DynamoDB in AWS even during local dev. Either:

- Point AWS credentials at a dev AWS account and deploy terraform first, or
- Use [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) (set `AWS_ENDPOINT_URL`)

```bash
cd api
npm install
npm run dev
# API runs at http://localhost:3001
```

### 2. Start the web app

```bash
cd web
npm install
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:3001
npm run dev
# Web runs at http://localhost:5173
```

Default admin password: `changeme` (set via `ADMIN_PASSWORD` env var on Lambda, or terraform variable)

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
