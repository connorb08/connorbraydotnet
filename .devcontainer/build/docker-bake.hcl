/**

 */

BAKE_LOCAL_PLATFORM = "os/arch" // auto-resolved to the local platform
CACHE_TAG="buildcache"

variable "TARGET_PLATFORM" { default = BAKE_LOCAL_PLATFORM }
variable "ARCH" { default = split("/", TARGET_PLATFORM)[1] }
variable "TAG" { default = "latest" }
variable "REGISTRY" { default = "065897469619.dkr.ecr.us-east-2.amazonaws.com" }
variable "WRITE_CACHE" { default = false }
variable "READ_CACHE" { default = true }

function "image_fqdn" {
    params = [repo, tag]
    result = REGISTRY == "" ? "${repo}:${tag}" : "${REGISTRY}/${repo}:${tag}"
}

function "cache_ref" {
    params = [repo]
    result = REGISTRY == "" ? "" : "${REGISTRY}/${repo}:${CACHE_TAG}"
}

// Registry cache import for a repo; empty when no registry is configured.
function "cache_from" {
    params = [repo]
    result = READ_CACHE && cache_ref(repo) != "" ? ["type=registry,ref=${cache_ref(repo)}"] : []
}

// Registry cache export for a repo; only when WRITE_CACHE is set.
function "cache_to" {
    params = [repo]
    result = WRITE_CACHE && cache_ref(repo) != "" ? ["type=registry,ref=${cache_ref(repo)},mode=max"] : []
}


target "base" {
    target = "oci-base"
    output     = ["type=local,dest=.oci/base"]
    cache-from = cache_from("devenv-tools")
    cache-to   = cache_to("devenv-tools")
    args = {
        ARCH         = ARCH // keys the per-architecture mise cache mount
    }
}

target "final" {
    target     = "final"
    cache-from = cache_from("devenv")
    cache-to   = cache_to("devenv")
    contexts = {
        base = "oci-layout://.oci/base"
    }
    args = {
        USER_NAME    = "dev"
        USER_UID     = 1000
        USER_GID     = 1000
    }
}

target "docker" {
    inherits = ["final"]
    tags = ["devenv:${TAG}"]
    output = ["type=docker"]
}

// Prefixed with the registry when one is configured.
target "registry" {
    inherits = ["final"]
    tags = [image_fqdn("devenv", TAG)]
    output = ["type=registry"]
}

// One build, two outputs, each with its own name.
target "all" {
    inherits = ["final"]
    output = [
        "type=docker,name=devenv:${TAG}",
        "type=registry,name=${image_fqdn("devenv", TAG)}",
    ]
}
