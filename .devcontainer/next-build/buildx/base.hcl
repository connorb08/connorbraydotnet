// Runtime base image: Debian, system packages and the development user.

variable "APT_PACKAGES" {
    description = "Packages installed in the final image."
    type        = list(string)
    default = [
        "bash-completion", "build-essential", "ca-certificates", "curl", "dnsutils",
        "file", "gettext-base", "git", "gnupg2", "inetutils-telnet",
        "iproute2", "iputils-ping", "jq", "less", "libatomic1", "libicu76",
        "libevent-dev", "locales", "lsof", "nano", "netcat-openbsd", "openssh-client",
        "pass", "psmisc", "python3", "python3-venv", "sudo", "tmux", "traceroute", "unzip", "util-linux",
        "uuid-runtime", "wget", "xauth", "xdg-utils", "xz-utils", "yq",
        "libgpgme11t64", "libdevmapper1.02.1", "libassuan9"
    ]
}

target "base" {
    inherits   = ["_common"]
    dockerfile = "base.Dockerfile"
    tags       = [image_fqdn(REPOS["base-layered"], TAG)]
    output     = oci_output("base-layered-oci")
    cache-from = cache_from(REPOS["base-layered"])
    cache-to   = cache_to(REPOS["base-layered"])
    args = {
        APT_PACKAGES = join(" ", sort(distinct(APT_PACKAGES)))
        USER_NAME    = USER_NAME
        USER_UID     = USER_UID
        USER_GID     = USER_GID
    }
}
