# syntax=docker/dockerfile:1

FROM ghcr.io/jdx/mise:debian AS builder

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

WORKDIR /install

COPY mise-oci.toml ./mise.toml
COPY ./files ./files
RUN --mount=type=cache,id=mise-cache-${ARCH},target=/var/cache/mise,sharing=locked \
    mise install

# mise install --system

# Share the mise cache (base image, tool layer cache) with `mise install` above,
# and the apt caches with the builder's own package install, so rebuilding the
# image does not re-download the base image or its [bootstrap.packages].
RUN --mount=type=cache,id=mise-cache-${ARCH},target=/var/cache/mise,sharing=locked \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    mise oci build --output /output

FROM scratch AS oci-base

COPY --from=builder /output /
