# connorbraydotnet

Monorepo for `connorbray.net` and related apps/services.

## Shared infrastructure helpers

Reusable infrastructure logic lives in [infrastructure/shared/](infrastructure/shared/),
exported by the root workspace package
[`@connorbraydotnet/infrastructure`](infrastructure/package.json):

- [config.ts](inf/shared/config.ts): `requireCredential(config, key, context)` reads
  a required Pulumi secret, rejects empty or whitespace-only values, and preserves
  the original value and secret tracking. `context` prefixes validation errors
  with the application's name.
- [transforms.ts](inf/shared/transforms.ts): shared object/array guards,
  downward API normalization, and pod TLS checksum transforms. Existing
  Cluster/Kubernetes helper paths re-export these implementations for compatibility.

Keep application-specific configuration and transforms with their application.
Cloudflare and Cluster consume the shared helpers through package exports:

```ts
import { TypedStackReference } from "@connorbraydotnet/infrastructure/stack-ref";
import { requireCredential } from "@connorbraydotnet/infrastructure/config";
import { createNamespace } from "@connorbraydotnet/infrastructure/utils";
import { requireRecord } from "@connorbraydotnet/infrastructure/transforms";
```

Declare `"@connorbraydotnet/infrastructure": "workspace:*"` in a consuming project's
dependencies and run `bun install` from the repository root to link the package.
The exports resolve to explicit TypeScript files for native Node.js loading; no
per-project `#` aliases or shared-helper build step are needed. Each Pulumi project
retains its own package, configuration, and independent stack.
Pulumi runs these TypeScript sources directly in Node.js. Relative runtime imports
must use explicit `.ts` filenames (including `index.ts` for directories); shared
package exports resolve their filenames automatically.
Projects importing shared helpers must include `inf/shared/` within their
TypeScript `rootDir`.

## Cross-project infrastructure outputs

Use [TypedStackReference](inf/shared/stack-ref.ts) to read outputs without importing
and running another Pulumi program:

```ts
import { TypedStackReference } from "@connorbraydotnet/infrastructure/stack-ref";

const amazon = new TypedStackReference<"Infrastructure">("amazon", {
	name: "organization/Infrastructure/dev",
});
const address = amazon.requireOutput("vpsIp");
```

The project type is the Pulumi project name: `Infrastructure` (Amazon), `Backend`,
`Cluster`, `Kubernetes`, `Oracle`, or `Cloudflare`. Supply the target stack name for your backend
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

[NetbirdHost](infrastructure/cluster/apps/netbird.ts) deploys HelmForge `netbird` chart
`1.1.3` from `https://repo.helmforge.dev` (also published as
`oci://ghcr.io/helmforgedev/helm/netbird`). Images are pinned to
`netbirdio/netbird-server:0.83.1` and `netbirdio/dashboard:v2.97.0`.
It uses the shared CloudNativePG PostgreSQL cluster over TLS and keeps a 10Gi
NetBird identity/data volume on the cluster's retained `local-path` storage.

Set configuration in the Cluster project before previewing or deploying:

