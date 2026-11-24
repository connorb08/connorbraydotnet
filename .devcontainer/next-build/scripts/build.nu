#!/usr/bin/env nu

use tools.nu tool-variables

let registry = "065897469619.dkr.ecr.us-east-2.amazonaws.com"
let build_dir = ($env.FILE_PWD | path dirname)

def cleanup [] {
    rm -rf build/base-oci build/squashed-base build/devenv-oci
}

def build [] {

    cd $build_dir
    let variables = (tool-variables)
    cleanup

    with-env { REGISTRY: $registry } {
        $variables | ^docker buildx bake -f docker-bake.hcl base
    }

    let tag = open ./build/base-oci/index.json | get manifests.annotations."org.opencontainers.image.ref.name" | first
    squash ./build/base-oci ./build/squashed-base $tag

    with-env { REGISTRY: $registry } {
        $variables | ^docker buildx bake -f docker-bake.hcl -f tool-bake.hcl -f - tool-builder
    }

    with-env { REGISTRY: $registry } {
        $variables | ^docker buildx bake -f docker-bake.hcl -f tool-bake.hcl -f - default
    }

    apply_layers ./build/squashed-base ./build/mise-oci ./build/devenv-oci $tag

}

def squash [from: string, to: string, tag: string] {
    let input = ($from | path expand)
    let output = ($to | path expand)
    ^go -C ($build_dir | path join cli) run . -tag $tag $input $output
}

def apply_layers [base: string, tools: string, to: string, tag: string] {
    let base_path = ($base | path expand)
    let tool_path = ($tools | path expand)
    let output = ($to | path expand)
    ^go -C ($build_dir | path join cli) run . merge -tag $tag $base_path $tool_path $output
}

build
