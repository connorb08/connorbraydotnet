# syntax=docker/dockerfile:1

FROM ghcr.io/jdx/mise:debian AS builder

ARG ARCH

ENV DEBIAN_FRONTEND=noninteractive
ENV MISE_CACHE_DIR=/var/cache/mise

SHELL ["/bin/bash", "-e", "-u", "-o", "pipefail", "-c"]

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    <<EOF

    set -euo pipefail
    rm -f /etc/apt/apt.conf.d/docker-clean
    apt-get update
    apt-get install --yes --no-install-recommends \
        unzip xz-utils bzip2 zstd p7zip-full \
        build-essential pkg-config cmake ninja-build \
        autoconf automake libtool bison flex patch \
        libssl-dev zlib1g-dev libbz2-dev liblzma-dev \
        libffi-dev libreadline-dev libncurses-dev \
        libsqlite3-dev libyaml-dev libxml2-dev libxslt1-dev \
        libgmp-dev libgdbm-dev libnss3-dev uuid-dev \
        libgpgme-dev libassuan-dev libbtrfs-dev libdevmapper-dev \
        libicu76 libicu-dev libgssapi-krb5-2 python3 \
        python3-venv python3-pip tzdata \
        ca-certificates curl git gnupg \
        openssh-client jq file procps rsync

EOF

WORKDIR /install

COPY mise.toml packages.toml tools.toml mise.lock ./
COPY .mise/locks/ .mise/locks/
COPY ./files ./files
RUN --mount=type=cache,id=mise-cache-${ARCH},target=/var/cache/mise,sharing=locked \
    mise install --locked

# Share the mise cache (base image, tool layer cache) with `mise install` above,
# and the apt caches with the builder's own package install, so rebuilding the
# image does not re-download the base image or its [bootstrap.packages].
RUN --mount=type=cache,id=mise-cache-${ARCH},target=/var/cache/mise,sharing=locked \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    mise oci build --output /output

FROM scratch AS oci-base

COPY --from=builder /output /

FROM base AS final

ENV MISE_DATA_DIR="/mise" \
    MISE_EXPERIMENTAL="1" \
    MISE_INSTALL_LAYOUT="identity" \
    MISE_SYSTEM_CONFIG_DIR="/etc/mise" \
    XDG_CONFIG_HOME="/config" \
    XDG_CACHE_HOME="/cache" \
    MISE_CONFIG_DIR="/config/mise" \
    DOCKER_CONFIG="/config/docker" \
    PATH="/mise/shims:${PATH}" \
    LANG="en_US.UTF-8" \
    LANGUAGE="en_US:en" \
    LC_ALL="en_US.UTF-8"

SHELL ["/bin/bash", "-e", "-u", "-o", "pipefail", "-c"]

# Register mise-managed Docker CLI plugins system-wide
RUN install -d /usr/local/lib/docker/cli-plugins \
    && printf '#!/bin/sh\nexec mise x -- docker-compose "$@"\n' > /usr/local/lib/docker/cli-plugins/docker-compose \
    && printf '#!/bin/sh\nexec mise x -- docker-cli-plugin-docker-buildx "$@"\n' > /usr/local/lib/docker/cli-plugins/docker-buildx \
    && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose /usr/local/lib/docker/cli-plugins/docker-buildx

# Remove the default secure_path so the user's PATH is preserved when using sudo.
RUN sed -i '/secure_path/d' /etc/sudoers

ARG USER_NAME
ARG USER_UID
ARG USER_GID

SHELL ["/bin/bash", "-e", "-u", "-o", "pipefail", "-c"]

RUN <<EOF
    groupadd --gid $USER_GID $USER_NAME
    useradd --uid $USER_UID --gid $USER_GID --no-create-home $USER_NAME --home-dir /home/dev --shell /usr/bin/bash
    echo "$USER_NAME ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/$USER_NAME
    chmod 0440 /etc/sudoers.d/$USER_NAME
    echo 'export USER=$(id -un)' >> /etc/profile
EOF

# 1. Immutable system files (as root, before USER $USER_NAME)
COPY files/etc/ /etc/
COPY --chmod=0755 files/docker/cli-plugins/ /usr/local/lib/docker/cli-plugins/

# Generate the en_US.UTF-8 locale.
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen \
    && locale-gen

# 2. Set up directories, symlinks, and ownership
RUN install -d -o $USER_NAME -g $USER_NAME /cache /config /config/bashrc.d /config/docker /config/mise /workspace /home/dev \
    && chown -R $USER_NAME:$USER_NAME /cache /config /workspace /home/dev /mise \
    && ln -sT /config/docker /home/dev/.docker \
    && chown -h $USER_NAME:$USER_NAME /home/dev/.docker

# 3. User home dotfiles and staged /config volume defaults
COPY --chown=$USER_NAME:$USER_NAME files/home/ /home/dev/
COPY --chown=$USER_NAME:$USER_NAME files/config-defaults/ /usr/local/share/devenv/config-defaults/

USER $USER_NAME
ENV USER=$USER_NAME

RUN mise reshim

ENTRYPOINT [ "sleep", "infinity" ]
