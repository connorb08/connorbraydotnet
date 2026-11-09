#!/bin/sh

OCI_CLI_VERSION="${OCI_CLI_VERSION:-3.96.0}"

# Arrange output directories
mkdir -p "${INSTALL_PREFIX}/usr/bin"
mkdir -p "${INSTALL_PREFIX}/opt"

# Install isolated Python dependencies
python3 -m venv "${INSTALL_PREFIX}/opt/oci-cli"
"${INSTALL_PREFIX}/opt/oci-cli/bin/python" -m pip install --no-cache-dir \
  "oci-cli==${OCI_CLI_VERSION}"

# Use final image paths rather than the temporary build environment's shebang.
cat <<'EOF' > "${INSTALL_PREFIX}/usr/bin/oci"
#!/bin/sh
exec /opt/oci-cli/bin/python /opt/oci-cli/bin/oci "$@"
EOF
chmod +x "${INSTALL_PREFIX}/usr/bin/oci"
