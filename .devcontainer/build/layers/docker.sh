#!/bin/sh

DOCKER_VERSION="${DOCKER_VERSION:-29.9.3}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"

# Download package
case "$(arch)" in
  x86_64) DOCKER_ARCH="x86_64" ;;
  arm|arm64|aarch64) DOCKER_ARCH="aarch64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output /tmp/docker.tgz "https://download.docker.com/linux/static/stable/${DOCKER_ARCH}/docker-${DOCKER_VERSION}.tgz"

# Extract package contents
tar -xzf /tmp/docker.tgz -C "${INSTALL_PREFIX}/usr/bin" --strip-components 1 "docker/docker"
chown root:root "${INSTALL_PREFIX}/usr/bin/docker"
chmod +x "${INSTALL_PREFIX}/usr/bin/docker"

# Configure shell integration
"${INSTALL_PREFIX}/usr/bin/docker" completion bash > "${INSTALL_PREFIX}/etc/bash.bashrc.d/docker.sh"

# Cleanup
rm /tmp/docker.tgz
