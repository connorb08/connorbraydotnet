# Base Image
FROM mcr.microsoft.com/devcontainers/base:trixie

# Set Shell
SHELL ["/bin/bash", "-c"]

# Environment Variables
ENV USERNAME="vscode" \
    HOME="/home/vscode"
ENV NODE_VERSION="26"

WORKDIR /tmp

COPY ./layers/apt-get.sh /tmp/layers/apt-get.sh
RUN ./layers/apt-get.sh

COPY ./layers/rust.sh /tmp/layers/rust.sh
RUN ./layers/rust.sh

COPY ./layers/bun.sh /tmp/layers/bun.sh
RUN ./layers/bun.sh

COPY ./layers/node.sh /tmp/layers/node.sh
RUN ./layers/node.sh

USER vscode

COPY ./.bashrc.d /home/vscode/.bashrc.d

# Use a login shell to ensure nvm is loaded from the user's profile
WORKDIR /home/vscode
CMD ["bash", "-l"]
