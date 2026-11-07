storage "raft" {
  path    = "/vault/data"
  node_id = "vault-prod"
}

listener "tcp" {
  address     = "127.0.0.1:8200"
  tls_disable = 1
}

ui = true
disable_mlock = false
