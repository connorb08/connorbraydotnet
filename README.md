# connorbraydotnet

Monorepo for `connorbray.net` and related apps/services.

This workspace contains:

- public-facing sites
- Cloudflare Worker services
- shared TypeScript packages
- infrastructure code
- a small Rust CLI project

## Repo at a glance

- `sites/`
    - `main`: primary personal site
    - `resume`: resume site + rendering/validation flow
    - `admin`: admin UI
    - `queens`: LinkedIn games project site
- `services/`
    - `api`: HTTP API service
    - `database`: database-facing worker/service
    - `content-manager`: content and asset management
    - `message-queue`: queue/worker processing
    - `web-schemas`: schema-focused worker/service
- `packages/`
    - reusable libraries (`shared`, `types`, `components`, `schemas`, `clog`, `test-data`)
- `inf/`
    - infrastructure code (Terraform + related config)
- `cli/`
    - Rust CLI (Clap-based)

## Stack

- Bun workspaces + Nx monorepo tooling
- TypeScript + React + React Router
- Vite + Vitest + Playwright
- Cloudflare Workers + Wrangler
- Biome for formatting/linting

## Getting started

Requirements:

- Bun
- Node.js (for ecosystem compatibility)
- Cloudflare Wrangler (for worker development/deploy)

Install dependencies:

```bash
bun install
```

Run common workspace commands:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

Run a full CI-style pass locally:

```bash
bun run checks
```

## Notes

### Oxc configuration

`oxfmt.config.ts` mirrors Biome's tab indentation, 90-column width, LF endings,
and separate type-import grouping. It preserves side-effect import order and
does not reorder package manifest keys. Generated output is excluded.

`oxlint.config.ts` enables correctness, suspicious, and performance checks,
with explicit Biome-style TypeScript, React, accessibility, and security rules.
Bun is recognized globally; browser, Node, and test globals are scoped to
their relevant files.
Experimental nursery rules remain opt-in; function-size guidance is a warning
because Oxlint has no informational severity. Rule coverage is not identical
to Biome, and the existing Nx scripts still use Biome.

Oxlint reports unused bindings unless their names start with `_`, including
parameters, caught errors, and destructured bindings. Underscore naming is allowed.
VS Code's TypeScript/JavaScript suggestion diagnostics are disabled so the
TypeScript language service does not flag intentionally unused `_`-prefixed
locals; this also disables its other suggestion diagnostics. Compiler unused
checks remain disabled (their default); Oxlint owns unused-binding diagnostics
because TypeScript has no configurable ignore pattern for unused locals.

Side-effect CSS and SCSS imports are allowed because the frontend framework
loads those stylesheets; other unassigned imports are still checked.

The lint policy preserves intentional patterns rather than requiring cosmetic
rewrites:

- Inline JSX objects, arrays, callbacks, and icon elements are allowed; memoization
  is not required without evidence of a performance issue.
- Constructed context values, default object/array props, and synchronous effect
  state updates are warnings, not errors. Hook correctness checks remain errors.
- Type-only `import()` annotations are allowed alongside separate type imports.
- Tests may retain commented drafts and use non-null assertions for fixtures
  initialized by test hooks; production non-null assertions remain errors.
- Empty placeholders and `export {}` module markers are allowed.
- Infrastructure transforms may copy objects inside `map` to avoid mutating
  provider inputs.
- Inline SVG image roles and the footer's current-year calculation have local,
  explained exceptions; other accessibility and render-purity checks remain on.

Run these tools directly from the repository root:

```bash
bunx oxfmt --check .
bunx oxlint -c oxlint.config.ts --ignore-path .gitignore .
```

### TypeScript compiler output

TypeScript projects do not emit JavaScript. Project-reference builds emit only
declarations and declaration maps, while standalone infrastructure and gallery
checks emit only incremental metadata. Each configuration writes its uniquely
named build metadata (for example, `tsconfig.lib.tsbuildinfo`) inside its
project's ignored `.tsbuildinfo/` directory, alongside any declaration output.
Vite, React Router, and Wrangler still produce their normal application bundles.

### Pulumi TypeScript projects

The infrastructure programs in `inf/Amazon/`, `inf/Backend/`, and
`inf/Kubernetes/` are TypeScript Bun workspaces. Install their dependencies with
`bun install` from the repository root. Each project uses `src/index.ts` as its
Pulumi entry point; `.NET` is no longer needed for these stacks.

