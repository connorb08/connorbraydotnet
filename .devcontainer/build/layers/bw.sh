#!/bin/sh

BW_VERSION="${BW_VERSION:-2026.10.1}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/usr/bin"
WORK_DIR="$(mktemp -d)"
trap 'rm -r -- "$WORK_DIR"' EXIT

# Download package
case "$(arch)" in
  x86_64) BW_PLATFORM="linux" ;;
  arm64|aarch64) BW_PLATFORM="linux-arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output "${WORK_DIR}/bw.zip" "https://github.com/bitwarden/clients/releases/download/cli-v${BW_VERSION}/bw-${BW_PLATFORM}-${BW_VERSION}.zip"

# Extract package contents
unzip -q "${WORK_DIR}/bw.zip" bw -d "${INSTALL_PREFIX}/usr/bin"
chown root:root "${INSTALL_PREFIX}/usr/bin/bw"
chmod +x "${INSTALL_PREFIX}/usr/bin/bw"
