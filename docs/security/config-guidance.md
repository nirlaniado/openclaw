# Security Config Guidance

## Environment Variables

| Variable | Scope | Rule |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | Public | Safe for browser output. |
| `NEXT_PUBLIC_SITE_URL` | Public | Must match the local or demo origin. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Browser-safe project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Browser-safe only when RLS is correct. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server secret | Do not expose to client code; avoid in user request paths. |
| `SUPABASE_DB_URL` | Server secret | Local migrations/admin only; never log. |
| `USDA_API_KEY` | Server secret | Server-side provider calls only. |
| `OLLAMA_BASE_URL` | Server config | Keep private for local or internal model endpoints. |
| `OLLAMA_MODEL` | Server config | No secret value expected. |
| `LLM_PROVIDER` | Server config | Use `stub` for public demo until abuse controls exist. |
| `LOG_LEVEL` | Server config | Public demo should use `info`, `warn`, or `error`; avoid `debug`. |

## Local Development

Copy `.env.example` to a local `.env` file and fill values outside git. The root `.gitignore` intentionally ignores `.env*` while allowing `.env.example`.

Do not reuse a personal Supabase project for public demos. Use a separate project with disposable auth users and synthetic nutrition data.

## Public Demo Defaults

- `LLM_PROVIDER=stub` unless the demo has rate limits and provider spend controls.
- Use a demo-only Supabase project.
- Keep service role and database URL unset in the web runtime unless a server-only maintenance task needs them.
- Configure hosting-level HTTPS and rate limits before sharing a URL.
