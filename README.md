# connorbraydotnet

Monorepo for `connorbray.net` and related apps/services.

## Git hooks in the devcontainer

Vite+ manages Git hooks through `.vite-hooks/_`, configured by `vp config` during
`bun install`. The [.vite-hooks/pre-commit](.vite-hooks/pre-commit) hook runs
Gitleaks via `pre-commit run gitleaks` before `vp staged`; either failure blocks
the commit. Devcontainer creation does not run `pre-commit install`, which
conflicts with Vite+'s `core.hooksPath`. Keep that Git setting intact.
The post-create command also runs Gitleaks independently.

## VS Code test discovery

The Vitest extension discovers only dedicated `vitest.config.*` files, as configured
in [.vscode/settings.json](.vscode/settings.json). Keep Vitest suites in those configs;
application `vite.config.*` files can start Cloudflare development runtimes and are
not test entry points. Loading them during test discovery can fail with
`depsOptimizer is required in dev mode`.

After changing discovery settings, run **Developer: Reload Window** from the Command Palette.

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
Keep TypeScript module imports extensionless throughout the repository. Pulumi
projects that load extensionless TypeScript directly use the Bun runtime
(`runtime: bun`); selecting Bun only as a package manager does not change Node.js
module resolution. Shared package exports still point to explicit filenames.
Projects importing shared helpers must include `inf/shared/` within their
TypeScript `rootDir`.

## Cross-project infrastructure outputs

Use [StackRef](infrastructure/shared/stack-ref.ts) to read outputs without importing
and running another Pulumi program:

```ts
import { StackRef } from "@root/inf/stack-ref";

const amazon = StackRef("aws");
const region = amazon.requireOutput("awsRegion");
const backend = StackRef("backend", "prod");
```

The project type is inferred from the name: `aws`, `backend`, `cluster`, `oracle`,
or `cloudflare`. These map to the existing, case-sensitive Pulumi project names
`aws`, `Backend`, `cluster`, `Oracle`, and `Cloudflare` under
`organization`. Stack names default to `dev`; pass a second argument for another
stack, such as the Backend project's `prod` stack. The local resource name is the
project key and must be unique in the consumer. `TypedStackReference<Project>` is
also available when you need an explicit target or custom resource options.
Use `getOutput` for optional outputs and `requireOutput` to fail when an output is
missing. Both retain Pulumi secret tracking. Output types are inferred through
type-only imports; `Cluster.createdApps` remains `unknown` because its exported
`Set` is not a JSON stack-output contract. Grafana currently has no stack outputs.
Consumers with a project-local TypeScript `rootDir` must widen it to include
the shared helper and its type-only source dependencies.

### Vault AWS secrets engine

Deploy the AWS stack before the Vault stack. AWS exports `awsRegion`,
`vaultAwsAccessKeyId`, the secret `vaultAwsSecretAccessKey`, and the ECR read/write
role ARNs. Vault reads these outputs through `StackRef("aws")`; it does not create
AWS resources itself. The referenced AWS stack is `organization/aws/dev`.

Vault keeps the `aws` mount and configures `aws/config/root` separately
to avoid managing the same mount with two resources. Root credentials remain
Pulumi-managed and secret in state; do not rotate them out of band without updating
that ownership. Authenticate the Vault provider using `VAULT_ADDR` and `VAULT_TOKEN`.

The `ecr-devenv-read` and `ecr-devenv-write` roles issue one-hour STS credentials:

```sh
vault read aws/sts/ecr-devenv-read
vault read aws/sts/ecr-devenv-write
vault read aws/sts/admin
```

Consumers need Vault policies granting read access to the appropriate STS path.
The `admin` role assumes the AWS stack's `vault-admin` role with
`AdministratorAccess`.

### Personal devcontainer Vault Proxy

The Vault project provisions a protected AppRole auth mount at `auth/approle`
and the `devcontainer-admin` role. This personal role has full Vault administration
access, including KV secrets and the ECR/AWS administrator credential paths.
It is not intended for shared workloads. The proxy binds only to
`127.0.0.1:8100`, but any process that can reach that listener can use its
administrator permissions, including other processes on the host network.

