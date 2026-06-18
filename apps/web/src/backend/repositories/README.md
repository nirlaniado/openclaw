# Repository boundary

Repositories are the only layer allowed to talk directly to Supabase tables.

- services orchestrate auth, validation, repositories, and adapters
- repositories map persisted rows into domain-friendly shapes
- UI, route handlers, and future jobs should never query tables directly
