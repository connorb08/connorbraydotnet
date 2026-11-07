#!/bin/sh

NODE_VERSION="${NODE_VERSION:-26.13.0}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr"

# Download package
case "$(arch)" in
  x86_64) NODE_ARCH="x64" ;;
  arm64|aarch64) NODE_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
NODE_PACKAGE="node-v${NODE_VERSION}-linux-${NODE_ARCH}"
curl --fail --silent --show-error --location --output /tmp/node.tar.xz "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_PACKAGE}.tar.xz"

# Extract package contents
tar --extract --xz --file /tmp/node.tar.xz --directory "${INSTALL_PREFIX}/usr" --strip-components 1
chown -R root:root "${INSTALL_PREFIX}/usr"
chmod +x "${INSTALL_PREFIX}/usr/bin/node"

# Configure shell integration
"${INSTALL_PREFIX}/usr/bin/node" "${INSTALL_PREFIX}/usr/lib/node_modules/npm/bin/npm-cli.js" completion > "${INSTALL_PREFIX}/etc/bash.bashrc.d/npm.sh"

# Cleanup
rm /tmp/node.tar.xz