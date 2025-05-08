#!/usr/bin/env bash

set -eax
sudo -iu $USERNAME bash -c '$HOME/.bun/bin/bunx playwright install --with-deps'