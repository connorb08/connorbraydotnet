path "secret/dev/*" {
  capabilities = ["read"]
}

path "secret/metadata/dev/*" {
  capabilities = ["list"]
}

path "sys/policies/password" {
  capabilities = ["list"]
}

path "sys/policies/password/default" {
  capabilities = ["read"]
}

path "sys/policies/password/default/generate" {
  capabilities = ["read"]
}
