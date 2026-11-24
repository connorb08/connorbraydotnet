#!/usr/bin/env bash

set -euo pipefail

export READ_CACHE=true
export WRITE_CACHE=false

docker buildx bake base
docker buildx bake all

# Write to cache
export WRITE_CACHE=true
docker buildx bake base final --set '*.output=type=cacheonly'
