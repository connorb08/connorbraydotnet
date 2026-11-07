#!/bin/sh

RUST_VERSION="${RUST_VERSION:-1.99.1}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"
mkdir -p "${INSTALL_PREFIX}/usr/bin"
WORK_DIR="$(mktemp -d)"
trap 'rm -r -- "$WORK_DIR"' EXIT

# Download package
case "$(arch)" in
  x86_64) RUST_TARGET="x86_64-unknown-linux-gnu" ;;
  arm64|aarch64) RUST_TARGET="aarch64-unknown-linux-gnu" ;;
  *)
    echo "Unsupported architecture: $(arch)" 1>&2
    exit 1
    ;;
esac
RUST_PACKAGE="rust-${RUST_VERSION}-${RUST_TARGET}"
curl --fail --silent --show-error --location --output "${WORK_DIR}/rust.tar.xz" "https://static.rust-lang.org/dist/${RUST_PACKAGE}.tar.xz"

# Extract package contents
tar --extract --xz --file "${WORK_DIR}/rust.tar.xz" --directory "$WORK_DIR"
"${WORK_DIR}/${RUST_PACKAGE}/install.sh" --destdir="$INSTALL_PREFIX" --prefix=/opt/rust --disable-ldconfig --components="rustc,cargo,rust-std-${RUST_TARGET},rustfmt-preview,clippy-preview"
chown -R root:root "${INSTALL_PREFIX}/opt/rust"

# Use final-image paths rather than the staging prefix.
for TOOL in rustc rustdoc cargo rustfmt cargo-fmt clippy-driver cargo-clippy; do
  ln -s "../../opt/rust/bin/${TOOL}" "${INSTALL_PREFIX}/usr/bin/${TOOL}"
done

# Configure shell integration
mv "${INSTALL_PREFIX}/opt/rust/etc/bash_completion.d/cargo" "${INSTALL_PREFIX}/etc/bash.bashrc.d/cargo.sh"
