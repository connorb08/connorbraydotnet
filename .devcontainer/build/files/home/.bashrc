# 1. Immutable system/image defaults (always updated on image rebuild)
if [ -d "/etc/bashrc.d" ]; then
    for file in /etc/bashrc.d/*.sh; do
        [ -r "$file" ] && [ -f "$file" ] && source "$file"
    done
    unset file
fi

# 2. Persistent user overrides (stored on the devenv-config volume)
if [ -d "${XDG_CONFIG_HOME:-/config}/bashrc.d" ]; then
    for file in "${XDG_CONFIG_HOME:-/config}"/bashrc.d/*.sh; do
        [ -r "$file" ] && [ -f "$file" ] && source "$file"
    done
    unset file
fi

# 3. devcontainer file overrides
if [ -d "$WORKSPACE_PATH/.devcontainer/.bashrc.d" ]; then
    for file in "$WORKSPACE_PATH"/.devcontainer/.bashrc.d/*; do
        [ -r "$file" ] && [ -f "$file" ] && source "$file"
    done
    unset file
fi
