#!/bin/sh

KUBECTL_VERSION="${KUBECTL_VERSION:-1.37.2}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"
WORK_DIR="$(mktemp -d)"
trap 'rm -r -- "$WORK_DIR"' EXIT

# Download package
case "$(arch)" in
  x86_64) KUBECTL_ARCH="amd64" ;;
  arm64|aarch64) KUBECTL_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
KUBECTL_URL="https://dl.k8s.io/release/v${KUBECTL_VERSION}/bin/linux/${KUBECTL_ARCH}/kubectl"
curl --fail --silent --show-error --location --output "${WORK_DIR}/kubectl" "${KUBECTL_URL}"
curl --fail --silent --show-error --location --output "${WORK_DIR}/kubectl.sha256" "${KUBECTL_URL}.sha256"
printf '%s  %s\n' "$(cat "${WORK_DIR}/kubectl.sha256")" "${WORK_DIR}/kubectl" | sha256sum --check

# Install binary
install -m 0755 "${WORK_DIR}/kubectl" "${INSTALL_PREFIX}/usr/bin/kubectl"

# Configure shell integration
"${INSTALL_PREFIX}/usr/bin/kubectl" completion bash > "${INSTALL_PREFIX}/etc/bash.bashrc.d/kubectl.sh"
"${INSTALL_PREFIX}/usr/bin/kubectl" version --client
