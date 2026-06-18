# Nutrition App Foundation

Pre-VM foundation for a portable nutrition tracking app built with:

- `Next.js`
- `Supabase Postgres + Auth`
- `USDA FoodData Central`
- future `Ollama` integration behind a private backend

## Workspace shape

- `apps/web`: Next.js app shell, routes, server actions, API endpoints
- `packages/shared`: shared contracts, types, DTOs, and constants
- `docs/architecture`: app structure, data model, service boundaries, MVP screens
- `docs/security`: public-demo gate, PR checklist, and environment guidance
- `infra/ci`: CI notes/placeholders
- `infra/docker`: container placeholders for later
- `infra/k8s`: Kubernetes placeholders for later

## Current phase

This repo is intentionally focused on design and app foundation:

- app folder structure
- data model proposal
- API and service boundary proposal
- screen map for MVP
- Sprint 1 implementation order

Deep feature implementation comes next after the foundation is approved.

## Test baseline

Current verification commands:

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
