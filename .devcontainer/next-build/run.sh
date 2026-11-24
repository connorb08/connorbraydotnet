#!/usr/bin/env bash

docker run -d --rm \
    --mount "type=volume,source=dev-workspace,target=/workspace" \
    --mount "type=volume,source=dev-config,target=/config" \
    --mount "type=volume,source=dev-cache,target=/cache" \
    --name devenv \
    devenv:latest

docker exec -it devenv bash
