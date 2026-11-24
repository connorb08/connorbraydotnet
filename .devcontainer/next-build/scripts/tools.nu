#!/usr/bin/env nu

export def tool-variables [] {
    let tools = (open tools.toml | get tools | columns | sort)
    if ($tools | is-empty) {
        error make { msg: "No tools configured in tools.toml" }
    }
    { variable: { TOOL_LIST: { default: $tools } } } | to json
}

def main [--print] {
    cd ($env.FILE_PWD | path dirname)
    let variables = (tool-variables)
    if $print {
        $variables | ^docker buildx bake -f tool-bake.hcl -f - --print tool-builder
    } else {
        $variables | ^docker buildx bake -f tool-bake.hcl -f - tool-builder
    }
}