Deploy AWS first and then Vault, using an existing privileged Vault login directly
against the upstream server for initial provisioning. If the AppRole auth mount
already exists, import it as `proxy-approle` under the `proxy-auth` component
before applying; do not disable and recreate an existing auth mount.

The Vault stack exports `vaultProxyRoleId` (secret), `vaultProxyRoleName`, and
`vaultProxyAuthPath`. From the workspace root, bootstrap the proxy:

```sh
export VAULT_UPSTREAM_ADDR="https://your-vault-host"
export VAULT_ROLE_ID="$(pulumi -C infrastructure/apps/vault stack output vaultProxyRoleId --show-secrets)"
export VAULT_SECRET_ID="$(VAULT_ADDR="$VAULT_UPSTREAM_ADDR" vault write -field=secret_id -f auth/approle/role/devcontainer-admin/secret-id)"
.devcontainer/lifecycle/postStartCommand.sh
unset VAULT_ROLE_ID VAULT_SECRET_ID
```

Set `VAULT_CACERT` if the upstream server uses a private certificate authority.
TLS verification is enforced. `VAULT_ADDR` for clients remains
`http://127.0.0.1:8100`; `VAULT_UPSTREAM_ADDR` is the Kubernetes-hosted server,
never the local proxy.

For automatic container restarts, provide these values through the ignored
`.devcontainer/.env` file with mode `0600`, not `public.env`. Legacy upstream
`VAULT_ADDR` entries in that file remain supported. SecretIDs expire after
24 hours, so generate a fresh one before a later restart. The proxy renews its
one-hour periodic service token while running and removes the SecretID file after
authentication. Runtime credentials live in a user-owned `0700` directory.
Startup is idempotent and succeeds only after a proxied token lookup works.
The proxy configuration is `.devcontainer/proxy-config.hcl`. Startup output is
saved to `vault-proxy/proxy.log` under `XDG_RUNTIME_DIR`, or
`~/.local/state/vault-proxy/proxy.log` when that variable is unset. Failures report
the log path; the log has mode `0600`.
The tmux pane supervises the proxy and forwards shutdown signals, so closing the
session also terminates the proxy instead of leaving its listener running.

## Authentik application provider

The Authentik application uses one explicit provider for all users. Its URL comes
from the Cluster stack's `authentikUrl` output. Pass the instance base URL without
adding `/api/v3/`; the Terraform provider appends the API path itself.
Keep application credentials out of
the provider-reserved `authentik:` configuration namespace:

```sh
cd infrastructure/apps/authentik
pulumi config set --secret app:authentikApiKey
```

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

## Cluster Vikunja

[Vikunja](infrastructure/cluster/apps/vikunja.ts) runs `vikunja/vikunja:2.8.0`
at `https://todo.tail717c1.ts.net` through a private Tailscale ingress. The
`cluster:vikunjaHostname` setting contains the full `todo.<tailnet>.ts.net` name.
Before deploying, define `tag:todo` in your tailnet policy, authorize the
Kubernetes operator to assign it, and grant intended users access on TCP 443.
Otherwise Pulumi will wait for the ingress to receive an address.

Vikunja uses its own non-superuser role and retained database in the existing
PostgreSQL cluster with `sslmode=require`. No SQLite or database proxy is used.
The protected 5Gi local-path volume stores attachments. Back up that volume and
the database; the single replica uses `Recreate` to avoid concurrent writers.
Generated service/OIDC secrets are stored as secret Pulumi values and mounted
through a Kubernetes Secret. Configuration changes trigger a pod rollout.

Deploy Cluster first, then register Vikunja in Authentik:

```sh
cd infrastructure/cluster
pulumi config set vikunjaHostname todo.tail717c1.ts.net
pulumi up
cd ../apps/authentik
pulumi up
```

