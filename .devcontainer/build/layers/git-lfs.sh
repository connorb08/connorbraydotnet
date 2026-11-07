#!/bin/sh

GIT_LFS_VERSION="${GIT_LFS_VERSION:-3.8.1}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc"
mkdir -p "${INSTALL_PREFIX}/usr/bin"

# Download package
case "$(arch)" in
  x86_64) GIT_LFS_ARCH="amd64" ;;
  arm|arm64|aarch64) GIT_LFS_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
curl --fail --silent --show-error --location --output /tmp/git-lfs.tar.gz "https://github.com/git-lfs/git-lfs/releases/download/v${GIT_LFS_VERSION}/git-lfs-linux-${GIT_LFS_ARCH}-v${GIT_LFS_VERSION}.tar.gz"

# Extract package contents
tar -xzf /tmp/git-lfs.tar.gz --directory "${INSTALL_PREFIX}/usr/bin" --strip-components 1 "git-lfs-${GIT_LFS_VERSION}/git-lfs"
chown root:root "${INSTALL_PREFIX}/usr/bin/git-lfs"
chmod +x "${INSTALL_PREFIX}/usr/bin/git-lfs"

# Configure system
PATH="${INSTALL_PREFIX}/usr/bin:${PATH}" GIT_CONFIG_SYSTEM="${INSTALL_PREFIX}/etc/gitconfig" git lfs install --system

# Cleanup
rm /tmp/git-lfs.tar.gz
