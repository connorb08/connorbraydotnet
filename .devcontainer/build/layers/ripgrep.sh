#!/bin/sh

RIPGREP_VERSION="${RIPGREP_VERSION:-15.2.0}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"

# Download package
case "$(arch)" in
  x86_64) RIPGREP_PACKAGE="ripgrep-${RIPGREP_VERSION}-x86_64-unknown-linux-musl" ;;
  arm|arm64|aarch64) RIPGREP_PACKAGE="ripgrep-${RIPGREP_VERSION}-aarch64-unknown-linux-gnu" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output /tmp/ripgrep.tar.gz "https://github.com/BurntSushi/ripgrep/releases/download/${RIPGREP_VERSION}/${RIPGREP_PACKAGE}.tar.gz"

# Extract package contents
tar --extract --gunzip --file /tmp/ripgrep.tar.gz --directory "${INSTALL_PREFIX}/usr/bin" --strip-components 1 "${RIPGREP_PACKAGE}/rg"
chown root:root "${INSTALL_PREFIX}/usr/bin/rg"
chmod +x "${INSTALL_PREFIX}/usr/bin/rg"
tar --extract --gunzip --file /tmp/ripgrep.tar.gz --directory "${INSTALL_PREFIX}/etc/bash.bashrc.d" --strip-components 2 "${RIPGREP_PACKAGE}/complete/rg.bash"
chown root:root "${INSTALL_PREFIX}/etc/bash.bashrc.d/rg.bash"

# Cleanup
rm /tmp/ripgrep.tar.gz
