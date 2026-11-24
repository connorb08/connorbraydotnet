// Helpers and abstract targets reused by the concrete targets.

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
    result = cache_ref(repo) == "" ? [] : ["type=registry,ref=${cache_ref(repo)}"]
}

// Registry cache export for a repo; only when WRITE_CACHE is set.
function "cache_to" {
    params = [repo]
    result = WRITE_CACHE && cache_ref(repo) != "" ? ["type=registry,ref=${cache_ref(repo)},mode=max"] : []
}

// Unpacked OCI layout under build/<name>.
function "oci_output" {
    params = [name]
    result = ["type=oci,tar=false,dest=build/${name}"]
}

// Defaults every target inherits.
target "_common" {
    context = "."
    args = {
        ARCH = ARCH
    }
}

// Targets that read the mise configuration from MISE_CONFIG_DIR.
target "_mise" {
    inherits = ["_common"]
    contexts = { mise-config = MISE_CONFIG_DIR }
    args = {
        SOURCE_DATE_EPOCH = "0"
    }
}
