#!/usr/bin/env bash

set -Eeuo pipefail

error_handler() {
  local exit_code=$?
  local line_no=$1
  local command=$2
  echo "Error in ${BASH_SOURCE[1]:-$0} at line ${line_no}: '${command}' exited with status ${exit_code}" >&2
}

trap 'error_handler ${LINENO} "${BASH_COMMAND}"' ERR

sudo chown -R "$(id -u):$(id -g)" /commandhistory
chmod 700 /commandhistory
touch /commandhistory/.bash_history
chmod 600 /commandhistory/.bash_history
