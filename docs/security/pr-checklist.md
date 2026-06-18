# Security PR Checklist

Use this checklist for nutrition app PRs that touch auth, profiles, meals, summaries, provider integrations, deployment, or demo configuration.

## Data And Demo Safety

- [ ] PR does not commit `.env*`, database dumps, local SQLite files, Supabase backups, logs, private keys, or generated credentials.
- [ ] Public-demo data is synthetic or sanitized.
- [ ] Screenshots and docs do not expose real meal text, body metrics, email addresses, tokens, cookies, or provider keys.
- [ ] Any new table containing user data has RLS enabled before merge.

## Auth And Authorization

- [ ] User-owned API routes require an authenticated user before reading or writing data.
- [ ] Queries are scoped by `user.id` or protected by matching RLS policies.
- [ ] No route exposes another user's profile, meals, goals, summaries, or identifiers.
- [ ] Service role access is not used in normal browser-driven request paths.

## Input Validation

- [ ] Profile writes use contract validation and sane bounds for age, height, weight, timezone, and units.
- [ ] Meal writes cap text length and validate meal type, datetime, locale, and timezone.
- [ ] Numeric nutrition fields reject negative, infinite, `NaN`, and unrealistic values.
- [ ] Malformed JSON and invalid payloads return `400` without raw stack traces.

## Abuse Controls

- [ ] Public routes have edge or API rate limits appropriate to their cost and sensitivity.
- [ ] Provider calls to USDA, LLMs, or other external systems have timeouts and bounded retries.
- [ ] Logs avoid request bodies and sensitive user payloads.
- [ ] Error responses are generic enough for public users.

## Secrets And Config

- [ ] Server-only secrets do not use `NEXT_PUBLIC_`.
- [ ] `.env.example` contains no real values.
- [ ] New environment variables are documented with public/server-only classification.
- [ ] Any leaked or accidentally committed secret is rotated, not merely deleted.

## Public Demo Approval

- [ ] `docs/security/public-demo-baseline.md` gate is satisfied.
- [ ] Demo deployment uses HTTPS.
- [ ] Demo auth uses disposable accounts.
- [ ] RLS was manually checked against at least two separate demo users.
- [ ] Rate limits are enabled before sharing the URL.
