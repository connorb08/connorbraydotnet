#!/usr/bin/env bash

set -e

curl -fsSL https://bun.com/install | bash

export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

bun -v

chown -R $USERNAME:$USERNAME "$HOME/.bun"
