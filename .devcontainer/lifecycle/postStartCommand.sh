#!/usr/bin/env bash

set -e

source .devcontainer/.env

rm -f /tmp/vault_*
echo -n "$VAULT_ROLE_ID" > /tmp/vault_role_id
echo -n "$VAULT_SECRET_ID" > /tmp/vault_secret_id
chmod 600 /tmp/vault_*
tmux new-session -d -s vault-proxy 'vault proxy -config=.devcontainer/proxy-config.hcl'

unset VAULT_ROLE_ID
unset VAULT_SECRET_ID
