# Nutrition App Foundation

## 1. App folder structure

```text
apps/
  web/
    src/
      app/
        (auth)/login
        (app)/dashboard
        (app)/profile
        (app)/goals
        (app)/meals/new
        api/
          profile
          goals
          meals
          summary/daily
          summary/weekly
          summary/monthly
          webhooks/auth
      lib/
        config
        supabase
      server/
        adapters/
          ollama
          usda
        contracts
        repositories
        services
        validation
packages/
  shared/
docs/
  architecture/
infra/
  ci
  docker
  k8s
```

## 2. Architecture rules

- keep all config env-driven
- use Next.js for UI plus server endpoints in the pre-VM phase
- keep DB access behind repository and service boundaries
- keep USDA behind one adapter client
- keep Ollama behind one adapter interface with a no-op implementation for now
- keep all macro calculations in deterministic service code, never in the LLM path
- make deployment concerns live in `infra/*`, not in app logic

## 3. Runtime split later

Pre-VM:

- Next.js app hosts pages, route handlers, and service orchestration
- Supabase provides auth and Postgres
- USDA is called from a server-side adapter
- LLM adapter is stubbed

Later VM split:

- a private backend fronts Ollama
- Next.js app calls that backend through the same `LLMAdapter` contract
- summary and nutrition math stay in app/backend services, not in Ollama

## 4. Frontend shape now

The current web frontend is intentionally built on top of the same app structure rather than introducing a separate frontend stack.

- route groups still separate public auth screens from authenticated app screens
- the dashboard, profile, goals, meal logging, weekly summary, and monthly summary pages are real app screens now
- page rendering stays server-first where it depends on current user or summary data
- client components are mainly used for forms, optimistic UI messages, and active navigation state

Why keep it this way in pre-VM:

- the repo already centralizes business logic in services and route handlers, so frontend work should expose that logic instead of duplicating it
- keeping summary and logging flows server-backed makes later VM extraction safer because the frontend surface can remain stable while internals move
