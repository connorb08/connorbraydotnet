# connorbray.net

[![CI](https://github.com/connorb08/connorbraydotnet/actions/workflows/ci.yml/badge.svg)](https://github.com/connorb08/connorbraydotnet/actions/workflows/ci.yml)
[![Pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit)](https://pre-commit.com/)

A monorepo for the connorbray.net personal website, resume, and content management system. Built for performance, scalability, and developer experience using modern TypeScript, React, Cloudflare Workers, and infrastructure-as-code.

## Websites

- **main/**  
  The main website frontend, built with React, TypeScript, and React Router 7. Features a portfolio, blog, and photography gallery.

- **resume/**  
  Resume service and API. Generates resume in HTML/CSS. Can be exported to PDF. Validates resume data using JSON schema and provides server-rendered HTML/CSS output. Includes integration and unit tests.

## Services

- **content-manager/**  
  Content management backend for handling static assets and other content. Uses Cloudflare R2 for storage.

## Packages

badges:

languages:

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)

development:
-
  - ide
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)

- os
  - ![Ubuntu](https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)
  - ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
  - [devcontainer]



infastructure:

![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white)
![Amazon S3](https://img.shields.io/badge/Amazon%20S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)

deployment / hosting:

![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)


ci/cd:

![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)


technologies:

![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Nx](https://img.shields.io/badge/nx-143055?style=for-the-badge&logo=nx&logoColor=white)

front-end:

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

other:


![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

links:

![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)

testing:

![Vitest](https://img.shields.io/badge/-Vitest-252529?style=for-the-badge&logo=vitest&logoColor=FCC72B)
![Playwright](https://img.shields.io/badge/-playwright-%232EAD33?style=for-the-badge&logo=playwright&logoColor=white)

version control:

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)

secret management:

![Bitwarden](https://img.shields.io/badge/bitwarden-%23175DDC.svg?style=for-the-badge&logo=bitwarden&logoColor=white)
gitleaks

## Tooling & Features

- **CI/CD:** Automated with GitHub Actions for build, test, and deployment.
- **Infrastructure:** Managed with Terraform for reproducible, scalable deployments.
- **Pre-commit hooks:** Enforced via [pre-commit](https://pre-commit.com/) and [gitleaks](https://github.com/gitleaks/gitleaks) for code quality and security.
- **Testing:** Unit, integration, and end-to-end tests using Vitest.
- **TypeScript:** Strict types and shared types across packages.
- **Monorepo:** Managed with Nx for efficient builds and dependency management.
