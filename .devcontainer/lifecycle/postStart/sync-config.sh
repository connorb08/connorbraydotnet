#!/usr/bin/env bash
set -euo pipefail

DEFAULTS_DIR="/usr/local/share/devenv/config-defaults"

if [[ -d "$DEFAULTS_DIR" ]]; then
  cp -rn "$DEFAULTS_DIR"/. /config/
fi
