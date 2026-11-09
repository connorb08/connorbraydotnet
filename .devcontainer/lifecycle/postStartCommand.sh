#!/usr/bin/env bash

set -euo pipefail

source .devcontainer/.env

: "${VAULT_ENDPOINT:?Set VAULT_ENDPOINT to the upstream Vault server URL}"
: "${VAULT_ROLE_ID:?Set VAULT_ROLE_ID for proxy AppRole authentication}"
: "${VAULT_SECRET_ID:?Set VAULT_SECRET_ID for proxy AppRole authentication}"

rm -f /tmp/vault_*
echo -n "$VAULT_ROLE_ID" > /tmp/vault_role_id
echo -n "$VAULT_SECRET_ID" > /tmp/vault_secret_id
chmod 600 /tmp/vault_*
tmux new-session -d -s vault-proxy -e "VAULT_ADDR=$VAULT_ENDPOINT" 'exec vault proxy -config=inf/Vault/proxy-config.hcl'

unset VAULT_ROLE_ID
unset VAULT_SECRET_ID
