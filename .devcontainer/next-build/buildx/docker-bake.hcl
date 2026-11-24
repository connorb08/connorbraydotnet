// Entry point. Bake has no includes, so load every module explicitly:
//
//   docker buildx bake -f vars.hcl -f functions.hcl -f base.hcl -f tools.hcl -f docker-bake.hcl \
//       --allow fs.read=.. [target]
//
// `--allow fs.read=..` lets the tool targets read MISE_CONFIG_DIR. tools.toml
// supplies TOOL_LIST; pipe it in with an extra `-f -` as scripts/tools.nu does.

group "default" {
    targets = ["base", "final"]
}

// mise-built OCI layout of the full tool set. The tag is not applied to the
// local output; it names where `ocie push` sends the merged devenv image.
target "final" {
    inherits   = ["_common"]
    dockerfile = "Dockerfile"
    tags       = [image_fqdn(REPOS.final, TAG)]
    output     = ["type=local,dest=build/mise-oci"]
    contexts   = { tool-base = "target:tool-builder" }
    no-cache   = true
    args = {
        # BASE_IMAGE_FQDN = image_fqdn(REPOS.base, TAG)
        # PUSH_IMAGE_FQDN = image_fqdn(REPOS.final, TAG)
    }
}
