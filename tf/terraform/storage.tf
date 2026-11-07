resource "cloudflare_r2_bucket" "primary-bucket" {
  account_id = var.cloudflare-account-id
  name       = local.primary-bucket-name
}

resource "cloudflare_r2_bucket" "preview-bucket" {
  account_id = var.cloudflare-account-id
  name       = local.preview-bucket-name
}