Local username/password authentication and public registration are disabled.
Users sign in through Authentik and receive a Vikunja account on first login.
The confidential client uses `openid profile email`, the issuer
`https://identity.connorbray.net/application/o/vikunja/`, and the exact callback
`https://todo.tail717c1.ts.net/auth/openid/authentik`. Authentik users must have
an email address. Control application access with Authentik policies.
This is OIDC just-in-time provisioning, not SCIM synchronization: deleting or
disabling an Authentik user does not delete their Vikunja data or immediately
revoke an already-issued Vikunja session. Team/role administration remains in
Vikunja; no automatic group mapping is configured.

On the first deployment, SSO becomes usable only after the Authentik project
succeeds. Vikunja retries unavailable OIDC providers; its health probe does not
require an available OIDC provider during bootstrap.

## Cluster Donetick

The Cluster Pulumi project is named `cluster`; its dev stack is
`organization/cluster/dev`.

[Donetick](infrastructure/cluster/apps/donetick.ts) runs `donetick/donetick:v0.1.86`
as a single non-root pod with a private Tailscale HTTPS ingress. Configure its full
tailnet hostname before deploying Cluster:

```sh
cd infrastructure/cluster
pulumi config set donetickHostname donetick.your-tailnet.ts.net
pulumi preview
pulumi up
pulumi stack output donetickUrl
```

Enable Tailscale HTTPS certificates and allow the operator to assign
`tag:donetick`, with the intended tailnet users allowed to reach TCP 443.
The ingress device name is `donetick`; the configured FQDN must match its actual
Tailscale DNS name.

Donetick has its own non-superuser role and retained database in the existing
CloudNativePG cluster. The pinned Donetick release hard-codes plaintext database
connections, so a localhost-only `edoburu/pgbouncer:v1.26.1-p0` sidecar requires TLS
for connections to PostgreSQL. The cluster's TLS-only policy is unchanged.
The shared PostgreSQL hostname ends in a dot to force an absolute DNS lookup,
avoiding inherited search domains that can cause resolution failures.
The protected 5Gi local-path volume stores uploads, not SQLite data. Back up both
the PostgreSQL database and this volume.

JWT and OIDC secrets are generated once through Pulumi random resources and
mounted in a Kubernetes Secret. Configuration changes roll out the single pod
using `Recreate`, avoiding concurrent upload-volume writers.

After Cluster succeeds, deploy the Authentik project to register Donetick:

```sh
cd ../apps/authentik
pulumi preview
pulumi up
```

The confidential OIDC clients explicitly enable authorization-code and refresh-token
grants. Redirect entries explicitly set `redirect_uri_type: authorization` to match
Authentik's default and avoid recurring provider diffs. Donetick uses the exact web callback
`https://donetick.your-tailnet.ts.net/auth/oauth2` and the `openid`, `profile`, and
`email` mappings. Password authentication is disabled; new users are provisioned
through Authentik sign-in. Authentik application policies control who can sign in.
Until Authentik is deployed, the Donetick service is healthy but SSO is not ready.
This private deployment does not expose Donetick on the public Gateway or enable
the mobile application's public-internet access requirements.

## NetBird API-managed configuration

[infrastructure/apps/netbird/](infrastructure/apps/netbird/) is a separate Pulumi
project for NetBird API resources, distinct from the Cluster project's Helm
deployment. Its SDK bridges the pinned `netbirdio/netbird` Terraform provider
`0.0.11` through `terraform-provider` `1.5.1`.
Use `type: "oidc"` with the display name `Authentik`: this Terraform provider
does not accept `authentik` as a type, although the dashboard supports it.
NetBird server `0.83.1` builds the same OIDC connector for both types.

Deploy in this order to avoid circular stack references:

1. **Cluster** exports the NetBird URL and Donetick URL/client credentials.
2. **Authentik** registers both OIDC applications and exports NetBird's generated
   client credentials and issuer.
3. **NetBird** uses those outputs to manage the additional identity-provider
   connector. It does not replace NetBird's embedded IdP or disable local login.

Bootstrap an admin personal access token in the existing NetBird dashboard, then
initialize the new stack with the existing backend's KMS secrets provider:

```sh
cd infrastructure/apps/netbird
pulumi stack init dev --secrets-provider 'awskms://YOUR-KEY-ID?region=us-east-2'
pulumi config set --secret app:netbirdApiToken
pulumi package add terraform-provider@1.5.1 netbirdio/netbird 0.0.11
bun run deploy:preview
bun run deploy
```

