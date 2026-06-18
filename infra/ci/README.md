# Nutrition App CI/CD

Scope: pre-VM only. The current app is a pnpm workspace with a Next.js web app in `apps/web` and shared TypeScript contracts in `packages/shared`.

## Branch And PR Flow

- Keep `main` deployable.
- Base feature branches on the current app foundation branch until it is merged.
- Use short-lived branches named like `feature/<change>`, `ci/<change>`, or `<owner>/<change>`.
- Open a PR before merging into `main`.
- PRs should include what changed, how it was checked, and the local preview result.

## Required Checks

GitHub Actions runs `.github/workflows/nutrition-app-ci.yml` on PRs and on pushes to `main` when app, shared package, workspace, CI, or workflow files change.

Blocking checks:

- Install: `corepack pnpm install --frozen-lockfile`
- Lint: `corepack pnpm lint`
- Typecheck: `corepack pnpm typecheck`
- Test: `corepack pnpm test`
- Build: `corepack pnpm build`

CI sets only non-secret placeholder public env values:

- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=ci-anon-key`
- `LLM_PROVIDER=stub`

## Preview Expectations

Pre-VM has no persistent preview deployment yet.

For app PRs:

- Run `corepack pnpm dev`.
- Open `http://localhost:3000`.
- Check the changed route or flow locally.
- Add a screenshot or local preview note when UI behavior changes.
- Do not require Supabase service-role access for preview.

When a preview host is added later, the PR should include the preview URL before merge.

## Secret Handling

- No CI secrets are required for the current pre-VM checks.
- Do not commit `.env` files, Supabase service-role keys, USDA API keys, cookies, tokens, or private user nutrition data.
- Keep `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, and `USDA_API_KEY` out of pull request workflows unless a later deployment design explicitly requires them.
- Use GitHub environment secrets for future deployments, not repository files.
- Forked PRs must not receive deployment or database write credentials.

## Merge Blockers For V1

Block merge if any of these are true:

- CI fails.
- The production build fails locally or in CI.
- A route, API handler, repository, or contract changes without a relevant test or clear reason why a test is deferred.
- Supabase schema changes are not documented in `apps/web/supabase/migrations`.
- New env vars are not documented in this file or app config.
- New dependencies are added without a short reason in the PR.
- A change can write, expose, or delete user nutrition data without an explicit recovery or rollback path.

## Dependency And Security Scanning

- Dependabot watches npm workspace dependencies and GitHub Actions weekly.
- Dependency Review runs on PRs and is non-blocking during the foundation phase.
- Promote Dependency Review to blocking before real user data or paid infrastructure is connected.
