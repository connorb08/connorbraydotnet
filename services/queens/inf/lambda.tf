resource "aws_lambda_function" "queens_function" {

  function_name = "queens"
  role          = aws_iam_role.queens_lambda_execution.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.queens_repo.repository_url}:latest"

  memory_size   = 4096
  timeout       = 120
  architectures = ["arm64"]
  handler       = "Lambda::Lambda.Function::FunctionHandler"

  environment {
    variables = {
      CLOUDFLARE__DATABASEID = var.cloudflare_database_id
      CLOUDFLARE__APITOKEN   = var.cloudflare_api_token
      CLOUDFLARE__ACCOUNTID  = var.cloudflare_account_id
      DOTNET_ENVIRONMENT     = var.dotnet_env
    }
  }

}
