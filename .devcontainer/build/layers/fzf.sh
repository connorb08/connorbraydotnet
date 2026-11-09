#!/bin/sh

FZF_VERSION="${FZF_VERSION:-0.75.0}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"
WORK_DIR="$(mktemp -d)"
trap 'rm -r -- "$WORK_DIR"' EXIT

# Download package
case "$(arch)" in
  x86_64) FZF_ARCH="amd64" ;;
  arm64|aarch64) FZF_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output "${WORK_DIR}/fzf.tar.gz" "https://github.com/junegunn/fzf/releases/download/v${FZF_VERSION}/fzf-${FZF_VERSION}-linux_${FZF_ARCH}.tar.gz"

# Extract package contents
tar --extract --gunzip --file "${WORK_DIR}/fzf.tar.gz" --directory "${INSTALL_PREFIX}/usr/bin" fzf
chown root:root "${INSTALL_PREFIX}/usr/bin/fzf"
chmod +x "${INSTALL_PREFIX}/usr/bin/fzf"

# Configure shell integration
"${INSTALL_PREFIX}/usr/bin/fzf" --bash > "${INSTALL_PREFIX}/etc/bash.bashrc.d/fzf.sh"
