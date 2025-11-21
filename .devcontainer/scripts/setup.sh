#/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
BASHRC_PATH="$PARENT_DIR/.bashrc"
echo "source $BASHRC_PATH" >> ~/.bashrc
