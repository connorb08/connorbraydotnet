# Allow your dev container to read secrets from your project path
path "secret/data/my-project/development/*" {
  capabilities = ["read"]
}

# Optional: Required if your application code or SDK needs to list paths
path "secret/metadata/my-project/development/*" {
  capabilities = ["list"]
}

# vault policy write my-app-dev-policy dev-policy.hcl
# vault write auth/approle/role/my-dev-workspace \
#     token_policies="my-app-dev-policy" \
#     token_ttl=1h \
#     token_max_ttl=4h
