variable "bucket_name" {
  type      = string
  sensitive = false
}

variable "database_name" {
  type      = string
  sensitive = false
}

# Sensitive vars

variable "cloudflare_account_id" {
  type      = string
  sensitive = true
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "zero_trust_email" {
  type      = string
  sensitive = true
}
