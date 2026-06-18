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
- `docs/security`: public-demo gate, PR checklist, and environment guidance
- `infra/ci`: CI notes/placeholders
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

This repo is still pre-VM, but it is no longer just an architecture shell.

Implemented now:

- Supabase-backed auth entry and protected app routes
- real profile and goals forms that persist through the current service layer
- meal logging UI connected to the current `/api/meals` flow
- a date-aware daily dashboard backed by saved meals and daily summary math
- weekly and monthly summary screens backed by persisted daily summaries
- test and CI verification baselines for the current backend and routing contracts

Still intentionally incomplete:

- meal review/edit correction after the first USDA match
- live Supabase integration tests and end-to-end UI tests
- VM-era private backend split for richer LLM-assisted parsing
- production deployment infrastructure beyond pre-VM guidance and CI

## Run the web app

- `corepack pnpm install`
- `corepack pnpm dev`
- open `apps/web` through the default Next.js dev server started by the root script

## Key environment variables

Frontend and backend flows depend on:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for service-role workflows when needed later
- `USDA_API_KEY` for live USDA FoodData Central lookup; without it, the app falls back to the local demo food catalog

Why this matters:

- auth redirects and magic-link return paths need the site URL
- the current protected frontend uses Supabase auth and server-side user resolution
- meal logging quality improves with the live USDA key, but the app remains usable in pre-VM/demo mode without it

## Test baseline

Current verification commands:

- `corepack pnpm build`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`

Current coverage is intentionally focused on stable app behavior that should block obviously broken commits:

- profile and goals validation plus service branching behavior
- meal parsing and meal logging contracts
- daily, weekly, and monthly summary aggregation behavior
- API route normalization and service delegation for meal logging and daily summary reads
- date and range utilities that drive summary windows

Still worth adding later:

- repository tests against a real Supabase test database
- authenticated end-to-end API tests
- UI interaction tests for the dashboard, forms, and summary views
- USDA live API contract tests behind controlled fixtures

## Security gate

Before sharing a public demo URL, complete `docs/security/public-demo-baseline.md` and `docs/security/pr-checklist.md`.
