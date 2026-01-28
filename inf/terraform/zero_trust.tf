resource "cloudflare_zero_trust_access_policy" "allow-me" {
  name       = "Allow Me"
  account_id = var.cloudflare-account-id
  decision   = "allow"
  include = [{
    email = {
      email = var.zero-trust-email
    }
  }]
}

resource "cloudflare_zero_trust_access_application" "main_preview" {
  name                        = "Site Preview"
  domain                      = "preview.connorbray.net"
  type                        = "self_hosted"
  account_id                  = var.cloudflare-account-id
  allow_authenticate_via_warp = true
  policies = [{
    id = cloudflare_zero_trust_access_policy.allow-me.id
  }]
}
