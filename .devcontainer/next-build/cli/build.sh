#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")"
mkdir -p bin "$HOME/.local/bin"

go build -o bin/ocie .

if [[ ! -x "$HOME/.local/bin/ocie" ]]; then
    ln -sf "$(pwd)/bin/ocie" "$HOME/.local/bin/ocie"
fi
