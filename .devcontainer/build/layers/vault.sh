#!/bin/sh

VAULT_VERSION="${VAULT_VERSION:-2.2.1}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"
WORK_DIR="$(mktemp -d)"
trap 'rm -r -- "$WORK_DIR"' EXIT

# Download package
case "$(arch)" in
  x86_64) VAULT_ARCH="amd64" ;;
  arm64|aarch64) VAULT_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output "${WORK_DIR}/vault.zip" "https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_${VAULT_ARCH}.zip"

# Extract package contents
unzip -q "${WORK_DIR}/vault.zip" vault -d "${INSTALL_PREFIX}/usr/bin"
chown root:root "${INSTALL_PREFIX}/usr/bin/vault"
chmod +x "${INSTALL_PREFIX}/usr/bin/vault"

# Configure shell integration
cat <<'EOF' > "${INSTALL_PREFIX}/etc/bash.bashrc.d/vault.sh"
complete -C /usr/bin/vault vault
EOF
