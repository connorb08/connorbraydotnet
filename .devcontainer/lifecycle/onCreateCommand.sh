#!/usr/bin/env bash

set -e

sudo chown -R "$(id -u):$(id -g)" /commandhistory
chmod 700 /commandhistory
touch /commandhistory/.bash_history
chmod 600 /commandhistory/.bash_history

pre-commit install
