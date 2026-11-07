#!/bin/sh

PULUMI_VERSION="${PULUMI_VERSION:-3.274.1}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"
WORK_DIR="$(mktemp -d)"
trap 'rm -r -- "$WORK_DIR"' EXIT

# Download package
case "$(arch)" in
  x86_64) PULUMI_ARCH="x64" ;;
  arm64|aarch64) PULUMI_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output "${WORK_DIR}/pulumi.tar.gz" "https://github.com/pulumi/pulumi/releases/download/v${PULUMI_VERSION}/pulumi-v${PULUMI_VERSION}-linux-${PULUMI_ARCH}.tar.gz"

# Extract package contents
tar --extract --gunzip --file "${WORK_DIR}/pulumi.tar.gz" --directory "${INSTALL_PREFIX}/usr/bin" --strip-components 1
chown root:root "${INSTALL_PREFIX}"/usr/bin/pulumi*
chmod +x "${INSTALL_PREFIX}"/usr/bin/pulumi*

# Configure shell integration
"${INSTALL_PREFIX}/usr/bin/pulumi" completion bash > "${INSTALL_PREFIX}/etc/bash.bashrc.d/pulumi.sh"
