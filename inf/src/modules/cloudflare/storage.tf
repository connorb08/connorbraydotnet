resource "cloudflare_r2_bucket" "bucket" {
  account_id = var.cloudflare_account_id
  name       = var.bucket_name
}

resource "cloudflare_d1_database" "database" {
  account_id            = var.cloudflare_account_id
  name                  = var.database_name
  primary_location_hint = "enam"
}
