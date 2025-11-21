#/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
BASHRC_PATH="$PARENT_DIR/.bashrc"
echo "source $BASHRC_PATH" >> ~/.bashrc

export ROOT=$(pwd $(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")"))
export DATABASE_DIR=$ROOT/services/database
echo "DATABASE_DIR=$DATABASE_DIR" >> $GITHUB_ENV
echo "ROOT=$ROOT" >> $GITHUB_ENV