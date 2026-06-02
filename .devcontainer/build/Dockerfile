# Base Image
FROM mcr.microsoft.com/devcontainers/base:trixie

# Set Shell
SHELL ["/bin/bash", "-c"]

# Environment Variables
ENV USERNAME="vscode"
ENV HOME="/home/vscode"

# Install apt packages
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    bash \
    git \
    ca-certificates \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

COPY ./build-scripts ./scripts

RUN ./scripts/upgrade-packages.sh
# RUN ./scripts/bun.sh

# Ensure container runs as the non-root user where NVM is installed
USER vscode

# Use a login shell to ensure nvm is loaded from the user's profile
CMD ["bash", "-l"]
