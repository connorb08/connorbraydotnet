terraform {
  required_version = "~> 1.11.4"

  backend "s3" {
    region                      = "auto"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
    use_path_style              = true
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
    }
    bitwarden-secrets = {
      source = "registry.terraform.io/bitwarden/bitwarden-secrets"
    }
  }
}
