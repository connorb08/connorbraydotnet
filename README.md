# connorbray.net

[![CI](https://github.com/connorb08/connorbraydotnet/actions/workflows/ci.yml/badge.svg)](https://github.com/connorb08/connorbraydotnet/actions/workflows/ci.yml)
[![Pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit)](https://pre-commit.com/)

A monorepo for the connorbray.net personal website, resume, and content management system. Built for performance, scalability, and developer experience using modern TypeScript, React, Cloudflare Workers, and infrastructure-as-code.

## Packages

- **site/**  
  The main website frontend, built with React, TypeScript, and Remix/React Router 7. Features a portfolio, blog, and photography gallery.

- **resume/**  
  Resume service and API. Generates and validates resume data using JSON schema and provides server-rendered HTML/CSS output. Includes integration and unit tests.

- **content-manager/**  
  Content management backend for handling static assets, resume data, and other content. Uses Cloudflare R2 and AWS S3 for storage, and is managed via Terraform.

## Tooling & Features

- **CI/CD:** Automated with GitHub Actions for build, test, and deployment.
- **Infrastructure:** Managed with Terraform for reproducible, scalable deployments.
- **Pre-commit hooks:** Enforced via [pre-commit](https://pre-commit.com/) and [gitleaks](https://github.com/gitleaks/gitleaks) for code quality and security.
- **Testing:** Unit, integration, and end-to-end tests using Vitest and Cloudflare Workers test pools.
- **TypeScript:** Strict types and shared types across packages.
- **Monorepo:** Managed with Nx for efficient builds and dependency management.

## Getting Started

See each package’s README for local development instructions.