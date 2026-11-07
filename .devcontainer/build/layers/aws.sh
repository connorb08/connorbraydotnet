#!/bin/sh

AWS_VERSION="${AWS_VERSION:-2.39.6}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"
mkdir -p "${INSTALL_PREFIX}/opt"
WORK_DIR="$(mktemp -d)"
trap 'rm -r -- "$WORK_DIR"' EXIT

# Download package
case "$(arch)" in
  x86_64) AWS_ARCH="x86_64" ;;
  arm64|aarch64) AWS_ARCH="aarch64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output "${WORK_DIR}/aws.zip" "https://awscli.amazonaws.com/awscli-exe-linux-${AWS_ARCH}-${AWS_VERSION}.zip"

# Extract package contents
unzip -q "${WORK_DIR}/aws.zip" -d "$WORK_DIR"
mv "${WORK_DIR}/aws/dist" "${INSTALL_PREFIX}/opt/aws-cli"
chown -R root:root "${INSTALL_PREFIX}/opt/aws-cli"
chmod +x "${INSTALL_PREFIX}/opt/aws-cli/aws" "${INSTALL_PREFIX}/opt/aws-cli/aws_completer"
ln -s ../../opt/aws-cli/aws "${INSTALL_PREFIX}/usr/bin/aws"
ln -s ../../opt/aws-cli/aws_completer "${INSTALL_PREFIX}/usr/bin/aws_completer"

# Configure shell integration
cat <<'EOF' > "${INSTALL_PREFIX}/etc/bash.bashrc.d/aws.sh"
complete -C /usr/bin/aws_completer aws
EOF