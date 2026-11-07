#!/bin/sh

DOTNET_VERSION="${DOTNET_VERSION:-11.0.100-rc.3.26522.148}"

PLATFORM="${PLATFORM:-linux}" # linux, osx, windows

case "$(arch)" in
    x86_64) ARCH="x64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *)
        echo "Unsupported architecture: $(arch)" 1>&2
        exit 1
        ;;
esac

URL="https://builds.dotnet.microsoft.com/dotnet/Sdk/${DOTNET_VERSION}/dotnet-sdk-${DOTNET_VERSION}-${PLATFORM}-${ARCH}.tar.gz"

mkdir -p "${INSTALL_PREFIX}/opt/dotnet"
mkdir -p "${INSTALL_PREFIX}/etc/bash.bashrc.d"

curl --fail --silent --show-error --location --output /tmp/dotnet.tar.gz "$URL"
tar -xzf /tmp/dotnet.tar.gz -C "${INSTALL_PREFIX}/opt/dotnet"

"${INSTALL_PREFIX}/opt/dotnet/dotnet" completions script bash > "${INSTALL_PREFIX}/etc/bash.bashrc.d/dotnet.sh"

cat <<'EOF' >> "${INSTALL_PREFIX}/etc/bash.bashrc.d/dotnet.sh"

export DOTNET_ROOT=/opt/dotnet

EOF

rm /tmp/dotnet.tar.gz
