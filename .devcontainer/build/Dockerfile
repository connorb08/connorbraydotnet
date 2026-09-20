# Base Image
FROM mcr.microsoft.com/devcontainers/base:trixie

# Set Shell
SHELL ["/bin/bash", "-c"]

# Environment Variables
ENV USERNAME="vscode"
ENV HOME="/home/vscode"
ENV NODE_VERSION="26"

WORKDIR /tmp

COPY ./layers/apt-get.sh /tmp/layers/apt-get.sh
RUN ./layers/apt-get.sh

COPY ./layers/dotnet.sh /tmp/layers/dotnet.sh
RUN ./layers/dotnet.sh

COPY ./layers/terraform.sh /tmp/layers/terraform.sh
RUN ./layers/terraform.sh

COPY ./layers/apt-trim.sh /tmp/layers/apt-trim.sh
RUN ./layers/apt-trim.sh

COPY ./layers/rust.sh /tmp/layers/rust.sh
RUN ./layers/rust.sh

COPY ./layers/bun.sh /tmp/layers/bun.sh
RUN ./layers/bun.sh

COPY ./layers/node.sh /tmp/layers/node.sh
RUN ./layers/node.sh

COPY --chown=$USERNAME:$USERNAME ./.bashrc.d /home/vscode/.bashrc.d

USER vscode
CMD ["bash", "-l"]
