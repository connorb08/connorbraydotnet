auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
        role_id_file_path   = "role-id"
        secret_id_file_path = "secret-id"
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

cache {}
