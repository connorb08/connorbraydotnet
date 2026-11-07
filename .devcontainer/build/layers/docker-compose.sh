#!/bin/sh

DOCKER_COMPOSE_VERSION="${DOCKER_COMPOSE_VERSION:-5.7.0}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/usr/libexec/docker/cli-plugins"

# Download binary
case "$(arch)" in
  x86_64) DOCKER_COMPOSE_ARCH="x86_64" ;;
  arm|arm64|aarch64) DOCKER_COMPOSE_ARCH="aarch64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output "${INSTALL_PREFIX}/usr/libexec/docker/cli-plugins/docker-compose" "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-linux-${DOCKER_COMPOSE_ARCH}"
chown root:root "${INSTALL_PREFIX}/usr/libexec/docker/cli-plugins/docker-compose"
chmod +x "${INSTALL_PREFIX}/usr/libexec/docker/cli-plugins/docker-compose"
