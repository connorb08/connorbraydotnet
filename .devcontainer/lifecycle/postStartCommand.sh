#!/usr/bin/env bash

set -euo pipefail

# *00 everything
umask 077

# Load env vars
if [[ -f .devcontainer/.env ]]; then
  {
    read -r VAULT_ADDR
    read -r VAULT_ROLE_ID
    read -r VAULT_SECRET_ID
  } < <(
    source .devcontainer/.env
    printf '%s\n' "${VAULT_ADDR:-}" "${VAULT_ROLE_ID:-}" "${VAULT_SECRET_ID:-}"
  )
fi

: "${VAULT_ADDR:?Set VAULT_ADDR to the upstream Vault server URL}"
: "${VAULT_ROLE_ID:?Set VAULT_ROLE_ID for proxy AppRole authentication}"
: "${VAULT_SECRET_ID:?Set VAULT_SECRET_ID for proxy AppRole authentication}"

# 2. Write credentials securely and immediately scrub them
rm -f /tmp/vault_role_id /tmp/vault_secret_id
printf '%s' "$VAULT_ROLE_ID" > /tmp/vault_role_id
printf '%s' "$VAULT_SECRET_ID" > /tmp/vault_secret_id
unset VAULT_ROLE_ID VAULT_SECRET_ID

tmux new-session -d -s vault-proxy -e "VAULT_ADDR=$VAULT_ADDR" 'exec vault proxy -config=inf/Vault/proxy-config.hcl'
