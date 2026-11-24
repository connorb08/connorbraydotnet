// Inputs shared by every target. Override any of these with an environment
// variable of the same name, e.g. `TAG=dev WRITE_CACHE=true docker buildx bake`.

// Platform ----------------------------------------------------------------

BAKE_LOCAL_PLATFORM = "os/arch" // auto-resolved to the local platform
variable "TARGET_PLATFORM" { default = BAKE_LOCAL_PLATFORM }
variable "ARCH" { default = split("/", TARGET_PLATFORM)[1] }

// Image user --------------------------------------------------------------

variable "USER_NAME" { default = "dev" }
variable "USER_UID" { default = 1000 }
variable "USER_GID" { default = USER_UID }

// Registry ----------------------------------------------------------------

variable "REGISTRY" { default = "065897469619.dkr.ecr.us-east-2.amazonaws.com" }
variable "TAG" { default = "latest" }
variable "CACHE_TAG" { default = "buildcache" }
variable "WRITE_CACHE" { default = false }
variable "READ_CACHE" { default = true }

// Repository names, keyed by role so targets never hardcode them.
variable "REPOS" {
    type = map(string)
    default = {
        base         = "devenv-base"
        base-layered = "devenv-base-layered"
        tools        = "devenv-tools"
        final        = "devenv"
    }
}

// Directory holding mise.toml, tools.toml, mise.lock, mise.image.toml and
// .mise/locks/, exposed to Dockerfiles as the `mise-config` named context.
# variable "MISE_CONFIG_DIR" { default = ".." }


variable "BUILDER_PACKAGES" {
    description = "Packages installed in the tool-builder image."
    type        = list(string)
    default = [
        # Archives
        "unzip", "xz-utils", "bzip2", "zstd", "p7zip-full",
        # Compilers & build systems
        "build-essential", "pkg-config", "cmake", "ninja-build",
        "autoconf", "automake", "libtool", "bison", "flex", "patch",
        # Common C headers
        "libssl-dev", "zlib1g-dev", "libbz2-dev", "liblzma-dev",
        "libffi-dev", "libreadline-dev", "libncurses-dev",
        "libsqlite3-dev", "libyaml-dev", "libxml2-dev", "libxslt1-dev",
        "libgmp-dev", "libgdbm-dev", "libnss3-dev", "uuid-dev",
        "libgpgme-dev", "libassuan-dev", "libbtrfs-dev", "libdevmapper-dev",
        # Runtime dependencies
        "libicu76", "libicu-dev", "libgssapi-krb5-2", "python3",
        "python3-venv", "python3-pip", "tzdata",
        # Auth, verification & CLI helpers
        "ca-certificates", "curl", "git", "gnupg",
        "openssh-client", "jq", "file", "procps", "rsync",
    ]
}

// Helpers and abstract targets reused by the concrete targets.

function "image_fqdn" {
    params = [repo, tag]
    result = REGISTRY == "" ? "${repo}:${tag}" : "${REGISTRY}/${repo}:${tag}"
}

function "cache_ref" {
    params = []
    result = REGISTRY == "" ? "" : "${REGISTRY}/${REPO}:${CACHE_TAG}"
}

// Registry cache import for a repo; empty when no registry is configured.
function "cache_from" {
    params = []
    result = READ_CACHE && cache_ref() != "" ? ["type=registry,ref=${cache_ref()}"] : []
}

// Registry cache export for a repo; only when WRITE_CACHE is set.
function "cache_to" {
    params = []
    result = WRITE_CACHE && cache_ref() != "" ? ["type=registry,ref=${cache_ref()},mode=max"] : []
}

variable "REPO" {
    default = "devenv"
    validation {
        condition     = REPO != ""
        error_message = "REPO must not be empty."
    }
}

target "base" {
    dockerfile = "Dockerfile"
    target = "oci-base"
    # tags       = [image_fqdn(REPOS["base-layered"], TAG)]
    output     = ["type=local,dest=build/oci"]
    # cache-from = cache_from(REPOS["base-layered"])
    # cache-to   = cache_to(REPOS["base-layered"])
    args = {
        ARCH         = ARCH // keys the per-architecture mise cache mount
        APT_PACKAGES = join(" ", sort(distinct(BUILDER_PACKAGES)))
    }
}

target "final" {
    dockerfile = "final.Dockerfile"
    target     = "final"
    contexts = {
        base = "oci-layout://build/oci"
    }
    args = {
        USER_NAME    = USER_NAME
        USER_UID     = USER_UID
        USER_GID     = USER_GID
    }
}

target "docker" {
    inherits = ["final"]
    tags = ["${REPO}:v2"]
    output = ["type=docker"]
}

target "registry" {
    inherits = ["final"]
    tags = [image_fqdn(REPO, "v2")]
    output = ["type=registry"]
}
