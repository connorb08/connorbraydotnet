FROM base AS final

ARG ARCH
ARG USER_NAME
ARG USER_UID
ARG USER_GID

SHELL ["/bin/bash", "-e", "-u", "-o", "pipefail", "-c"]

RUN <<EOF

    groupadd --gid $USER_GID $USER_NAME
    useradd --uid $USER_UID --gid $USER_GID --no-create-home $USER_NAME --home-dir /home/dev --shell /usr/bin/bash
    echo "$USER_NAME ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/$USER_NAME
    chmod 0440 /etc/sudoers.d/$USER_NAME

EOF

# useradd --uid $USER_UID --gid $USER_GID --create-home $USER_NAME --shell /usr/bin/bash

# Remove the default secure_path so the user's PATH is preserved when using sudo.
RUN sed -i '/secure_path/d' /etc/sudoers

# Set up directories for the development environment.
RUN install -d -o $USER_NAME -g $USER_NAME /cache /config /workspace

USER $USER_NAME

# ENV MISE_SYSTEM_CONFIG_DIR="/etc/mise" \
#     XDG_CONFIG_HOME="/config" \
#     XDG_CACHE_HOME="/cache"
# MISE_CONFIG_DIR=""

ENTRYPOINT [ "sleep", "infinity" ]
