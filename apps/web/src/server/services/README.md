# Service boundary

Primary services for Sprint 1:

- `auth-service`
- `profile-service`
- `goals-service`
- `meal-log-service`
- `summary-service`

Each service should:

- accept validated DTOs
- call repositories and adapters
- own transaction boundaries where needed
- return app-facing results without leaking Supabase details
