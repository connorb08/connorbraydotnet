vault {
  address = "${VAULT_ENDPOINT}"
}

auto_auth {
  method "approle" {
    mount_point = "approle"
    config = {
        role_id_file_path   = "/tmp/vault_role_id"
        secret_id_file_path = "/tmp/vault_secret_id"
        remove_secret_id_file_after_reading = true
    }
  }
}

listener "tcp" {
  address     = "127.0.0.1:8100"
  tls_disable = true
}

api_proxy {
  use_auto_auth_token = "force"
  enforce_consistency = "always"
}

cache {
  use_auto_auth_token = true
}
