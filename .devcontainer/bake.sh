#!/usr/bin/env bash

set -euo pipefail

BUILD_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/build" && pwd)"
cd -- "$BUILD_DIR"

shopt -s nullglob
LAYER_SCRIPTS=(layers/*.sh)
if ((${#LAYER_SCRIPTS[@]} == 0)); then
  echo "No install layers found in ${BUILD_DIR}/layers" >&2
  exit 1
fi

LAYERS_JSON="["
for LAYER_SCRIPT in "${LAYER_SCRIPTS[@]}"; do
  LAYER="${LAYER_SCRIPT##*/}"
  LAYER="${LAYER%.sh}"
  if [[ ! "$LAYER" =~ ^[a-zA-Z0-9][a-zA-Z0-9_-]*$ ]]; then
    echo "Invalid install layer name: ${LAYER}" >&2
    exit 1
  fi
  LAYERS_JSON+="\"${LAYER}\","
done
export LAYERS_JSON="${LAYERS_JSON%,}]"

exec docker buildx bake --file docker-bake.hcl "$@"
