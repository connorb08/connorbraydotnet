// mise tools: one cached layer per tool, assembled into a single tool-builder
// image. TOOL_LIST normally comes from tools.toml (see scripts/tools.nu).

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

variable "TOOL_LIST" {
    description = "mise tools to build, one tool-<id> target each."
    type        = list(string)
    default     = []
}

variable "TOOL_DEPENDS" {
    description = "Tools whose install needs other tools present first."
    type        = map(list(string))
    default = {
        viteplus = ["node"]
        skopeo = ["go"]
    }
}

variable "TOOL_EXTRA_PATHS" {
    description = "Paths a tool installs outside /mise/."
    type        = map(list(string))
    default = {
        rust = ["/root/.cargo/", "/root/.rustup/"]
    }
}

// "aqua:foo/bar" -> "aqua-foo-bar", usable in target and cache names.
function "tool_id" {
    params = [tool]
    result = replace(replace(tool, ":", "-"), "/", "-")
}

// Every path a tool's layer contributes.
function "tool_paths" {
    params = [tool]
    result = concat(["/mise/"], lookup(TOOL_EXTRA_PATHS, tool, []))
}

// COPY lines pulling each tool's paths out of its tool-<id> stage.
function "copy_tools" {
    params = [tools]
    result = join("\n", flatten([
        for tool in tools : [
            for path in tool_paths(tool) : "COPY --link --from=tool-${tool_id(tool)} ${path} ${path}"
        ]
    ]))
}

// target:tool-<id> contexts for a list of tools.
function "tool_contexts" {
    params = [tools]
    result = { for tool in tools : "tool-${tool_id(tool)}" => "target:tool-${tool_id(tool)}" }
}

// Shared by every tools target: cache in the tools repo.
target "_tools" {
    inherits   = ["_mise"]
    cache-from = cache_from(REPOS.tools)
    cache-to   = cache_to(REPOS.tools)
}

// System packages plus mise; the common parent of every tool layer.
target "tools" {
    inherits   = ["_tools"]
    dockerfile = "tools.Dockerfile"
    target     = "dependencies"
    output     = ["type=cacheonly"]
    args = {
        APT_PACKAGES = join(" ", sort(distinct(BUILDER_PACKAGES)))
    }
}

target "tool" {
    matrix   = { tool = TOOL_LIST }
    name     = "tool-${tool_id(tool)}"
    inherits = ["_tools"]
    output   = ["type=cacheonly"]
    contexts = merge(
        { tools = "target:tools" },
        tool_contexts(lookup(TOOL_DEPENDS, tool, [])),
    )
    args = {
        TOOL    = tool
        TOOL_ID = tool_id(tool)
    }
    dockerfile-inline = <<-DOCKERFILE
        # syntax=docker/dockerfile:1
        FROM tools
        ${copy_tools(lookup(TOOL_DEPENDS, tool, []))}
        ARG ARCH
        ARG TOOL
        ARG TOOL_ID
        ARG SOURCE_DATE_EPOCH
        SHELL ["/bin/bash", "-e", "-u", "-o", "pipefail", "-c"]
        COPY --from=mise-config mise.toml tools.toml mise.lock ./
        COPY --from=mise-config ./files ./files
        COPY --from=mise-config .mise/locks/ .mise/locks/
        RUN --mount=type=cache,id=mise-$TOOL_ID-$ARCH,target=/var/cache/mise,sharing=locked \
            mise trust && mise install --locked --yes "$TOOL"
    DOCKERFILE
}

// Every tool layer stacked onto `tools`.
target "tool-builder" {
    inherits = ["_tools"]
    tags     = [image_fqdn(REPOS.tools, TAG)]
    output   = oci_output("tool-builder-oci")
    contexts = merge(
        { tools = "target:tools" },
        tool_contexts(TOOL_LIST),
    )
    dockerfile-inline = <<-DOCKERFILE
        # syntax=docker/dockerfile:1
        FROM tools
        ARG SOURCE_DATE_EPOCH
        ${copy_tools(TOOL_LIST)}
        COPY --from=mise-config mise.toml tools.toml mise.lock ./
        COPY --from=mise-config ./files ./files
        COPY --from=mise-config .mise/locks/ .mise/locks/
        RUN mise trust && mise install --locked --dry-run-code && mise reshim
    DOCKERFILE
}
