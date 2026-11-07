#!/bin/sh

GITLEAKS_VERSION="${GITLEAKS_VERSION:-8.30.1}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"

# Download package
case "$(arch)" in
  x86_64) GITLEAKS_ARCH="x64" ;;
  arm64|aarch64) GITLEAKS_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output /tmp/gitleaks.tar.gz "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_${GITLEAKS_ARCH}.tar.gz"

# Extract package contents
tar --extract --gunzip --file /tmp/gitleaks.tar.gz --directory "${INSTALL_PREFIX}/usr/bin" gitleaks
chown root:root "${INSTALL_PREFIX}/usr/bin/gitleaks"
chmod +x "${INSTALL_PREFIX}/usr/bin/gitleaks"

# Configure shell integration
"${INSTALL_PREFIX}/usr/bin/gitleaks" completion bash > "${INSTALL_PREFIX}/etc/bash.bashrc.d/gitleaks.sh"

# Cleanup
rm /tmp/gitleaks.tar.gz