```sh
cd infrastructure/cluster
pulumi config set netbirdHostname netbird.your-tailnet.ts.net
openssl rand -hex 32 | pulumi config set --secret netbirdAuthSecret
openssl rand -base64 32 | pulumi config set --secret netbirdEncryptionKey
openssl rand -hex 32 | pulumi config set --secret netbirdDatabasePassword
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

[NetbirdIngress](infrastructure/cluster/apps/netbird-ingress.ts) is a separate component
that routes dashboard, API, embedded OIDC, WebSocket relay, and h2c gRPC traffic
through the Tailscale operator. The chart itself does not own ingress.
All clients currently need Tailscale access. UDP 3478 (STUN) remains cluster-only:
this HTTPS ingress does not expose UDP, so this is not yet a complete public
NetBird deployment and direct peer connectivity may be limited.
For public access, replace the ingress component, update `netbirdHostname`, and
provide an HTTP/2/gRPC- and WebSocket-capable HTTPS ingress plus a separate UDP
3478 listener for the server at the advertised hostname.

### Switching the existing NetBird deployment

This change intentionally starts NetBird management storage with a **fresh database**;
it does not copy data from the old bundled PostgreSQL instance. The embedded identity
volume, auth secret, and encryption key remain unchanged. Existing management records
are not carried over; expect to recreate settings and re-enroll peers as needed.
Take a backup before applying if you might need the old data.

The bundled PostgreSQL chart is disabled. Preview its removal carefully and retain
the old PVC/PV for recovery; do not delete it until the new deployment is verified.
`netbirdDatabasePassword` now supplies the shared cluster's `netbird` role.
`netbirdPostgresPassword` is no longer used and can be removed from config after
the cutover.

## Shared PostgreSQL

[PostgresqlDatabase](infrastructure/cluster/resources/database/index.ts) installs
CloudNativePG operator `0.29.2` and cluster chart `0.9.0`, running one PostgreSQL 18
instance with an 8Gi volume on retained `local-path` storage. Its internal endpoint
is `postgresql-rw.postgresql.svc.cluster.local:5432`; no public database service is
created. Non-TLS network connections are rejected.

Applications are declared in [ClusterApps](infrastructure/cluster/apps/index.ts):

```ts
const postgresql = new PostgresqlDatabase(storage, {
	authentik: {},
	netbird: { password: netbirdPassword },
	anotherapp: {},
}, { parent: this });
const database = postgresql.database("anotherapp");
```

Each entry gets a login role, database ownership, and a Kubernetes basic-auth Secret
in the `postgresql` namespace. Passwords are generated and kept secret in Pulumi unless
explicitly supplied. Names must start with a lowercase letter, contain only lowercase
letters/digits, and be at most 48 characters; reserved names are rejected.
Pass the connection values to the app and depend on `database.resource` so deployment
waits for database reconciliation. Roles cannot create databases/roles or act as
superusers. Database deletion retains the underlying database.

Backups are **not configured**, and node-local storage is not highly available.
Configure and test off-node backups before relying on this for important data.

## Authentik, Envoy Gateway, and Cloudflare DNS

[AuthentikApp](infrastructure/cluster/apps/authentik.ts) installs chart `2026.8.5`
with one server and one worker using their own shared PostgreSQL database.
NetBird continues using its embedded identity provider; this does not change it to
Authentik SSO.

[ClusterGateway](infrastructure/cluster/network/gateway.ts) installs Envoy Gateway
`v1.10.0` and Gateway API CRDs. An Envoy DaemonSet maps node TCP 443 to its unprivileged
HTTPS listener using `hostPort`; its Service remains ClusterIP. No OCI load balancer,
Cloudflare Tunnel, or port 80 listener is needed. The Envoy namespace permits host
ports, and the proxy tolerates the control-plane taint for this single-node Talos
cluster. The CNI must support hostPort, and no other workload may bind node port 443.
The existing OCI security list already allows TCP 443.
Envoy uses a Helm Release rather than a rendered Chart so its required internal
certificate-generation hooks execute.

TLS terminates at the Gateway using a Let's Encrypt certificate renewed by cert-manager
through Cloudflare DNS-01. Only HTTPRoutes from the `authentik` namespace may attach.
The Authentik HTTPRoute forwards HTTP internally to the server; clients use HTTPS.

First deploy [the Cloudflare project](infrastructure/cloud/cloudflare/index.ts):

```sh
cd infrastructure/cloud/cloudflare
pulumi stack init dev
pulumi config set oracleStack organization/Oracle/dev
pulumi preview
pulumi up
```

Authenticate the Cloudflare provider first using an existing credential, for example
the `CLOUDFLARE_API_TOKEN` environment variable or encrypted `cloudflare:apiToken`
Pulumi config. This bootstrap credential needs Zone Read and DNS Edit for the zone,
plus Account API Tokens Read/Write for its account to create the cert-manager token.
Pulumi cannot create its first authentication credential without existing access.
Do not use the generated cert-manager token as the bootstrap credential.

This creates a DNS-only A record for `identity.connorbray.net` in your existing zone.
It does not register a domain or create a new zone. Import an existing record rather
than trying to create a duplicate. The zone and account IDs are resolved through the
Cloudflare provider using `domainName` (defaults to `connorbray.net`); no manual
`zoneId`, `accountId`, or `originIpv4` configuration is needed.
`oracleStack` must identify your deployed Oracle stack, whose `publicIp` output
supplies the A record address. Re-run the Cloudflare deployment after Oracle's IP
changes; stack references do not automatically trigger deployments.

The project creates a zone-scoped DNS Edit / Zone Read account token and exports it
as the **secret** output `certManagerToken`. The Cluster stack reads it directly,
so no token copying or manual cert-manager token creation is required. Normal
stack output hides the value; use `pulumi stack output certManagerToken --show-secrets`
only if you intentionally need to retrieve it.
Both the Oracle public IP and Cloudflare token are consumed through the shared
`TypedStackReference` helper, preserving typed output names and secret tracking.

Then configure the Cluster stack (alongside its existing app credentials):

```sh
cd ../../cluster
pulumi config set acmeEmail YOUR_ACME_CONTACT_EMAIL
pulumi config set cloudflareStack organization/Cloudflare/dev
openssl rand -hex 32 | pulumi config set --secret authentikBootstrapPassword
pulumi preview
pulumi up
```

Use the actual stack references for your backend instead of the example
`organization/Oracle/dev` and `organization/Cloudflare/dev`. Select the existing
`dev` stack rather than initializing it again if it already exists.
The old `cloudflareDnsApiToken` Cluster config is no longer used.
The default hostname is `identity.connorbray.net`; override
`authentikHostname` in **both** projects if changing it. Certificate issuance must
succeed before the HTTPS Gateway is created; check cert-manager Certificate,
Order, and Challenge status if deployment waits there.

Log in at `https://identity.connorbray.net` as `akadmin` using the bootstrap password
(`pulumi config get --secret authentikBootstrapPassword`), then configure MFA.
The password initializes the account on first startup only; changing that config
does not reset an existing account's password. Preserve Authentik's generated secret
key and database password across updates.

After deployment, verify `kubectl get gateway,httproute -A`, the Envoy DaemonSet's
readiness, and `curl -I https://identity.connorbray.net`. There should be a valid
certificate, an accepted route, and an Authentik response. Only application HTTPS
is exposed: PostgreSQL, Talos management, and the Kubernetes API should stay private.

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
