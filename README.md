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

Build the development container image with Docker Buildx:

```bash
IMAGE=dev-image bash .devcontainer/bake.sh --load
```

The script discovers all install layers in `.devcontainer/build/layers/` and
passes them to `.devcontainer/build/docker-bake.hcl`. Additional Buildx arguments
are forwarded; use `--print` to inspect the build configuration without building.

The Pulumi layer installs CLI version `3.274.1`, including its bundled language
tools and Bash completion, using the matching Linux ARM64 or x64 release.

The HashiCorp Vault layer installs CLI version `2.2.1` with Bash completion
using the matching Linux ARM64 or amd64 release.

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
