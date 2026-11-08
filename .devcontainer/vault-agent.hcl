vault {
  address = "${VAULT_ENDPOINT}"
}

auto_auth {
  method "approle" {
    mount_point = "approle"
    config = {
        # role_id   = "${VAULT_ROLE_ID}" -- these are loaded automatically from environment
        # secret_id = "${VAULT_SECRET_ID}"
    }
  }
}

# Optional: Enable local caching proxy
cache {
  use_auto_auth_token = true
}

listener "tcp" {
  address     = "127.0.0.1:8100"
  tls_disable = true
}
