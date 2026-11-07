#!/bin/sh

EZA_VERSION="${EZA_VERSION:-0.23.5}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"

# Download package
case "$(arch)" in
  x86_64) EZA_PACKAGE="eza_x86_64-unknown-linux-gnu" ;;
  arm|arm64|aarch64) EZA_PACKAGE="eza_aarch64-unknown-linux-gnu" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output /tmp/eza.tar.gz "https://github.com/eza-community/eza/releases/download/v${EZA_VERSION}/${EZA_PACKAGE}.tar.gz"

# Extract package contents
tar --extract --gunzip --file /tmp/eza.tar.gz --directory "${INSTALL_PREFIX}/usr/bin" "./eza"
chown root:root "${INSTALL_PREFIX}/usr/bin/eza"
chmod +x "${INSTALL_PREFIX}/usr/bin/eza"

# Configure shell integration
curl --fail --silent --show-error --location --output "${INSTALL_PREFIX}/etc/bash.bashrc.d/eza.sh" "https://raw.githubusercontent.com/eza-community/eza/v${EZA_VERSION}/completions/bash/eza"

# Cleanup
rm /tmp/eza.tar.gz
