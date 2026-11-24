#!/usr/bin/env bash
set -euo pipefail

DOCKER_SOCK="/var/run/docker.sock"

if [[ ! -S "$DOCKER_SOCK" ]]; then
  echo "Docker socket not found at $DOCKER_SOCK, skipping setup."
  exit 0
fi

# Try POSIX ACL first (native Linux); fall back to chmod 666 (Docker Desktop macOS/Windows)
if ! sudo setfacl -m "u:$(id -un):rw" "$DOCKER_SOCK" 2>/dev/null; then
  sudo chmod 666 "$DOCKER_SOCK"
fi

echo "Granted $(id -un) access to $DOCKER_SOCK."
