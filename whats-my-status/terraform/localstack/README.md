# LocalStack Terraform

Deploy DynamoDB tables to LocalStack for testing Terraform changes locally.

## Prerequisites

- [LocalStack](https://localstack.cloud/) running (`../../scripts/localstack-up.sh`)
- [tflocal](https://github.com/localstack/terraform-local): `pip install terraform-local`

## Usage

```bash
cd terraform/localstack
tflocal init
tflocal apply
```

Table names match the defaults used by the API when `AWS_ENDPOINT_URL` is set (`whats-my-status-local-*`).

## Alternative

The Node.js init script is simpler for day-to-day dev:

```bash
cd api
cp .env.local.example .env.local
npm run localstack:init
```
