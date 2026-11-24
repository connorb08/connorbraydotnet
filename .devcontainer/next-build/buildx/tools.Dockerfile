# syntax=docker/dockerfile:1

FROM ghcr.io/jdx/mise:debian AS dependencies

ARG ARCH
ARG APT_PACKAGES

ENV DEBIAN_FRONTEND=noninteractive
ENV MISE_CACHE_DIR=/var/cache/mise

SHELL ["/bin/bash", "-e", "-u", "-o", "pipefail", "-c"]

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    <<EOF

    set -euo pipefail
    if [ -n "${APT_PACKAGES}" ]; then
        rm -f /etc/apt/apt.conf.d/docker-clean
        apt-get update
        apt-get install --yes --no-install-recommends ${APT_PACKAGES}
    fi

EOF

WORKDIR /builder

FROM dependencies AS builder

COPY --from=mise-config mise.toml tools.toml mise.lock ./
COPY --from=mise-config ./files ./files
COPY --from=mise-config .mise/locks/ .mise/locks/
RUN --mount=type=cache,id=mise-cache-${ARCH},target=/var/cache/mise,sharing=locked \
    mise install --locked
