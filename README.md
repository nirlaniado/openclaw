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
