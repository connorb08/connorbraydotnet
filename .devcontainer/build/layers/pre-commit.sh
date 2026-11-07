#!/bin/sh

PRE_COMMIT_VERSION="${PRE_COMMIT_VERSION:-4.7.0}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/usr/bin"

# Download package
curl --fail --silent --show-error --location --output "${INSTALL_PREFIX}/usr/bin/pre-commit" "https://github.com/pre-commit/pre-commit/releases/download/v${PRE_COMMIT_VERSION}/pre-commit-${PRE_COMMIT_VERSION}.pyz"
chown root:root "${INSTALL_PREFIX}/usr/bin/pre-commit"
chmod +x "${INSTALL_PREFIX}/usr/bin/pre-commit"