Pulumi runs the TypeScript directly using Node's native type stripping, with
`runtime.options.typescript: false`; use Node 22.18.0 or newer. The shared
TypeScript configuration enforces erasable syntax. `bun run build` in a project
checks types and writes incremental metadata into `.tsbuildinfo/`; it does not
emit JavaScript. Pulumi does not depend on generated output or `ts-node`.
Pulumi SDK/provider versions are pinned only in the root `package.json`;
infrastructure workspaces declare wildcard peer dependencies. TypeScript and
Node typings also reuse the workspace versions.

From a project's directory, run `bun run typecheck`, `bun run build`,
`pulumi preview --stack <stack>`, or `pulumi up --stack <stack>`. The equivalent
Nx projects are `inf-amazon`, `inf-backend`, and `inf-kubernetes`; infrastructure
preview/deploy targets disable caching because they depend on live state and
credentials. Run infrastructure regression tests with `bun run --cwd inf test` or
`nx test inf-tests`.
These check SSH validation, bootstrap substitution, secret marking, resource
safeguards, and Helm transforms using mocked providers and synthetic credentials.
`inf/tests/tsconfig.json` extends the test-specific configuration so VS Code
discovers the Bun test types without adding Bun globals to infrastructure programs.

Changing languages does not require re-importing or recreating resources.
Project names, backend URLs, configuration keys, component type tokens, resource
names/parents, outputs, and provider versions remain unchanged. Keep the same
stack selection, secrets-provider passphrase, AWS configuration, and
`VPS_SSH_PORT`. Preview each existing stack before updating it and stop if any
unexpected replacement or deletion appears. The `Pulumi.<stack>.yaml` files and
Lightsail bootstrap script are retained without changes. Old local `bin/` and
`obj/` directories may be removed once the migration is verified.

### Pulumi state bucket

`inf/Backend/src/index.ts` creates a protected, versioned S3 backend bucket with SSE-S3
encryption, all public access blocked, ACLs disabled, and an HTTPS-only policy.
It uses the configured AWS provider region and keeps S3 Standard storage without
expiration or archival rules. The account-regional bucket name is
`state-<unique-suffix>-<account-id>-<region>-an`, generated by the AWS provider.
The short prefix leaves room for the random suffix and account-regional naming
requirements within S3's 63-character limit. Versioning and encryption use
dedicated S3 configuration resources.

Set the provider region with `pulumi config set aws:region <region>`. Bootstrap
this stack using a separate backend; do not store its only state in the bucket
it manages. The stack exports `stateBackendUrl` and `stateBackendPolicyArn`.
Attach the exported IAM policy to the user or role running your other Pulumi
stacks; it grants access only to this bucket and its objects. No principal is
automatically granted access. Configure those stacks' Pulumi secrets provider
separately; S3 encryption does not replace Pulumi secrets encryption.

### Lightsail SSH port

The stack in `inf/Amazon/` requires the `VPS_SSH_PORT` environment variable
(1024-65535). Choose a random high port once, and keep that value in your local
environment for subsequent previews and updates:

```bash
export VPS_SSH_PORT="$(shuf -i 20000-60000 -n 1)"
cd inf/Amazon
pulumi preview --stack dev
pulumi up --stack dev
```

No actual port value is stored in source or stack configuration files. The value
is injected into the bootstrap script and exported as `vpsSshPort`; it remains
visible in Pulumi state, AWS firewall configuration, and bootstrap logs.
Do not regenerate it for each update: changing the port replaces the instance
and deletes its disk data.

The stack opens the selected SSH port for IPv4 and IPv6, preserves HTTP port 80,
and closes port 22. Bootstrap configures the SELinux port label where enabled,
validates SSH configuration, and restarts SSH before revoking the default user's
key file. Lightsail's browser SSH connection on port 22 will no longer work.
After bootstrap finishes, connect with the new private key:

```bash
ssh -p "$(pulumi stack output vpsSshPort --stack dev)" \
    -i /path/to/private-key \
    "dev@$(pulumi stack output vpsIp --stack dev)"
```

### Kubernetes Tailscale and Vault

The Pulumi stack in `inf/Kubernetes/` manages the Tailscale Kubernetes Operator through
`src/tailscale.ts`. It retains the `tailscale-operator` chart release name, the
`tailscale` namespace, the `operator` deployment/state Secret names, and the
`operator-oauth` credentials Secret. The chart is pinned to `1.104.4`, matching
the existing installation. The authenticated Kubernetes API server proxy and
its impersonation permissions remain enabled.

Set the existing OAuth credentials as encrypted Pulumi configuration in your own
terminal; these commands prompt for values:

```bash
cd inf/Kubernetes
pulumi config set --secret tailscaleClientId --stack dev
pulumi config set --secret tailscaleClientSecret --stack dev
```

