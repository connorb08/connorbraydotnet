#!/usr/bin/env bash

set -euo pipefail

umask 077

workspace="${WORKSPACE_PATH:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)}"
config="$workspace/.devcontainer/proxy-config.hcl"
runtime_dir="${XDG_RUNTIME_DIR:-$HOME/.local/state}/vault-proxy"

for command in vault tmux curl; do
  command -v "$command" > /dev/null || {
    printf 'Vault Proxy requires %s.\n' "$command" >&2
    exit 1
  }
done
vault_bin="$(command -v vault)"

proxy_ready() {
  curl --fail --silent --max-time 2 --output /dev/null \
    http://127.0.0.1:8100/v1/auth/token/lookup-self
}

if tmux has-session -t '=vault-proxy' 2>/dev/null; then
  if proxy_ready; then
    printf 'Vault Proxy is already authenticated on 127.0.0.1:8100.\n'
    exit 0
  fi
  printf 'Existing Vault Proxy is not authenticated; inspect %s/proxy.log.\n' "$runtime_dir" >&2
  exit 1
fi

if [[ -f "$workspace/.devcontainer/.env" ]]; then
  {
    read -r VAULT_UPSTREAM_ADDR
    read -r VAULT_ROLE_ID
    read -r VAULT_SECRET_ID
    read -r VAULT_CACERT
  } < <(
    unset VAULT_ADDR
    source "$workspace/.devcontainer/.env"
    printf '%s\n' "${VAULT_UPSTREAM_ADDR:-${VAULT_ADDR:-}}" \
      "${VAULT_ROLE_ID:-}" "${VAULT_SECRET_ID:-}" "${VAULT_CACERT:-}"
  )
fi

: "${VAULT_UPSTREAM_ADDR:?Set VAULT_UPSTREAM_ADDR to the upstream Vault HTTPS URL}"
: "${VAULT_ROLE_ID:?Set VAULT_ROLE_ID for proxy AppRole authentication}"
: "${VAULT_SECRET_ID:?Set VAULT_SECRET_ID for proxy AppRole authentication}"

if [[ "$VAULT_UPSTREAM_ADDR" != https://* ]]; then
  printf 'Vault Proxy requires an HTTPS upstream, not the local HTTP proxy address.\n' >&2
  exit 1
fi
if [[ ! -f "$config" ]]; then
  printf 'Vault Proxy configuration is missing: %s\n' "$config" >&2
  exit 1
fi
if [[ -L "$runtime_dir" ]]; then
  printf 'Vault Proxy runtime directory must not be a symlink.\n' >&2
  exit 1
fi
mkdir -p -- "$runtime_dir"
if [[ ! -O "$runtime_dir" ]]; then
  printf 'Vault Proxy runtime directory must be owned by the current user.\n' >&2
  exit 1
fi
chmod 700 -- "$runtime_dir"
rm -f -- "$runtime_dir/role-id" "$runtime_dir/secret-id"
printf '%s' "$VAULT_ROLE_ID" > "$runtime_dir/role-id"
printf '%s' "$VAULT_SECRET_ID" > "$runtime_dir/secret-id"
rm -f -- "$runtime_dir/proxy.log"
: > "$runtime_dir/proxy.log"
unset VAULT_ROLE_ID VAULT_SECRET_ID VAULT_TOKEN

if ! tmux new-session -d -s vault-proxy -c "$runtime_dir" \
  -e "VAULT_ADDR=$VAULT_UPSTREAM_ADDR" \
  -e "VAULT_CACERT=${VAULT_CACERT:-}" \
  -e "VAULT_SKIP_VERIFY=false" \
  -e "VAULT_PROXY_BIN=$vault_bin" \
  -e "VAULT_PROXY_CONFIG=$config" \
  'proxy_pid=
   stopping=false
   stop_proxy() {
     trap "" HUP INT TERM
     stopping=true
     if [ -n "$proxy_pid" ] && kill -0 "$proxy_pid" 2>/dev/null; then
       kill -TERM "$proxy_pid"
     fi
   }
   trap stop_proxy HUP INT TERM
   "$VAULT_PROXY_BIN" proxy -config="$VAULT_PROXY_CONFIG" -log-level=info > proxy.log 2>&1 &
   proxy_pid=$!
   if [ "$stopping" = true ]; then
     stop_proxy
   fi
   status=0
   wait "$proxy_pid" || status=$?
   if [ "$stopping" = true ]; then
     wait "$proxy_pid" || status=$?
   fi
   exit "$status"'; then
  printf 'Failed to launch Vault Proxy in tmux.\n' >&2
  exit 1
fi

for attempt in {1..30}; do
  if ! tmux has-session -t '=vault-proxy' 2>/dev/null; then
    printf 'Vault Proxy exited before authenticating; inspect %s/proxy.log.\n' "$runtime_dir" >&2
    exit 1
  fi
  if proxy_ready; then
    printf 'Vault Proxy authenticated on 127.0.0.1:8100.\n'
    exit 0
  fi
  sleep 1
done

printf 'Vault Proxy did not authenticate within 30 attempts; inspect %s/proxy.log.\n' "$runtime_dir" >&2
exit 1
