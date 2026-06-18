# Nutrition App Foundation

Pre-VM foundation for a portable nutrition tracking app. The goal is to build the app and delivery path before moving any private backend or VM work into scope.

The app is built with:

- `Next.js` for the web UI, route handlers, and pre-VM service orchestration
- `Supabase Postgres + Auth` for the planned data and identity layer
- `USDA FoodData Central` through a server-side adapter
- future `Ollama` support behind a private backend boundary

## Workspace Shape

- `apps/web`: Next.js app shell, routes, server actions, API endpoints, Supabase migrations
- `packages/shared`: shared contracts, types, DTOs, and constants
- `docs/architecture`: app structure, data model, service boundaries, MVP screens
- `infra/ci`: CI gates, PR flow, preview expectations, secrets, and merge blockers
- `infra/docker`: container placeholders for later
- `infra/k8s`: Kubernetes placeholders for later

## Setup

Use Node 22 and the pinned pnpm version from `package.json`.

```bash
corepack prepare pnpm@10.12.1 --activate
corepack pnpm install --frozen-lockfile
```

## Run Locally

```bash
corepack pnpm dev
```

Open `http://localhost:3000`.

## Check Commands

These are the same gates used by CI:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

## Key Environment Variables

The app validates configuration in `apps/web/src/lib/config/env.ts`.

Required for local app behavior:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional for server-side integrations:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `USDA_API_KEY`
- `OLLAMA_BASE_URL`
- `OLLAMA_MODEL`
- `LLM_PROVIDER`
- `LOG_LEVEL`

CI uses non-secret placeholder values for public env vars and `LLM_PROVIDER=stub` because the pre-VM gate should prove the app builds without requiring live Supabase, USDA, or Ollama credentials.

## CI/CD Status

GitHub Actions runs the pre-VM CI gates on app, package, workspace, and CI changes:

- install
- lint
- typecheck
- tests
- production build

Dependency Review is enabled for PRs as a non-blocking foundation-phase signal. Dependabot checks npm workspace dependencies and GitHub Actions weekly.

See `infra/ci/README.md` for branch flow, PR expectations, preview rules, secret handling, and v1 merge blockers.

## Current Phase

This repo is focused on app foundation:

- app folder structure
- data model proposal
- API and service boundary proposal
- screen map for MVP
- Sprint 1 implementation order
- thinnest useful CI and merge gates

Deep feature implementation comes next after the foundation is approved.

## Known Gaps

- No persistent preview deployment exists yet; PR preview is local-only.
- Dependency Review is non-blocking until real user data or paid infrastructure is connected.
- `next lint` currently passes but is deprecated upstream and should move to the ESLint CLI before Next.js 16.
- VM deployment, Docker hardening, and Kubernetes flow remain placeholders for later phases.
