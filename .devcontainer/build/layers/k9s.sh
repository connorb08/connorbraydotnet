#!/bin/sh

K9S_VERSION="${K9S_VERSION:-0.51.0}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"
WORK_DIR="$(mktemp -d)"
trap 'rm -r -- "$WORK_DIR"' EXIT

# Download package
case "$(arch)" in
  x86_64) K9S_ARCH="amd64" ;;
  arm64|aarch64) K9S_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
K9S_PACKAGE="k9s_Linux_${K9S_ARCH}.tar.gz"
K9S_URL="https://github.com/derailed/k9s/releases/download/v${K9S_VERSION}"
curl --fail --silent --show-error --location --output "${WORK_DIR}/${K9S_PACKAGE}" "${K9S_URL}/${K9S_PACKAGE}"
curl --fail --silent --show-error --location --output "${WORK_DIR}/checksums.sha256" "${K9S_URL}/checksums.sha256"
(cd "${WORK_DIR}" && awk -v package="${K9S_PACKAGE}" '$2 == package' checksums.sha256 | sha256sum --check)

# Extract package contents
tar --extract --gunzip --file "${WORK_DIR}/${K9S_PACKAGE}" --directory "${INSTALL_PREFIX}/usr/bin" k9s
chown root:root "${INSTALL_PREFIX}/usr/bin/k9s"
chmod +x "${INSTALL_PREFIX}/usr/bin/k9s"

# Configure shell integration
"${INSTALL_PREFIX}/usr/bin/k9s" completion bash > "${INSTALL_PREFIX}/etc/bash.bashrc.d/k9s.sh"
"${INSTALL_PREFIX}/usr/bin/k9s" version --short
