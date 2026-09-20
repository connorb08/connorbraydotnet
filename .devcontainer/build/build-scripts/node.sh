#!/usr/bin/env bash

set -eax
sudo -iu "$USERNAME" <<'EOF'
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    \. "$HOME/.nvm/nvm.sh"
    nvm install 26
    nvm use --default 26
    nvm alias default 26
EOF
