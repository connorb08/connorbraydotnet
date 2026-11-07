#!/bin/sh

BWS_VERSION="${BWS_VERSION:-2.1.0}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/usr/bin"
WORK_DIR="$(mktemp -d)"
trap 'rm -r -- "$WORK_DIR"' EXIT

# Download package
case "$(arch)" in
  x86_64) BWS_ARCH="x86_64" ;;
  arm64|aarch64) BWS_ARCH="aarch64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output "${WORK_DIR}/bws.zip" "https://github.com/bitwarden/sdk-sm/releases/download/bws-v${BWS_VERSION}/bws-${BWS_ARCH}-unknown-linux-gnu-${BWS_VERSION}.zip"

# Extract package contents
unzip -q "${WORK_DIR}/bws.zip" bws -d "${INSTALL_PREFIX}/usr/bin"
chown root:root "${INSTALL_PREFIX}/usr/bin/bws"
chmod +x "${INSTALL_PREFIX}/usr/bin/bws"
