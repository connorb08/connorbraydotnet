#!/bin/sh
set -eu

socket=/var/run/docker.sock

if [ ! -S "$socket" ]; then
  echo "Docker host socket is missing at $socket. Mount the host's Docker socket before starting the container." >&2
  exit 1
fi

if ! runuser -u "$DEVCONTAINER_USER" -- test -r "$socket" ||
   ! runuser -u "$DEVCONTAINER_USER" -- test -w "$socket"; then
  socket_gid=$(stat -c '%g' "$socket")
  if ! getent group "$socket_gid" >/dev/null; then
    groupadd --gid "$socket_gid" "docker-host-$socket_gid"
  fi
  usermod --append --groups "$socket_gid" "$DEVCONTAINER_USER"
fi

if ! runuser -u "$DEVCONTAINER_USER" -- test -r "$socket" ||
   ! runuser -u "$DEVCONTAINER_USER" -- test -w "$socket"; then
  echo "User $DEVCONTAINER_USER cannot access $socket. Check the host socket's owner and group permissions." >&2
  exit 1
fi

exec runuser -u "$DEVCONTAINER_USER" -- "$@"
