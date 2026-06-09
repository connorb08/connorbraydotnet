resource "cloudflare_zero_trust_access_policy" "allow_me" {
  name       = "Allow Me"
  account_id = var.cloudflare_account_id
  decision   = "allow"
  include = [{
    email = {
      email = var.zero_trust_email
    }
  }]
}

resource "cloudflare_zero_trust_access_application" "main_preview" {
  name                        = "Site Preview"
  domain                      = "preview.connorbray.net"
  type                        = "self_hosted"
  account_id                  = var.cloudflare_account_id
  allow_authenticate_via_warp = true
  policies = [{
    id = cloudflare_zero_trust_access_policy.allow_me.id
  }]
}
