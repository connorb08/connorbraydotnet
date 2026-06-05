resource "aws_ecr_repository" "queens_repo" {
  name                 = "queens"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
