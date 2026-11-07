#!/bin/sh

FD_VERSION="${FD_VERSION:-10.5.1}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"

# Download package
case "$(arch)" in
  x86_64) FD_PACKAGE="fd-v${FD_VERSION}-i686-unknown-linux-musl" ;;
  arm|arm64|aarch64) FD_PACKAGE="fd-v${FD_VERSION}-aarch64-unknown-linux-gnu" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output /tmp/fd.tar.gz "https://github.com/sharkdp/fd/releases/download/v${FD_VERSION}/${FD_PACKAGE}.tar.gz"

# Extract package contents
tar --extract --gunzip --file /tmp/fd.tar.gz --directory "${INSTALL_PREFIX}/usr/bin" --strip-components 1 "${FD_PACKAGE}/fd"
chown root:root "${INSTALL_PREFIX}/usr/bin/fd"
chmod +x "${INSTALL_PREFIX}/usr/bin/fd"

# Configure shell integration
"${INSTALL_PREFIX}/usr/bin/fd" --gen-completions bash > "${INSTALL_PREFIX}/etc/bash.bashrc.d/fd.sh"

# Cleanup
rm /tmp/fd.tar.gz
