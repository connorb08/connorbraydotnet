#!/usr/bin/env bash

# docker run -d --rm \
#     --mount "type=volume,source=dev-workspace,target=/workspace" \
#     --mount "type=volume,source=dev-config,target=/config" \
#     --mount "type=volume,source=dev-cache,target=/cache" \
#     --name devenv \
#     devenv:v2

docker run -d --rm \
    --mount "type=volume,source=dev-workspace,target=/workspace" \
    --mount "type=volume,source=dev-config,target=/config" \
    --mount "type=volume,source=dev-cache,target=/cache" \
    -e MISE_CONFIG_DIR="" \
    -e MISE_SYSTEM_CONFIG_DIR="/etc/mise" \
    -e XDG_CONFIG_HOME="/config" \
    -e XDG_CACHE_HOME="/cache" \
    -e TERM=xterm-256color \
    --hostname devenv \
    --name devenv \
    devenv:v2

docker exec -it devenv bash
