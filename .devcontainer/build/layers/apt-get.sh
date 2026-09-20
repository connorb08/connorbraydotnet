#!/usr/bin/env bash

set -e

# Get Microsoft package signing key and repository for .NET SDK
wget https://packages.microsoft.com/config/debian/13/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# Get package signing key and repository for Terraform
wget -O - https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(grep -oP '(?<=UBUNTU_CODENAME=).*' /etc/os-release || lsb_release -cs) main" \
    | tee /etc/apt/sources.list.d/hashicorp.list

apt-get update && apt-get install -y \
    xdg-utils \
    xauth

# Install .NET SDK
apt-get install -y dotnet-sdk-10.0

dotnet --version

# Install Terraform
apt-get install -y terraform

terraform -v

# Install pre-commit
apt-get install -y pre-commit

# Install gitleaks
apt-get install -y gitleaks

# Clean up APT when done

apt-get -y upgrade \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
