# syntax=docker/dockerfile:1

FROM debian:trixie-slim

ARG ARCH
ARG APT_PACKAGES
ARG USER_NAME
ARG USER_UID
ARG USER_GID

SHELL ["/bin/bash", "-e", "-u", "-o", "pipefail", "-c"]
ENV DEBIAN_FRONTEND=noninteractive

# Install the APT packages with local cache
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


RUN <<EOF

    groupadd --gid $USER_GID $USER_NAME
    useradd --uid $USER_UID --gid $USER_GID --create-home $USER_NAME --shell /usr/bin/bash
    echo "$USER_NAME ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/$USER_NAME
    chmod 0440 /etc/sudoers.d/$USER_NAME

EOF

# Remove the default secure_path so the user's PATH is preserved when using sudo.
RUN sed -i '/secure_path/d' /etc/sudoers

# Set up directories for the development environment.
RUN install -d -o $USER_NAME -g $USER_NAME /cache /config /workspace

USER $USER_NAME
ENTRYPOINT [ "sleep", "infinity" ]
