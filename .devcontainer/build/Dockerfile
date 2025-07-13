FROM mcr.microsoft.com/devcontainers/javascript-node

SHELL ["/bin/bash", "-c"]
ENV USERNAME="node"

RUN echo $(pwd)

COPY ./build-scripts ./scripts

RUN ./scripts/upgrade-packages.sh
RUN ./scripts/bun.sh
RUN ./scripts/playwright.sh