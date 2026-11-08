#!/bin/sh

HELM_VERSION="${HELM_VERSION:-4.3.1}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"
WORK_DIR="$(mktemp -d)"
trap 'rm -r -- "$WORK_DIR"' EXIT

# Download package
case "$(arch)" in
  x86_64) HELM_ARCH="amd64" ;;
  arm64|aarch64) HELM_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
HELM_PACKAGE="helm-v${HELM_VERSION}-linux-${HELM_ARCH}.tar.gz"
curl --fail --silent --show-error --location --output "${WORK_DIR}/${HELM_PACKAGE}" "https://get.helm.sh/${HELM_PACKAGE}"
curl --fail --silent --show-error --location --output "${WORK_DIR}/${HELM_PACKAGE}.sha256sum" "https://get.helm.sh/${HELM_PACKAGE}.sha256sum"
(cd "${WORK_DIR}" && sha256sum --check "${HELM_PACKAGE}.sha256sum")

# Extract package contents
tar --extract --gunzip --file "${WORK_DIR}/${HELM_PACKAGE}" --directory "${INSTALL_PREFIX}/usr/bin" --strip-components 1 "linux-${HELM_ARCH}/helm"
chown root:root "${INSTALL_PREFIX}/usr/bin/helm"
chmod +x "${INSTALL_PREFIX}/usr/bin/helm"

# Configure shell integration
"${INSTALL_PREFIX}/usr/bin/helm" completion bash > "${INSTALL_PREFIX}/etc/bash.bashrc.d/helm.sh"
"${INSTALL_PREFIX}/usr/bin/helm" version --short
