#!/usr/bin/env bash

set -euo pipefail

DOCKER_SOCK_GID=$(stat -c '%g' /var/run/docker.sock 2>/dev/null || stat -f '%g' /var/run/docker.sock)

container_id="$(docker run -d --rm \
    --mount "type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock" \
    --mount "type=volume,source=dev-workspace,target=/workspace" \
    --mount "type=volume,source=dev-config,target=/config" \
    --mount "type=volume,source=dev-cache,target=/cache" \
    --group-add "$DOCKER_SOCK_GID" \
    -e TERM=xterm-256color \
    --hostname devenv \
    --name devenv \
    devenv:latest)"

trap 'docker stop "$container_id"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

docker exec -it devenv sh -lc 'exec "$(getent passwd $(id -un) | cut -d: -f7)" -l'
# docker exec -it devenv bash -l
# docker exec -it devenv sh -lc 'exec bash -l -c "exec $SHELL -l"'

# docker exec -it devenv sh -lc 'exec "$SHELL" -l'
# su - dev
# docker exec -it devenv su -p - dev
# docker exec -it "$container_id" /bin/login -f dev
# docker exec -it "$container_id" su - dev
