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

- Most projects follow this structure:
  - `package.json`
  - `project.json`
  - optional `biome.json`
- Project-specific setup and scripts live in each project folder.
