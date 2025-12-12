#!/usr/bin/env bash

set -eax
sudo -iu $USERNAME <<EOF
    curl -fsSL https://bun.sh/install | bash
EOF
