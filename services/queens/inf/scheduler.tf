resource "aws_scheduler_schedule" "queens_scheduler" {
  name = "queens-scheduler"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression = "cron(0 10 * * ? *)"

  target {
    arn      = aws_lambda_function.queens_function.arn
    role_arn = aws_iam_role.queens_scheduler_execution.arn
  }
}

resource "aws_lambda_permission" "allow_scheduler_to_invoke_lambda" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.queens_function.function_name
  principal     = "scheduler.amazonaws.com"
  source_arn    = aws_scheduler_schedule.queens_scheduler.arn
}
