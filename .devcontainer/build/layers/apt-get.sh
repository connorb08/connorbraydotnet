#!/usr/bin/env bash

set -e

# Get Microsoft package signing key and repository for .NET SDK
wget https://packages.microsoft.com/config/debian/13/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

apt-get update && apt-get install -y \
    xdg-utils \
    xauth \
    dotnet-sdk-10.0 \
    && apt-get -y upgrade \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

dotnet --version
