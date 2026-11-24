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
variable "MISE_CONFIG_DIR" { default = ".." }
