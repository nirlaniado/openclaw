# Docker Notes

The current focus is only the web frontend image path.

What exists now:

- `apps/web/Dockerfile` builds the Next app as a standalone runtime image
- the app build remains env-driven so secrets and environment-specific endpoints stay outside the image
- the workspace root is used as the Docker build context because `apps/web` depends on the shared workspace package

Why it is structured this way:

- the frontend should be deployable later as its own image without bundling unrelated infra concerns
- standalone output keeps the runtime smaller and clearer than shipping the full workspace install
- tracing from the workspace root ensures the future image boundary still works when shared code lives outside `apps/web`

Current boundaries:

- no database or Supabase containers are introduced here
- no VM/private-backend container path is added yet
- this is a frontend-app image path only, not a full production stack
