#!/bin/sh

DOCKER_BUILDX_VERSION="${DOCKER_BUILDX_VERSION:-0.38.2}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/usr/libexec/docker/cli-plugins"

# Download binary
case "$(arch)" in
  x86_64) DOCKER_BUILDX_ARCH="amd64" ;;
  arm|arm64|aarch64) DOCKER_BUILDX_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output "${INSTALL_PREFIX}/usr/libexec/docker/cli-plugins/docker-buildx" "https://github.com/docker/buildx/releases/download/v${DOCKER_BUILDX_VERSION}/buildx-v${DOCKER_BUILDX_VERSION}.linux-${DOCKER_BUILDX_ARCH}"
chown root:root "${INSTALL_PREFIX}/usr/libexec/docker/cli-plugins/docker-buildx"
chmod +x "${INSTALL_PREFIX}/usr/libexec/docker/cli-plugins/docker-buildx"
