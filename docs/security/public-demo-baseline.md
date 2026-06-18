# Public Demo Security Baseline

This baseline applies before the nutrition app is deployed on a VM or exposed to a public demo URL.

## Current Security Shape

- The app is a Next.js web app using Supabase Auth and Postgres.
- API routes call `requireUser()` before profile, meal, and summary access.
- Supabase migrations enable row-level security for profiles, goals, meals, meal items, and daily summaries.
- Profile and meal service contracts already use Zod validation before writes.
- The app still needs explicit public-demo signoff because nutrition data is personal health-adjacent data.

## Public Demo Gate

Public demo is blocked unless all of these are true:

- Demo Supabase project uses sanitized or synthetic data only.
- No production, personal, or imported local fitness database is connected.
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, and provider API keys are server-only and absent from browser bundles.
- Supabase RLS policies are enabled and verified for every table containing user data.
- All demo users are test accounts with disposable email addresses.
- Route handlers require authenticated users before returning profile, meals, goals, or summaries.
- Logs do not include meal text, body metrics, access tokens, refresh tokens, cookies, or raw request bodies.
- Rate limits are in place at the hosting edge or reverse proxy before sharing a public URL.
- The PR checklist in `docs/security/pr-checklist.md` is complete.

Local demos on `localhost` are allowed with developer data, but screen sharing should treat profile, meal text, and body metrics as sensitive.

## Auth And Data Exposure Notes

- Keep the anonymous Supabase key public only for browser client access; it is not a server secret.
- Never expose the Supabase service role key to client components, `NEXT_PUBLIC_*` variables, logs, screenshots, or error payloads.
- Prefer server-side access through authenticated Supabase clients for user-owned data.
- If cookie-backed sessions are used for state-changing routes, avoid cross-origin credentialed access and add CSRF protection before enabling third-party origins.
- Return generic errors to the client for auth, database, and provider failures. Keep detailed diagnostics server-side.

## Input Validation Minimums

Profile writes must enforce:

- display name length caps
- age range
- allowed sex and unit values
- positive height and weight with sane upper bounds before public demo
- valid IANA timezone values before public demo

Meal writes must enforce:

- meal text length caps
- allowed meal type values
- valid datetime input
- locale length caps
- per-user write throttles before public demo

The existing Zod contracts cover the first pass. Public demo approval should add or verify the remaining range and timezone constraints.

## Rate Limit Minimums

Before public exposure, enforce at the edge or API layer:

- Auth routes: provider default plus IP throttling.
- Profile updates: 10 requests per minute per user.
- Meal creation: 20 requests per minute per user and 60 per hour per user.
- Summary reads: 60 requests per minute per user.
- External USDA/LLM calls: bounded concurrency and timeout controls.

Requests over the limit should return `429` without logging request bodies.

## Secret And Environment Rules

- `.env*` files stay local and are ignored, except `.env.example`.
- `NEXT_PUBLIC_*` values must be treated as public.
- Server-only secrets must not use the `NEXT_PUBLIC_` prefix.
- `.env.example` may contain variable names and harmless local defaults only.
- Supabase service role credentials are for server-side maintenance paths only and should not be needed for normal user traffic.
- Rotate any key that appears in git history, chat, screenshots, logs, or browser output.

## Approval Decision

- Approved now: local development and private walkthroughs.
- Blocked now: public demo with real user data or production credentials.
- Fastest safe demo path: create a fresh Supabase demo project, seed synthetic data, configure disposable auth users, verify RLS, add edge rate limits, and complete the PR checklist.
