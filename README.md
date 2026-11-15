# connorbraydotnet

Monorepo for `connorbray.net` and related apps/services.

## Devcontainer image

Build and load the image used by [devcontainer.json](.devcontainer/devcontainer.json):

```sh
.devcontainer/bake.sh --load
```

[docker-bake.hcl](.devcontainer/build/docker-bake.hcl) installs shared APT
dependencies once, builds tool installers in parallel, and performs independent
image setup before copying tools. APT and pip downloads use local BuildKit cache
mounts. Keep the same builder to reuse these caches.

Registry caching is optional and disabled by default. Set `CACHE_REPO` to a
dedicated cache repository **without a tag**, and authenticate to that registry
before building:

```sh
CACHE_REPO=registry.example.com/dev-image-cache .devcontainer/bake.sh --load
```

Each target imports and exports its own cache tag with `mode=max`, retaining
intermediate build results without different targets overwriting one another.
Use a builder that supports registry cache export, such as the
`docker-container` driver (or the `docker` driver with the containerd image store).
Cache-mount contents themselves are local to the builder and are not exported.
Use separate cache repositories for concurrent builds that would publish the
same target tags.

To publish the image instead of loading it locally:

```sh
IMAGE=registry.example.com/dev-image .devcontainer/bake.sh --push
```

Inspect the generated targets without building with `.devcontainer/bake.sh --print`.
