# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->

## Package manager

This workspace uses **bun**, not pnpm — ignore the pnpm example in the Nx block above. Prefix commands with `bun` (`bun nx build`, `bun install`, `bun run checks`).

## Commands

```bash
bun run checks                                   # full CI-style pass: format:check, lint, typecheck, build, test
bun nx run-many -t <target>                      # all projects
bun nx run <project>:<target>                    # one project
bun nx affected --base=origin/main -t <target>   # what CI runs
```

Targets available across projects: `format:check`, `format:write`, `lint`, `typegen`, `typecheck`, `build`, `test`, `depcheck`, `deploy:preview`, `deploy:prod`.

Single test file / single test (vitest, from within a project dir):

```bash
bunx vitest run path/to/file.test.ts
bunx vitest run -t "test name"
```

`bun run checks` sets `NX_TUI=false`; do the same for non-interactive runs.

## Project names ≠ directory names

`nx run` takes the project name, which often differs from the folder:

| Directory | Project name |
|---|---|
| `sites/main` | `site` |
| `sites/queens` | `queens` (package.json says `linkedin-games`) |
| `services/queens` | `queens.net` |

Everything else matches its folder. `bun nx show projects` lists them all.

## Architecture

Bun workspaces + Nx. Most projects are Cloudflare Workers deployed with Wrangler; each has a `package.json`, a `project.json`, and usually a `wrangler.json`.

**Sites** (`sites/`) are React Router v7 apps running on Workers. `sites/main` is connorbray.net, `sites/resume` is the resume site with a JSON-schema validation flow, plus `admin` and `queens`.

**Services** (`services/`) are Workers that sites reach through RPC service bindings, not HTTP. `sites/main/wrangler.json` binds `CONTENT_MANAGER`, `DATABASE`, and `DB`, each naming a `WorkerEntrypoint` class exported by the target service. When changing a service's public methods, you're changing a cross-worker contract — the binding's `entrypoint` name must keep matching the exported class.

**Two separate database workers, easily confused:**
- `services/db` — Cloudflare D1, `kysely` + `kysely-d1`, entry `src/worker.ts`, migrations in `src/migrations`. Bound as `DB` and marked `remote: true`.
- `services/database` — a Durable Object (`DatabaseObject`), `kysely` + `kysely-do`, entry `src/index.ts`. Schema is created at DO construction time via `blockConcurrencyWhile`. Bound as `DATABASE`.

**Packages** (`packages/`) are source-only libraries consumed as `workspace:*` with `exports` pointing straight at `.ts` — no build step for most (`shared` is the exception). `types` and `schemas` are zod-based and shared between workers and sites.

**`services/queens`** is the outlier: .NET 10 (`Queens`, `Lambda`, `Browser`, `Tests`), deployed as a Docker image to AWS ECR + Lambda with its own Terraform in `services/queens/inf`. Its nx targets (`build`, `docker-push`, `tf-plan`, `deploy`) shell out to its `Makefile`. Requires `AWS_ID` in the environment. Unrelated to `sites/queens`, which is the Cloudflare front-end.

**`cli/`** is a Rust/Clap CLI, built with cargo and excluded from Biome.

**`inf/`** is workspace-level Terraform driven by bun scripts (`init`/`plan`/`apply`), needing `backend.conf` (see `example.backend.conf`).

## typegen before typecheck

Worker types are generated, not committed. `wrangler types` writes `worker-configuration.d.ts` (giving you `Env`), and `react-router typegen` writes route types. Sites pass **multiple** `-c` flags so bindings for services they consume are typed too, e.g. `sites/main`:

```
wrangler types -c wrangler.json -c ../../services/db/wrangler.json -c ../../services/api/wrangler.json ... && react-router typegen
```

So `typecheck` depends on `typegen`, and a site's `typegen` depends on the bound services' `typecheck`. If you add or rename a service binding, update the consuming site's `typegen` script and the `dependsOn` in its `project.json` — otherwise `Env` silently lacks the binding.

## Conventions

- **Biome** (not ESLint/Prettier) for format + lint: tabs, line width 90, organize-imports on. Nursery rules are on and most domains are `error`, so lint failures are common on new code — run `bun nx run-many -t format:write` before committing.
- **Node subpath imports** rather than TS path aliases. Each package declares its own `imports` map in `package.json` (`#app/*`, `#components/*`, `#utils`, `#types`, …). Follow the existing map for the project you're in; the workspace root also exposes `#workspace/*`.
- **TypeScript is maximally strict** (`tsconfig.base.json`): `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, composite project references built with `tsc -b`, `emitDeclarationOnly`.
- Services return an `RPCResult<T>` wrapper from `types` rather than throwing across the RPC boundary.

## CI

`.github/workflows/ci.yml` runs on PRs to `main`: `nx affected` for `format:check`, `lint`, `build`, `test`, distributed via Nx Cloud agents (format and lint use `--no-agents`). Terraform and tflint are installed in CI. Gitleaks runs as a pre-commit hook.
