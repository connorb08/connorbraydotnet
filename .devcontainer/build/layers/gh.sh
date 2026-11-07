#!/bin/sh

GH_VERSION="${GH_VERSION:-2.103.3}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"

# Download package
case "$(arch)" in
  x86_64) GH_ARCH="amd64" ;;
  arm|arm64|aarch64) GH_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output /tmp/gh.tar.gz "https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_linux_${GH_ARCH}.tar.gz"

# Extract package contents
tar --extract --gunzip --file /tmp/gh.tar.gz --directory "${INSTALL_PREFIX}/usr/bin" --strip-components 2 "gh_${GH_VERSION}_linux_${GH_ARCH}/bin/gh"
chown root:root "${INSTALL_PREFIX}/usr/bin/gh"
chmod +x "${INSTALL_PREFIX}/usr/bin/gh"

# Configure shell integration
"${INSTALL_PREFIX}/usr/bin/gh" completion --shell bash > "${INSTALL_PREFIX}/etc/bash.bashrc.d/gh.sh"

# Cleanup
rm /tmp/gh.tar.gz
