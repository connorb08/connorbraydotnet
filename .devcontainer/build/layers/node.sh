#!/usr/bin/env bash

set -e

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

\. "$HOME/.nvm/nvm.sh"
nvm install $NODE_VERSION

node -v
npm -v