Pulumi manages the credentials in a separate Kubernetes Secret with the
`client_id` and `client_secret` keys. Helm receives only the Secret name, so
secret/unknown credential values do not prevent chart rendering during previews.
The operator uses `tag:k8s-operator`; make that tag an owner of `tag:vault` in
the tailnet policy. Enable MagicDNS and HTTPS in the tailnet. After changing
OAuth credentials, restart the operator with
`kubectl rollout restart deployment/operator -n tailscale`.

The cdk8s source project has been retired. Local legacy credentials and build
output are not deleted. Do not continue applying its previously generated
manifests.

For the existing cdk8s installation, import its Kubernetes resources into Pulumi
before applying the new stack:

```bash
pulumi preview --stack dev --import-file tailscale-import.json
# Retain the existing Tailscale resources and their component/parent entries.
# Fill their import IDs with namespace/name, or name for cluster-scoped resources.
pulumi import --stack dev --file tailscale-import.json --generate-code=false
pulumi preview --stack dev
pulumi up --stack dev
```

For example, the namespace ID is `tailscale`, the credentials Secret ID is
`tailscale/operator-oauth`, and the deployment ID is `tailscale/operator`.
Include the chart's existing CRDs, RBAC, and IngressClass resources as well.
Do not delete the namespace, the `operator` state Secret, or the ingress proxy
Secrets during migration: they preserve the tailnet device identities.
The operator Deployment transform makes the downward API's default
`fieldRef.apiVersion: v1` explicit. This avoids field conflicts with the previous
`kubectl-client-side-apply` manager without forcing ownership of other fields.

The Pulumi stack in `inf/Kubernetes/` defines all Vault Helm values and the typed
Tailscale ingress in `src/vault.ts`, with `src/index.ts` as the entry point; it does not
load YAML files. It creates the `vault` namespace and a `vault-internal-tls`
Secret before deploying the Vault chart. The supplied YAML is reference-only.

Pulumi.Tls generates a private key and a self-signed internal server certificate.
Vault uses HTTPS on port 8200; the `vault-ui` Service maps port 443 to that port.
The Secret contains `tls.crt`, `tls.key`, and `ca.crt`. The private key is kept
secret in Pulumi state; the public trust certificate is exported as
`vaultInternalCaCert`. Internal clients (including injected Vault agents) must
trust this certificate and connect using a DNS name covered by its SANs.
The service DNS names assume the default `cluster.local` cluster domain.

The Vault ingress waits for the Pulumi-managed Tailscale operator and Vault chart.
The ingress uses the hostname `vault`, redirects HTTP to HTTPS, and lets
Tailscale provision the browser-facing Let's Encrypt certificate. Tailscale
encrypts the connection to the backend on port 443 but does not verify the
backend's self-signed certificate; the Pulumi certificate is not the certificate
presented to browsers.

Deploy with `pulumi up --stack dev` from `inf/Kubernetes/`. Vault still requires manual
initialization and unsealing: during the first deployment, use a separate
terminal to run `kubectl exec -n vault vault-0 -- vault operator init` and
`kubectl exec -n vault vault-0 -- vault operator unseal` for the required number
of keys. Store the initialization output securely, outside source control.
Pulumi waits for the unsealed pod to become ready before creating the ingress.

The internal certificate is valid for one year and is renewed by a subsequent
`pulumi up` within 30 days of expiry (not by a background timer). A certificate
checksum in the pod annotations triggers a rollout so Vault loads the new
certificate. The checksum is applied to the rendered StatefulSet through a
Pulumi resource transform, keeping Helm inputs known during the first preview.
Without auto-unseal, unseal the restarted pod again. Update the
trust certificate in internal clients after renewal. This configuration retains
one Raft replica, so it is not highly available and rollouts cause downtime.

### Development container

Build the development container image with Docker Buildx:

```bash
IMAGE=dev-image bash .devcontainer/bake.sh --load
```

The script discovers all install layers in `.devcontainer/build/layers/` and
passes them to `.devcontainer/build/docker-bake.hcl`. Additional Buildx arguments
are forwarded; use `--print` to inspect the build configuration without building.

All install layers share build-only curl settings that retry transient download
failures (including GitHub HTTP 502/503/504 responses) up to six times with
exponential backoff, a 30-second connection timeout, a 120-second per-attempt
timeout, and a 900-second retry window. The retry window is longer than one
attempt so a slow gateway timeout does not exhaust the retry budget before a
retry starts. An attempt started within that window may finish after it.
Permanent HTTP errors such as 404 are not retried; persistent transient failures
still stop the build. These settings are not copied into the final image.

