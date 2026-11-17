# connorbraydotnet

Monorepo for `connorbray.net` and related apps/services.

## Shared infrastructure helpers

Reusable infrastructure logic lives in [inf/shared/](inf/shared/):

- [config.ts](inf/shared/config.ts): `requireCredential(config, key, context)` reads
  a required Pulumi secret, rejects empty or whitespace-only values, and preserves
  the original value and secret tracking. `context` prefixes validation errors
  with the application's name.
- [transforms.ts](inf/shared/transforms.ts): shared object/array guards,
  downward API normalization, and pod TLS checksum transforms. Existing
  Cluster/Kubernetes helper paths re-export these implementations for compatibility.

Keep application-specific configuration and transforms with their application.
Projects importing shared helpers must include `inf/shared/` within their
TypeScript `rootDir`.

## Cross-project infrastructure outputs

Use [TypedStackReference](inf/shared/stack-ref.ts) to read outputs without importing
and running another Pulumi program:

```ts
import { TypedStackReference } from "../../shared/stack-ref.ts";

const amazon = new TypedStackReference<"Infrastructure">("amazon", {
	name: "organization/Infrastructure/dev",
});
const address = amazon.requireOutput("vpsIp");
```

The project type is the Pulumi project name: `Infrastructure` (Amazon), `Backend`,
`Cluster`, `Kubernetes`, or `Oracle`. Supply the target stack name for your backend
explicitly; the local resource name (`amazon` above) must be unique in the consumer.
Use `getOutput` for optional outputs and `requireOutput` to fail when an output is
missing. Both retain Pulumi secret tracking. Output types are inferred through
type-only imports; `Cluster.createdApps` remains `unknown` because its exported
`Set` is not a JSON stack-output contract. Vault and Grafana currently have no stack
outputs. Consumers with a project-local TypeScript `rootDir` must widen it to include
the shared helper and its type-only source dependencies.

## Cluster Tailscale ingress

Shared helpers live in [tailscale-ingress.ts](inf/Cluster/src/tailscale-ingress.ts):

- `tailscaleIngress({ hostname, tags })` generates Helm ingress values. Pass
  `"className"` as the second argument for charts such as CouchDB that use that key
  instead of `ingressClassName`. The chart must depend on the Tailscale operator.
- `createTailscaleIngress(name, { hostname, tags, metadata, service }, operator, options)`
  creates a standalone Ingress. Supply a namespace in `metadata` and a backend such
  as `{ name: "vault-ui", port: { number: 443 } }` in `service`; named ports also work.
  The helper adds the operator dependency while preserving other resource options
  and dependencies.

Both helpers configure private Tailscale HTTPS, HTTP redirects, and `/` routing.
TLS hosts contain the short tailnet hostname; the operator manages certificates.

## Cluster NetBird

[NetbirdHost](inf/Cluster/src/apps/netbird.ts) deploys HelmForge `netbird` chart
`1.1.3` from `https://repo.helmforge.dev` (also published as
`oci://ghcr.io/helmforgedev/helm/netbird`). Images are pinned to
`netbirdio/netbird-server:0.81.5` and `netbirdio/dashboard:v2.90.10`.
It uses bundled standalone PostgreSQL with an 8Gi retained volume and a 10Gi
NetBird data volume on the cluster's retained `local-path` storage.

Set configuration in the Cluster project before previewing or deploying:

```sh
cd inf/Cluster
pulumi config set netbirdHostname netbird.your-tailnet.ts.net
openssl rand -hex 32 | pulumi config set --secret netbirdAuthSecret
openssl rand -base64 32 | pulumi config set --secret netbirdEncryptionKey
openssl rand -hex 32 | pulumi config set --secret netbirdDatabasePassword
openssl rand -hex 32 | pulumi config set --secret netbirdPostgresPassword
pulumi preview
pulumi up
```

Use the full Tailscale DNS name, without a scheme or path, for `netbirdHostname`.
The server advertises an explicit `:443` so NetBird's signal gRPC client can dial
the endpoint; the OIDC issuer and browser callback URLs omit that default port.
Enable HTTPS certificates in the tailnet and allow the operator to assign
`tag:netbird`; grant intended clients access to that tag on TCP 443.
Complete the initial owner setup at `https://<netbirdHostname>` before granting
wider access. Preserve the encryption key and passwords across updates:
Pulumi renders charts without Helm's live-cluster secret lookup. Changing config
alone does not rotate passwords in an already initialized PostgreSQL database.
Back up both volumes and the secrets; node-local storage is not highly available.

[NetbirdIngress](inf/Cluster/src/apps/netbird-ingress.ts) is a separate component
that routes dashboard, API, embedded OIDC, WebSocket relay, and h2c gRPC traffic
through the Tailscale operator. The chart itself does not own ingress.
All clients currently need Tailscale access. UDP 3478 (STUN) remains cluster-only:
this HTTPS ingress does not expose UDP, so this is not yet a complete public
NetBird deployment and direct peer connectivity may be limited.
For public access, replace the ingress component, update `netbirdHostname`, and
provide an HTTP/2/gRPC- and WebSocket-capable HTTPS ingress plus a separate UDP
3478 listener for the server at the advertised hostname.

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
