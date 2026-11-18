#!/bin/sh

VP_VERSION="${VP_VERSION:-1.7.0}"

mkdir -p "${INSTALL_PREFIX}/usr/bin" "${INSTALL_PREFIX}/opt"
WORK_DIR="$(mktemp -d)"
trap 'rm -r -- "$WORK_DIR"' EXIT

case "$(arch)" in
  x86_64) VP_ARCH="x64" ;;
  arm64|aarch64) VP_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
VP_PACKAGE="vite-plus-cli-linux-${VP_ARCH}-gnu"
curl --fail --silent --show-error --location --output "${WORK_DIR}/vite-plus.tgz" "https://registry.npmjs.org/@voidzero-dev/${VP_PACKAGE}/-/${VP_PACKAGE}-${VP_VERSION}.tgz"

tar --extract --gzip --file "${WORK_DIR}/vite-plus.tgz" --directory "${WORK_DIR}" package/vp
chmod +x "${WORK_DIR}/package/vp"
VP_HOME="${WORK_DIR}/vite-plus" VP_NODE_MANAGER=no VP_PM_MANAGER=no "${WORK_DIR}/package/vp" --version

# Copy the initialized distribution, not the bootstrap binary or managed runtimes.
mv "${WORK_DIR}/vite-plus/${VP_VERSION}" "${INSTALL_PREFIX}/opt/vite-plus"
ln -s /opt/vite-plus/bin/vp "${INSTALL_PREFIX}/usr/bin/vp"