The deployment scripts compile the generated SDK before invoking Pulumi. When
running `pulumi preview` or `pulumi up` directly, run `bun run sdk:build` first
after generating or reinstalling the SDK. Generated SDKs are not committed.

NetBird's embedded IdP uses the shared `/oauth2/callback` path, without a
connector ID suffix. Authentik permits this exact URL on the configured NetBird
HTTPS origin, plus its exact `/oauth2/logout/callback` URL. Neither callback
requires Authentik to depend on the NetBird configuration stack. Both clients use the
existing `authentik Self-signed Certificate` signing key and default provider
authorization/invalidation flows. The NetBird provider token and OIDC secrets
remain secret Pulumi values; rotate the admin token through secret configuration.
If an Authentik connector already exists, import it into the new stack instead of
creating a second one.

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

TLS terminates at the Gateway using Let's Encrypt certificates renewed by cert-manager
through Cloudflare DNS-01. Only HTTPRoutes from the `authentik` namespace may attach
to the Authentik listener.
The Authentik HTTPRoute forwards HTTP internally to the server; clients use HTTPS.

The same Gateway and public IP also have `bray-https` (`bray.sh`) and
`bray-wildcard-https` (`*.bray.sh`) HTTPS listeners, with a separate certificate
covering both names. No application routes are attached to these listeners yet;
requests will not serve an application. To attach a future HTTPRoute, label its
namespace `gateway.bray.sh/access=true` and reference Gateway `public` in
`envoy-gateway-system`, selecting the appropriate listener with `sectionName`.
The wildcard certificate covers one subdomain level, not names such as `a.b.bray.sh`.
Authentik's canonical hostname remains unchanged.

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
Pulumi config. This bootstrap credential needs Zone Read and DNS Edit for both zones,
plus Account API Tokens Read/Write for its account to create the cert-manager token.
Pulumi cannot create its first authentication credential without existing access.
Do not use the generated cert-manager token as the bootstrap credential.

If permission-group discovery returns `403` / `9109`, check that the credential
actually used by the provider has **Account API Tokens Read** or **Write** on the
zones' account. Creating the token additionally requires **Account API Tokens
Write**; Zone DNS Edit alone is insufficient. These are account-level permissions,
not the user-level API Tokens permission. Update the bootstrap credential's
permissions or replace it, then rerun `pulumi preview`. If you configured
`cloudflare:apiToken`, update that secret too rather than only changing the
environment variable.

This creates DNS-only A records for `identity.connorbray.net`, `bray.sh`, and
`*.bray.sh` in your existing zones. Both zones must be active in the same Cloudflare
account so the cert-manager account token can cover them.
It does not register a domain or create a new zone. Import an existing record rather
than trying to create a duplicate. The zone and account IDs are resolved through the
Cloudflare provider using `domainName` (defaults to `connorbray.net`); no manual
`zoneId`, `accountId`, or `originIpv4` configuration is needed.
`oracleStack` must identify your deployed Oracle stack, whose `publicIp` output
supplies the A record addresses. Re-run the Cloudflare deployment after Oracle's IP
changes; stack references do not automatically trigger deployments.

The project creates a DNS Edit / Zone Read account token scoped to these two zones and exports it
as the **secret** output `certManagerToken`. The Cluster stack reads it directly,
so no token copying or manual cert-manager token creation is required. Normal
stack output hides the value; use `pulumi stack output certManagerToken --show-secrets`
only if you intentionally need to retrieve it.
Both the Oracle public IP and Cloudflare token are consumed through the shared
`TypedStackReference` helper, preserving typed output names and secret tracking.
The Cluster stack also reads `brayDomainName` from Cloudflare; deploy Cloudflare
before updating Cluster.

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

The image includes the global Vite+ CLI (`vp`), installed by
[vite-plus.sh](.devcontainer/build/layers/vite-plus.sh). Node.js and Bun remain
separately installed; adding the CLI does not migrate the workspace to Vite+.

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
