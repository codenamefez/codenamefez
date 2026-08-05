output "api_url" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.http.api_endpoint
}

output "cloudfront_url" {
  description = "CloudFront distribution URL for the static website"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation after deploys)"
  value       = aws_cloudfront_distribution.website.id
}

output "website_bucket_name" {
  description = "S3 bucket name for uploading the static site"
  value       = aws_s3_bucket.website.id
}

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value       = local.table_names
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}
