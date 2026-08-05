resource "null_resource" "build_api" {
  triggers = {
    source_hash = filemd5("${path.module}/../api/src/index.ts")
  }

  provisioner "local-exec" {
    command     = "npm ci && npm run build"
    working_dir = "${path.module}/../api"
  }
}

data "archive_file" "lambda" {
  depends_on  = [null_resource.build_api]
  type        = "zip"
  source_dir  = "${path.module}/../api/dist"
  output_path = "${path.module}/../api/dist/lambda.zip"

  excludes = ["lambda.zip"]
}

resource "aws_lambda_function" "api" {
  depends_on = [null_resource.build_api]

  function_name = "${local.name_prefix}-api"
  role          = aws_iam_role.lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = {
      PRODUCTS_TABLE          = aws_dynamodb_table.products.name
      INCIDENTS_TABLE         = aws_dynamodb_table.incidents.name
      INCIDENT_UPDATES_TABLE  = aws_dynamodb_table.incident_updates.name
      INCIDENT_PRODUCTS_TABLE = aws_dynamodb_table.incident_products.name
      ANNOUNCEMENTS_TABLE     = aws_dynamodb_table.announcements.name
      SETTINGS_TABLE          = aws_dynamodb_table.settings.name
      JWT_SECRET              = random_password.jwt_secret.result
      ADMIN_PASSWORD          = var.admin_password
      CORS_ORIGIN             = var.cors_allow_origin
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 14
}
