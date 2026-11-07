#!/bin/sh

BUN_VERSION="${BUN_VERSION:-1.4.4}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"

# Download package
case "$(arch)" in
  x86_64) BUN_PACKAGE="bun-linux-x64" ;;
  arm64|aarch64) BUN_PACKAGE="bun-linux-aarch64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output /tmp/bun.zip "https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/${BUN_PACKAGE}.zip"

# Extract package contents
unzip -p /tmp/bun.zip "${BUN_PACKAGE}/bun" > "${INSTALL_PREFIX}/usr/bin/bun"
chown root:root "${INSTALL_PREFIX}/usr/bin/bun"
chmod +x "${INSTALL_PREFIX}/usr/bin/bun"
ln -s bun "${INSTALL_PREFIX}/usr/bin/bunx"

# Configure shell integration
curl --fail --silent --show-error --location --output "${INSTALL_PREFIX}/etc/bash.bashrc.d/bun.sh" "https://raw.githubusercontent.com/oven-sh/bun/bun-v${BUN_VERSION}/completions/bun.bash"

# Cleanup
rm /tmp/bun.zip