Downloads use a generic Chrome-on-Linux user agent rather than a custom or curl
identity. Every layer follows redirects with `--location`,
including GitHub's signed release-asset redirects. Release binaries use the
version-pinned release download URLs; shell-completion source files use pinned
`raw.githubusercontent.com` URLs. `Accept: application/octet-stream` is not
needed for these direct downloads; it selects binary content when using GitHub's
release-asset REST API instead. A browser-style user agent does not bypass
IP-based throttling or prevent gateway timeouts; bounded retries remain the
recovery mechanism.

The image's apt package layer includes OpenBSD netcat (`nc`) and GNU telnet
(`telnet`) for network troubleshooting, plus `psmisc` for utilities such as
`pstree` and `fuser`.

The Pulumi layer installs CLI version `3.274.1`, including its bundled language
tools and Bash completion, using the matching Linux ARM64 or x64 release.

The Helm layer installs CLI version `4.3.1` with Bash completion from the official
Linux ARM64 or amd64 release archive, verifying its SHA-256 checksum.

The kubectl layer installs CLI version `1.37.2` with Bash completion from the
official Linux ARM64 or amd64 binary, verifying its SHA-256 checksum. Keep kubectl
within one minor version of your Kubernetes API server.

The k9s layer installs version `0.51.0` with Bash completion from the official
Linux ARM64 or amd64 release archive, verifying its SHA-256 checksum.

The HashiCorp Vault layer installs CLI version `2.2.1` with Bash completion
using the matching Linux ARM64 or amd64 release.

The Bitwarden layers install the Password Manager CLI (`bw`, version `2026.10.1`)
and Secrets Manager CLI (`bws`, version `2.1.0`) from their official Linux ARM64
or x64 releases. Authenticate at runtime; no credentials are included in the image.

The Vault Compose stack in `inf/Vault/` exposes Vault only through Tailscale,
without publishing host port 8200. Copy `example.env` to `.env` in that directory,
set `TS_AUTHKEY` to a Tailscale auth key, and run `docker compose up -d`.
Use a non-ephemeral key so the persisted Tailscale state retains the node identity.
Vault shares the Tailscale container's network namespace; userspace networking
forwards tailnet traffic to its loopback listener without requiring `/dev/net/tun`.
Connect from an authorized tailnet device at `http://vault:8200` (with MagicDNS
enabled), or use the node's Tailscale IP. Change `TS_HOSTNAME` to rename the node.

Rebuild/reopen the dev container after building the image. The container directly
bind-mounts `/var/run/docker.sock` from the host and sets `DOCKER_HOST` to that
socket; no dev-container feature or Docker daemon is installed. The image's
entrypoint briefly runs as root to add `dev` to the socket's group inside the
container, then runs the container command as `dev`. Host socket permissions
are not changed. VS Code terminals also run as `dev`.
`overrideCommand: false` preserves the image's startup command so VS Code runs
the socket-permission entrypoint. After changing this setting, rebuild the
container; reopening a terminal alone does not rerun the entrypoint.
Docker must be running on the host. Containers and images are shared with the
host, and socket access grants control of the host daemon; use trusted code only.
Bind-mount source paths must exist on the host, not just inside the dev container.
For rootless Docker or a custom socket location, change the mount's `source` in
`.devcontainer/devcontainer.json`, keeping its target at `/var/run/docker.sock`.

The image includes `openssh-client` for Git over SSH, `ssh-add`, and SCP/SFTP.
VS Code Dev Containers automatically forwards the host's running SSH agent
through `SSH_AUTH_SOCK`; no private-key mount or container-local agent is needed.
Start your SSH agent and load the required key with `ssh-add` on the host before
opening the container. Inside the container, run `ssh-add -l` to verify forwarding.
If it reports no identities, add the key on the host; if it cannot connect to the
agent, ensure the host agent is running and reopen the container.

The container runs `pre-commit install` on creation to refresh the Git hook for
the image's standalone pre-commit runtime. If an existing hook reports
`/usr/bin/python3: No module named pre_commit`, run `pre-commit install` in the
repository to regenerate it; installing a separate system Python package is
not necessary.

Interactive Bash shells use a two-line colored prompt with Git branch/detached
HEAD context and the exit code of failed commands. Directory listings use eza
when available; `lt` shows a two-level tree. `..` and `...` navigate up directories.
History is appended rather than overwritten, and Up/Down search history matching
what you have typed. Tab completion ignores case, displays ambiguous matches,
and highlights files; Shift-Tab cycles backward through completions.
Set `NO_COLOR=1` before starting a shell to disable these colors;
`TERM=dumb` also uses a plain prompt.

- Most projects follow this structure:
    - `package.json`
    - `project.json`
    - optional `biome.json`
- Project-specific setup and scripts live in each project folder.
