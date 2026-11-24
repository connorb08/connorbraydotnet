build layer:
includes all the required toolchains to install tools

core layer: FROM <base>
operating system, apt packages, etc

extra apts

does mise oci use python / other backends? or does it need the --system backends? mise install --system and save file or just use oci?

skopeo

Each [[oci.copy]] entry, or --copy HOST:IMAGE flag, adds one layer after the tool layers:

image- - core layer - extra apts - configs - tools

crane rebase / flatten

docker buildx build \
--cache-from type=registry,ref=my-registry/my-env:buildcache \
--cache-to type=registry,ref=my-registry/my-env:buildcache,mode=max \
-t my-registry/my-env:latest --push .

crane rebase my-env:latest \
--old_base ubuntu:24.04@sha256:<old-digest> \
--new_base ubuntu:24.04@sha256:<new-digest> \
-t my-env:patched

--from scratch

SOURCE_DATE_EPOCH=$(git log -1 --format=%ct) mise oci build --from scratch -o ./layer-oci

Reproducibility
On one host, rebuilding with unchanged inputs produces byte-identical tool layers. Across machines, layer digests can differ, because compiled files such as Python bytecode or node-gyp output can embed absolute paths. To make the image config's timestamps reproducible, set SOURCE_DATE_EPOCH:

SOURCE_DATE_EPOCH=$(git log -1 --format=%ct) mise oci build
